/**
 * AUTH UTILS (NEXTAUTH SAFE)
 * -------------------------
 * NextAuth `authorize()` does NOT provide real `Headers`.
 * It provides Record<string, any> or undefined.
 */

export function getIpFromHeaders(headers?: Headers | Record<string, any>) {
  if (!headers) return "unknown";

  const forwarded =
    headers instanceof Headers
      ? headers.get("x-forwarded-for")
      : headers["x-forwarded-for"];

  const realIp =
    headers instanceof Headers
      ? headers.get("x-real-ip")
      : headers["x-real-ip"];

  const ip =
    forwarded?.split(",")[0]?.trim() ||
    realIp?.toString()?.trim() ||
    "unknown";

  return ip;
}

export function getUserAgentFromHeaders(headers?: Headers | Record<string, any>) {
  if (!headers) return "unknown";

  const ua =
    headers instanceof Headers
      ? headers.get("user-agent")
      : headers["user-agent"];

  return ua?.toString() || "unknown";
}
