/**
 * SESSION BINDING SYSTEM
 * ----------------------
 * Locks session to device fingerprint + user agent hash.
 */

import crypto from "crypto";

export function createSessionBinding({
  userId,
  fingerprint,
  userAgent,
}: any) {
  return crypto
    .createHash("sha256")
    .update(`${userId}:${fingerprint}:${userAgent}`)
    .digest("hex");
}

export function verifySessionBinding({
  sessionHash,
  userId,
  fingerprint,
  userAgent,
}: any) {
  const expected = createSessionBinding({
    userId,
    fingerprint,
    userAgent,
  });

  return sessionHash === expected;
}
