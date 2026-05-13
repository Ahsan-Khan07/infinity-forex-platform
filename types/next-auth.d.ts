import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "ADMIN" | "USER" | "MENTOR" | "STUDENT";
      sessionVersion: number;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: "ADMIN" | "USER" | "MENTOR" | "STUDENT";
    sessionVersion: number;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "ADMIN" | "USER" | "MENTOR" | "STUDENT";
    sessionVersion: number;
  }
}
