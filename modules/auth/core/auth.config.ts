import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import speakeasy from "speakeasy";

import { prisma } from "@/lib/prisma";
import { decrypt } from "@/lib/crypto";
import { prismaRetry } from "@/lib/prisma-retry";
import {
  getIpFromHeaders,
  getUserAgentFromHeaders,
} from "@/modules/auth/core/auth.utils";

/**
 * FINTECH-GRADE AUTH CONFIG (PRODUCTION HARDENED)
 */
export const authConfig: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24, // 1 day
  },

  pages: {
    signIn: "/auth/login",
  },

  providers: [
    CredentialsProvider({
      name: "InfinityFinance",

      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        fingerprint: { label: "Fingerprint", type: "text" },
        twoFactorCode: { label: "2FA Code", type: "text" },
      },

      async authorize(credentials, req) {
        const email = credentials?.email?.trim().toLowerCase();
        const password = credentials?.password;
        const fingerprint = credentials?.fingerprint || "unknown-device";
        const twoFactorCode = credentials?.twoFactorCode;

        if (!email || !password) {
          throw new Error("INVALID_INPUT");
        }

        // NextAuth headers are not always native Headers object
        const safeHeaders =
          req?.headers instanceof Headers
            ? req.headers
            : new Headers((req?.headers as Record<string, string>) || {});

        const ip = getIpFromHeaders(safeHeaders);
        const userAgent = getUserAgentFromHeaders(safeHeaders);

        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user) {
          await prisma.loginLog.create({
            data: {
              email,
              ip,
              userAgent,
              fingerprint,
              status: "FAILED",
              reason: "USER_NOT_FOUND",
            },
          });

          throw new Error("USER_NOT_FOUND");
        }

        if (user.status !== "ACTIVE") {
          await prisma.loginLog.create({
            data: {
              email,
              userId: user.id,
              ip,
              userAgent,
              fingerprint,
              status: "LOCKED",
              reason: "ACCOUNT_LOCKED",
            },
          });

          throw new Error("ACCOUNT_LOCKED");
        }

        if (user.lockUntil && user.lockUntil > new Date()) {
          await prisma.loginLog.create({
            data: {
              email,
              userId: user.id,
              ip,
              userAgent,
              fingerprint,
              status: "LOCKED",
              reason: "TEMP_LOCKED",
            },
          });

          throw new Error("ACCOUNT_LOCKED");
        }

        if (!user.isVerified) {
          await prisma.loginLog.create({
            data: {
              email,
              userId: user.id,
              ip,
              userAgent,
              fingerprint,
              status: "FAILED",
              reason: "NOT_VERIFIED",
            },
          });

          throw new Error("NOT_VERIFIED");
        }

        const validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword) {
          const attempts = (user.failedLoginAttempts || 0) + 1;
          const lockAccount = attempts >= 5;

          const lockUntil = lockAccount
            ? new Date(Date.now() + 15 * 60 * 1000)
            : null;

          await prismaRetry(() =>
            prisma.user.update({
              where: { id: user.id },
              data: {
                failedLoginAttempts: attempts,
                lastFailedLogin: new Date(),
                lockUntil,
              },
            })
          );

          await prisma.loginLog.create({
            data: {
              email,
              userId: user.id,
              ip,
              userAgent,
              fingerprint,
              status: lockAccount ? "LOCKED" : "FAILED",
              reason: "WRONG_PASSWORD",
            },
          });

          throw new Error("WRONG_PASSWORD");
        }

        // MFA Validation
        if (user.mfaEnabled) {
          if (!twoFactorCode) {
            await prisma.loginLog.create({
              data: {
                email,
                userId: user.id,
                ip,
                userAgent,
                fingerprint,
                status: "TWO_FA_REQUIRED",
                reason: "MFA_REQUIRED",
              },
            });

            throw new Error("MFA_REQUIRED");
          }

          if (!user.mfaSecret) {
            throw new Error("MFA_SECRET_MISSING");
          }

          let secret: string;

          try {
            secret = decrypt(user.mfaSecret);
          } catch {
            throw new Error("MFA_DECRYPT_FAILED");
          }

          const verified = speakeasy.totp.verify({
            secret,
            encoding: "base32",
            token: twoFactorCode,
            window: 2,
          });

          if (!verified) {
            await prisma.loginLog.create({
              data: {
                email,
                userId: user.id,
                ip,
                userAgent,
                fingerprint,
                status: "FAILED",
                reason: "INVALID_2FA",
              },
            });

            throw new Error("INVALID_2FA");
          }
        }

        // Admin MFA enforcement (allow one login then force setup)
        const isAdmin = user.role === "ADMIN";

        if (isAdmin && !user.mfaEnabled && !user.mfaSetupRequired) {
          await prismaRetry(() =>
            prisma.user.update({
              where: { id: user.id },
              data: { mfaSetupRequired: true },
            })
          );
        }

        // Successful login update
        await prismaRetry(() =>
          prisma.user.update({
            where: { id: user.id },
            data: {
              failedLoginAttempts: 0,
              lockUntil: null,
              lastLoginFingerprint: fingerprint,
              lastLoginIp: ip,
              lastLoginAt: new Date(),
            },
          })
        );

        // User visible login history
        await prisma.loginHistory.create({
          data: {
            userId: user.id,
            ip,
            fingerprint,
            userAgent,
            device: userAgent,
            success: true,
          },
        });

        // Security login log
        await prisma.loginLog.create({
          data: {
            email,
            userId: user.id,
            ip,
            userAgent,
            fingerprint,
            status: "SUCCESS",
            reason: "LOGIN_SUCCESS",
          },
        });

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          sessionVersion: user.sessionVersion,
          mfaEnabled: user.mfaEnabled,
          mfaSetupRequired: isAdmin
            ? user.mfaSetupRequired || !user.mfaEnabled
            : false,
        };
      },
    }),
  ],

  callbacks: {
    /**
     * JWT Callback
     * Handles login + realtime session update (trigger update)
     */
    async jwt({ token, user, trigger, session }) {
      // first login
      if (user) {
        token.id = (user as any).id;
        token.name = (user as any).name;
        token.email = (user as any).email;
        token.role = (user as any).role;
        token.sessionVersion = (user as any).sessionVersion;
        token.mfaEnabled = (user as any).mfaEnabled;
        token.mfaSetupRequired = (user as any).mfaSetupRequired;
      }

      // 🔥 FIX: allow frontend update() to instantly update token
      if (trigger === "update" && session) {
        token.name = (session as any).name ?? token.name;
        token.email = (session as any).email ?? token.email;
        token.mfaEnabled = (session as any).mfaEnabled ?? token.mfaEnabled;
        token.mfaSetupRequired =
          (session as any).mfaSetupRequired ?? token.mfaSetupRequired;
      }

      // validate against DB (sessionVersion)
      if (token?.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email as string },
          select: {
            sessionVersion: true,
            mfaEnabled: true,
            mfaSetupRequired: true,
          },
        });

        if (!dbUser || dbUser.sessionVersion !== token.sessionVersion) {
          token.invalid = true;
          return token;
        }

        token.mfaEnabled = dbUser.mfaEnabled;
        token.mfaSetupRequired = dbUser.mfaSetupRequired;
      }

      return token;
    },

    /**
     * Session Callback
     * Exposes token -> frontend session
     */
    async session({ session, token }) {
      if (token.invalid) {
        return null as any;
      }

      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).name = token.name;
        (session.user as any).email = token.email;
        (session.user as any).role = token.role;
        (session.user as any).sessionVersion = token.sessionVersion;
        (session.user as any).mfaEnabled = token.mfaEnabled;
        (session.user as any).mfaSetupRequired = token.mfaSetupRequired;
      }

      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};
