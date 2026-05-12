import { headers } from "next/headers";

/**
 * Get client IP address from request headers (server-side only)
 */
export async function getClientIp() {
  const h = await headers();

  const forwarded = h.get("x-forwarded-for");

  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  return h.get("x-real-ip") || "unknown";
}

/**
 * Get user agent (server-side safe)
 */
export async function getUserAgent() {
  const h = await headers();

  const userAgent = h.get("user-agent");

  return userAgent || "unknown";
}
