import { Role } from "@prisma/client";

/**
 * AUTH DOMAIN TYPES
 * ------------------
 * Central type definitions for authentication module.
 * Fully aligned with Prisma schema (single source of truth).
 */

export interface AuthUser {
  id: string;
  email: string;
  role: Role;
  sessionVersion: number;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResult {
  success: boolean;
  user?: AuthUser;
  error?: string;
}
