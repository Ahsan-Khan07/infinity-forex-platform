/**
 * NEXTAUTH CONFIG (ENTERPRISE SINGLE SOURCE OF TRUTH)
 * ---------------------------------------------------
 * This file centralizes ALL authentication configuration:
 *
 * - Credentials provider
 * - Session strategy
 * - Callbacks
 * - Security pipeline integration
 *
 * ⚠️ RULE:
 * This file must be the ONLY place NextAuth is configured.
 */

import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import { authorizeUser } from "./authorize";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  /**
   * =====================================================
   * SESSION STRATEGY
   * =====================================================
   * JWT is used for scalability + stateless sessions
   */
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  },

  /**
   * =====================================================
   * AUTH PROVIDERS
   * =====================================================
   */
  providers: [
    CredentialsProvider({
      name: "Credentials",

      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
        fingerprint: { label: "Fingerprint", type: "text" },
        twoFactorCode: { label: "2FA Code", type: "text" },
      },

      async authorize(credentials) {
        return await authorizeUser(credentials);
      },
    }),
  ],

  /**
   * =====================================================
   * CALLBACKS (SESSION ENRICHMENT)
   * =====================================================
   */
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.sessionVersion = (user as any).sessionVersion;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).sessionVersion = token.sessionVersion;
      }

      return session;
    },
  },

  /**
   * =====================================================
   * SECURITY OPTIONS
   * =====================================================
   */
  pages: {
    signIn: "/auth/login",
  },

  secret: process.env.NEXTAUTH_SECRET,

  debug: process.env.NODE_ENV === "development",
};
