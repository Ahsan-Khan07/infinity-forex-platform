import { prisma } from "./prisma";
import { verifyPassword } from "./password";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

export const authOptions = {
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
        // ✅ 1. HARD VALIDATION (STOP BLANK LOGIN)
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        const email = credentials.email.trim().toLowerCase();
        const password = credentials.password;

        if (email.length < 5 || password.length < 6) {
          throw new Error("Invalid credentials format");
        }

        // ✅ 2. FIND USER
        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user) {
          throw new Error("User not found");
        }

        // ❌ EMAIL NOT VERIFIED BLOCK
        if (!user.isVerified) {
          throw new Error("Please verify your email first");
        }

        // ✅ 3. PASSWORD CHECK
        const valid = await verifyPassword(password, user.password);

        if (!valid) {
          throw new Error("Invalid password");
        }

        // ✅ 4. RETURN SAFE USER
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
      // ✅ GOOGLE LOGIN HANDLING
      if (account?.provider === "google") {
        const cleanEmail = user.email.trim().toLowerCase();

        const existingUser = await prisma.user.findUnique({
          where: { email: cleanEmail },
        });

        // ✅ If user does not exist, create new verified user
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

        // ✅ If user exists but not verified, auto verify
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
      if (user) {
        token.role = user.role;
      }

      // ✅ Ensure role exists for Google login users
      if (!token.role && token.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email },
        });

        if (dbUser) {
          token.role = dbUser.role;
        }
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
