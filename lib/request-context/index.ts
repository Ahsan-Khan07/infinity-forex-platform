/**
 * Request Context Layer (Enterprise Standard)
 * -------------------------------------------
 * Centralizes request metadata like:
 * - IP address
 * - User-Agent
 * - Device fingerprint
 *
 * This avoids calling `headers()` inside business logic.
 */

import { headers } from "next/headers";

export function getRequestContext() {
  const h = headers();

  return {
    ip:
      h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      h.get("x-real-ip") ||
      "unknown",

    userAgent: h.get("user-agent") || "unknown",
  };
}
