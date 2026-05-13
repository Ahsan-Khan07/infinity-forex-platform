import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { loginService } from "@/modules/auth/core/auth.service";
import { prisma } from "@/lib/prisma";

export const authConfig: NextAuthOptions = {
  session: {
    strategy: "jwt",
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
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const result = await loginService(
          credentials.email,
          credentials.password
        );

        if (!result.success || !result.user) {
          return null;
        }

        return {
          id: result.user.id,
          email: result.user.email,
          role: result.user.role,
          sessionVersion: result.user.sessionVersion,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id;
        token.email = (user as any).email;
        token.role = (user as any).role;
        token.sessionVersion = (user as any).sessionVersion;
      }

      if (token?.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email as string },
          select: { sessionVersion: true },
        });

        if (!dbUser || dbUser.sessionVersion !== token.sessionVersion) {
          return token; // safer than breaking JWT
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).email = token.email;
        (session.user as any).role = token.role;
        (session.user as any).sessionVersion = token.sessionVersion;
      }

      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};
