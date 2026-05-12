/**
 * SECURITY SERVICE (ENTERPRISE AUTH LAYER v3)
 * --------------------------------------------
 * This is the core authentication security enforcement engine.
 *
 * It acts as a decision pipeline that evaluates:
 * - Fraud risk (behavioral + contextual signals)
 * - Rate limiting (brute force protection)
 * - Two-factor authentication (2FA)
 * - Device trust validation
 * - Geo anomaly detection
 * - Bot/automation detection
 *
 * ⚠️ IMPORTANT DESIGN PRINCIPLE:
 * - This layer NEVER returns HTTP responses
 * - It ONLY throws structured errors
 * - All decisions are enforced BEFORE session creation
 */

import { prisma } from "@/lib/prisma";
import { sendDeviceVerificationEmail } from "@/lib/email";
import { calculateFraudRisk } from "@/services/fraud/risk.engine";
import crypto from "crypto";

import { checkRateLimit } from "@/lib/security/rate-limiter";
import { detectGeoAnomaly } from "@/lib/security/geo-analyzer";
import { calculateBotScore } from "@/lib/security/bot-detector";
import { emitSecurityEvent } from "@/lib/security/security-telemetry";

type SecurityInput = {
  user: any;
  credentials: any;
  ip: string;
  userAgent: string;
};

/**
 * Unified error helper (consistent security failure pattern)
 */
function throwError(code: string) {
  const err: any = new Error(code);
  err.code = code;
  throw err;
}

/**
 * MAIN SECURITY PIPELINE
 */
export async function validateSecurityChecks({
  user,
  credentials,
  ip,
  userAgent,
}: SecurityInput) {
  const fingerprint = credentials?.fingerprint;

  /**
   * =====================================================
   * 0. RATE LIMITING (FIRST LINE OF DEFENSE)
   * =====================================================
   * Prevents brute-force & credential stuffing attacks
   */
  const rate = checkRateLimit(`${user.id}:${ip}`);

  if (!rate.allowed) {
    await emitSecurityEvent({
      userId: user.id,
      action: "RATE_LIMIT_BLOCK",
      ip,
      userAgent,
    });

    throwError("RATE_LIMITED");
  }

  /**
   * =====================================================
   * 1. FRAUD RISK ENGINE (INITIAL CONTEXT ANALYSIS)
   * =====================================================
   */
  const risk = calculateFraudRisk({
    userId: user.id,
    email: user.email,
    ip,
    userAgent,
    fingerprint,
    loginAttempts: user.failedLoginAttempts,
    previousFailures: user.failedLoginAttempts,
    isNewDevice: false,
  });

  if (risk.action === "BLOCK") {
    throwError("ACCOUNT_BLOCKED_RISK");
  }

  if (risk.action === "STEP_UP") {
    throwError("STEP_UP_REQUIRED");
  }

  /**
   * =====================================================
   * 2. TWO-FACTOR AUTHENTICATION (2FA)
   * =====================================================
   */
  if (user.twoFactorEnabled) {
    const speakeasy = require("speakeasy");

    const isValid = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: "base32",
      token: credentials?.twoFactorCode,
      window: 1,
    });

    if (!isValid) {
      await emitSecurityEvent({
        userId: user.id,
        action: "INVALID_2FA",
        ip,
        userAgent,
      });

      throwError("INVALID_2FA");
    }
  }

  /**
   * =====================================================
   * 3. DEVICE VALIDATION LAYER
   * =====================================================
   */
  if (!fingerprint) {
    // Device tracking not available → allow but lower confidence
    return;
  }

  const trustedDevice = await prisma.trustedDevice.findFirst({
    where: {
      userId: user.id,
      fingerprint,
    },
  });

  const isNewDevice = !trustedDevice || !trustedDevice.isTrusted;

  /**
   * =====================================================
   * 4. GEO ANOMALY DETECTION
   * =====================================================
   * Detects unusual location changes (fraud signal)
   */
  const geo = detectGeoAnomaly({
    previousCountry: user.lastCountry,
    currentCountry: ip, // replace with real geo-IP service later
  });

  if (geo.risk === "HIGH") {
    await emitSecurityEvent({
      userId: user.id,
      action: "GEO_ANOMALY",
      ip,
      userAgent,
      metadata: geo,
    });

    throwError("GEO_RISK_BLOCK");
  }

  /**
   * =====================================================
   * 5. FRAUD RISK RE-EVALUATION (DEVICE-AWARE)
   * =====================================================
   */
  const updatedRisk = calculateFraudRisk({
    userId: user.id,
    email: user.email,
    ip,
    userAgent,
    fingerprint,
    loginAttempts: user.failedLoginAttempts,
    previousFailures: user.failedLoginAttempts,
    isNewDevice,
  });

  if (updatedRisk.action === "BLOCK") {
    throwError("ACCOUNT_BLOCKED_RISK");
  }

  if (updatedRisk.action === "STEP_UP") {
    throwError("STEP_UP_REQUIRED");
  }

  /**
   * =====================================================
   * 6. BOT DETECTION (FINAL SECURITY GATE BEFORE LOGIN)
   * =====================================================
   */
  const bot = calculateBotScore({
    userAgent,
    fingerprint,
    loginAttempts: user.failedLoginAttempts,
  });

  if (bot.isBot) {
    await emitSecurityEvent({
      userId: user.id,
      action: "BOT_DETECTED",
      ip,
      userAgent,
      metadata: bot,
    });

    throwError("BOT_ACTIVITY_DETECTED");
  }

  /**
   * =====================================================
   * 7. NEW DEVICE HANDLING FLOW
   * =====================================================
   */
  if (isNewDevice) {
    const token = crypto.randomUUID();

    await prisma.pendingDeviceLogin.create({
      data: {
        userId: user.id,
        email: user.email,
        token,
        ip,
        userAgent,
        fingerprint,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000),
      },
    });

    await sendDeviceVerificationEmail(user.email, token);

    await emitSecurityEvent({
      userId: user.id,
      action: "NEW_DEVICE_DETECTED",
      ip,
      userAgent,
    });

    throwError("NEW_DEVICE_DETECTED");
  }

  /**
   * =====================================================
   * 8. TRUSTED DEVICE UPDATE (SUCCESS PATH)
   * =====================================================
   */
  if (trustedDevice) {
    await prisma.trustedDevice.update({
      where: { id: trustedDevice.id },
      data: {
        lastSeenAt: new Date(),
        ip,
        userAgent,
      },
    });
  }
}
