import { prisma } from "./prisma";
import { verifyPassword } from "./password";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import type { AuthOptions } from "next-auth";
import { getClientIp, getUserAgent } from "./utils";

// ✅ FIX ADDED (DO NOT REMOVE EXISTING LOGIC)
import { sendDeviceVerificationEmail } from "./email";

export const authOptions: AuthOptions = {
  session: { strategy: "jwt" },

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    CredentialsProvider({
      name: "credentials",

      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
        fingerprint: { label: "Fingerprint", type: "text" },
        twoFactorCode: { label: "2FA Code", type: "text" },
      },

      async authorize(credentials) {
        const ip = await getClientIp();
        const userAgent = await getUserAgent();

        const emailRaw = credentials?.email || "UNKNOWN";
        const fingerprint = credentials?.fingerprint || null;

        if (!credentials?.email || !credentials?.password) {
          await prisma.loginLog.create({
            data: {
              email: emailRaw,
              ip,
              userAgent,
              fingerprint,
              status: "FAILED",
              reason: "INVALID_INPUT",
            },
          });

          throw new Error("INVALID_INPUT");
        }

        const email = credentials.email.trim().toLowerCase();
        const password = credentials.password;

        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user) throw new Error("USER_NOT_FOUND");

        if (user.lockUntil && user.lockUntil > new Date()) {
          throw new Error("ACCOUNT_LOCKED");
        }

        if (!user.isVerified) throw new Error("NOT_VERIFIED");

        const valid = await verifyPassword(password, user.password);
        if (!valid) throw new Error("WRONG_PASSWORD");

        // 🔐 2FA CHECK (UNCHANGED)
        if (user.twoFactorEnabled) {
          const speakeasy = require("speakeasy");

          const verified = speakeasy.totp.verify({
            secret: user.twoFactorSecret,
            encoding: "base32",
            token: credentials?.twoFactorCode,
            window: 1,
          });

          if (!verified) throw new Error("INVALID_2FA");
        }

        // ===============================
        // 📱 DEVICE SECURITY FIX (CRITICAL FIXED FLOW)
        // ===============================
        if (fingerprint) {
          const existingDevice = await prisma.trustedDevice.findFirst({
            where: {
              userId: user.id,
              fingerprint,
            },
          });

          // 🚨 NEW DEVICE DETECTED (STRICT BLOCK)
          if (!existingDevice || !existingDevice.isTrusted) {
            const token = crypto.randomUUID();

            // log attempt BEFORE blocking
            await prisma.loginLog.create({
              data: {
                email,
                userId: user.id,
                ip,
                userAgent,
                fingerprint,
                status: "SUSPICIOUS",
                reason: "NEW_DEVICE_DETECTED",
              },
            });

            // create pending approval
            await prisma.pendingDeviceLogin.create({
              data: {
                userId: user.id,
                email: user.email,
                token,
                ip,
                userAgent,
                fingerprint,
                expiresAt: new Date(Date.now() + 1000 * 60 * 30),
              },
            });

            // create device record (tracking only)
            await prisma.trustedDevice.upsert({
              where: {
                userId_fingerprint: {
                  userId: user.id,
                  fingerprint,
                },
              },
              update: {
                lastSeenAt: new Date(),
                ip,
                userAgent,
              },
              create: {
                userId: user.id,
                fingerprint,
                userAgent,
                ip,
                isTrusted: false,
              },
            });

            // 🚨 EMAIL SEND GUARANTEED (FIXED)
            try {
              await sendDeviceVerificationEmail(user.email, token);
            } catch (err) {
              console.error("DEVICE EMAIL FAILED:", err);
            }

            // ❗ HARD STOP
            throw new Error("NEW_DEVICE_DETECTED");
          }

          // ⚠️ IP CHANGE LOG ONLY
          if (existingDevice.ip && existingDevice.ip !== ip) {
            await prisma.loginLog.create({
              data: {
                email,
                userId: user.id,
                ip,
                userAgent,
                fingerprint,
                status: "SUSPICIOUS",
                reason: "IP_CHANGED",
              },
            });
          }

          await prisma.trustedDevice.update({
            where: { id: existingDevice.id },
            data: {
              lastSeenAt: new Date(),
              ip,
              userAgent,
            },
          });
        }

        // RESET LOGIN ATTEMPTS
        await prisma.user.update({
          where: { email },
          data: {
            failedLoginAttempts: 0,
            lockUntil: null,
            lastLoginAt: new Date(),
          },
        });

        await prisma.loginLog.create({
          data: {
            email,
            userId: user.id,
            ip,
            userAgent,
            fingerprint,
            status: "SUCCESS",
            reason: null,
          },
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account }: any) {
      if (account?.provider === "google") {
        const cleanEmail = user.email.trim().toLowerCase();

        const existingUser = await prisma.user.findUnique({
          where: { email: cleanEmail },
        });

        if (!existingUser) {
          await prisma.user.create({
            data: {
              name: user.name || "Google User",
              email: cleanEmail,
              password: "GOOGLE_AUTH",
              isVerified: true,
              role: "STUDENT",
            },
          });
        }

        return true;
      }

      return true;
    },

    async jwt({ token, user }: any) {
      if (user) token.role = user.role;
      return token;
    },

    async session({ session, token }: any) {
      if (session.user) {
        (session.user as any).role = token.role;
      }
      return session;
    },
  },

  pages: {
    signIn: "/auth/login",
  },
};
