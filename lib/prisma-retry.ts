export async function prismaRetry<T>(
  fn: () => Promise<T>,
  retries = 3,
  delayMs = 100
): Promise<T> {
  let lastErr: any;

  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err: any) {
      lastErr = err;

      const msg = err?.message || "";

      // MongoDB write conflict detection
      if (msg.includes("write conflict") || msg.includes("deadlock")) {
        await new Promise((r) => setTimeout(r, delayMs * (i + 1)));
        continue;
      }

      throw err;
    }
  }

  throw lastErr;
}
