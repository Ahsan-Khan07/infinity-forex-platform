import { prisma } from "./prisma";
import { verifyPassword } from "./password";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import type { AuthOptions } from "next-auth";

export const authOptions: AuthOptions = {
  session: { strategy: "jwt" },

  providers: [
    // ✅ GOOGLE LOGIN PROVIDER
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    CredentialsProvider({
      name: "credentials",

      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        // ❌ HARD SAFE VALIDATION
        if (!credentials?.email || !credentials?.password) {
          throw new Error("INVALID_INPUT");
        }

        const email = credentials.email.trim().toLowerCase();
        const password = credentials.password;

        if (email.length < 5 || password.length < 6) {
          throw new Error("INVALID_INPUT");
        }

        // 🔍 FIND USER
        const user = await prisma.user.findUnique({
          where: { email },
        });

        // 🟥 EMAIL NOT FOUND
        if (!user) {
          throw new Error("USER_NOT_FOUND");
        }

        // 🟨 NOT VERIFIED
        if (!user.isVerified) {
          throw new Error("NOT_VERIFIED");
        }

        // 🔐 PASSWORD CHECK
        const valid = await verifyPassword(password, user.password);

        // 🟧 WRONG PASSWORD
        if (!valid) {
          throw new Error("WRONG_PASSWORD");
        }

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

        if (existingUser && !existingUser.isVerified) {
          await prisma.user.update({
            where: { email: cleanEmail },
            data: {
              isVerified: true,
              verifyToken: null,
              verifyTokenExpiry: null,
            },
          });
        }
      }

      return true;
    },

    async jwt({ token, user }: any) {
      if (user) token.role = user.role;

      if (!token.role && token.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email },
        });

        if (dbUser) token.role = dbUser.role;
      }

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
