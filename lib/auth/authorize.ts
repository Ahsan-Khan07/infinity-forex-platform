/**
 * AUTH CONTROLLER (NEXTAUTH ENTRY LAYER)
 * --------------------------------------
 * ONLY forwards request to service layer.
 */

import { loginService } from "@/services/auth/login.service";

export async function authorizeUser(credentials: any) {
  const email = credentials?.email?.trim().toLowerCase();
  const password = credentials?.password;

  if (!email || !password) return null;

  return await loginService({
    email,
    password,
    credentials,
  });
}
