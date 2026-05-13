import { loginService } from "@/modules/auth/core/auth.service";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import speakeasy from "speakeasy";
import { decrypt } from "@/lib/crypto";

/**
 * FINTECH-GRADE AUTH CONFIG (HARDENED)
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

      async authorize(credentials) {
        const email = credentials?.email?.trim().toLowerCase();
        const password = credentials?.password;
        const fingerprint = credentials?.fingerprint || "unknown-device";
        const twoFactorCode = credentials?.twoFactorCode;

        if (!email || !password) {
          throw new Error("INVALID_INPUT");
        }

        /**
         * 1. FETCH USER (ONLY ONCE)
         */
        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user) throw new Error("USER_NOT_FOUND");

        /**
         * 2. ACCOUNT STATUS CHECK
         */
        if (user.status !== "ACTIVE") {
          throw new Error("ACCOUNT_LOCKED");
        }

        /**
         * 3. EMAIL VERIFICATION
         */
        if (!user.isVerified) {
          throw new Error("NOT_VERIFIED");
        }

        /**
         * 4. PASSWORD CHECK
         */
        const validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword) {
          throw new Error("WRONG_PASSWORD");
        }

        /**
         * 5. MFA VALIDATION (ONLY IF ENABLED)
         */
        if (user.mfaEnabled) {
          if (!twoFactorCode) {
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

          const isValid = speakeasy.totp.verify({
            secret,
            encoding: "base32",
            token: twoFactorCode,
            window: 2,
          });

          if (!isValid) {
            throw new Error("INVALID_2FA");
          }
        }

        /**
         * 6. ADMIN MFA ENFORCEMENT (SAFE LOGIC)
         */
        const isAdmin = user.role === "ADMIN";

        if (isAdmin && !user.mfaEnabled && !user.mfaSetupRequired) {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              mfaSetupRequired: true,
            },
          });
        }

        /**
         * 7. DEVICE TRACKING (SAFE UPDATE)
         */
        await prisma.user.update({
          where: { id: user.id },
          data: {
            lastLoginFingerprint: fingerprint,
            lastLoginAt: new Date(),
          },
        });

        /**
         * 8. SAFE RETURN OBJECT
         */
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
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id;
        token.name = (user as any).name;
        token.email = (user as any).email;
        token.role = (user as any).role;
        token.sessionVersion = (user as any).sessionVersion;
        token.mfaEnabled = (user as any).mfaEnabled;
        token.mfaSetupRequired = (user as any).mfaSetupRequired;
      }

      /**
       * SESSION VALIDATION (FAST PATH)
       */
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
          return {} as any;
        }

        token.mfaEnabled = dbUser.mfaEnabled;
        token.mfaSetupRequired = dbUser.mfaSetupRequired;
      }

      return token;
    },

    async session({ session, token }) {
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
