import NextAuth from "next-auth";
import { authConfig } from "@/modules/auth/core/auth.config";

const handler = NextAuth(authConfig);

export { handler as GET, handler as POST };
