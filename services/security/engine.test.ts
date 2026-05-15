import assert from "assert";
import { SecurityPolicyEngine } from "./engine";
import { SecurityContext } from "./types";

const mockCtx = (overrides: Partial<SecurityContext> = {}): SecurityContext => ({
  userId: "user-123",
  action: "CHANGE_PASSWORD",
  ...overrides,
});

let passed = 0;
let failed = 0;

async function runTest(name: string, fn: () => Promise<void>) {
  try {
    await fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (e) {
    console.log(`  ✗ ${name}`);
    console.log(`    Error: ${e}`);
    failed++;
  }
}

async function main() {
  console.log("SecurityPolicyEngine Tests");
  console.log("=".repeat(40));

  console.log("\nPassword Policy:");
  await runTest("should allow strong password change", async () => {
    const ctx = mockCtx({
      action: "CHANGE_PASSWORD",
      payload: { currentPassword: "OldPass123!", newPassword: "NewStr0ng@Pass" },
    });
    const result = await SecurityPolicyEngine(ctx);
    assert(["ALLOW", "MFA_REQUIRED"].includes(result.decision));
  });

  await runTest("should block weak password", async () => {
    const ctx = mockCtx({
      action: "CHANGE_PASSWORD",
      payload: { currentPassword: "OldPass123!", newPassword: "password123" },
    });
    const result = await SecurityPolicyEngine(ctx);
    assert.strictEqual(result.decision, "BLOCK");
    assert.strictEqual(result.reason, "COMMON_PASSWORD_NOT_ALLOWED");
  });

  await runTest("should block password shorter than 10 characters", async () => {
    const ctx = mockCtx({
      action: "CHANGE_PASSWORD",
      payload: { currentPassword: "OldPass123!", newPassword: "Short1!" },
    });
    const result = await SecurityPolicyEngine(ctx);
    assert.strictEqual(result.decision, "BLOCK");
  });

  await runTest("should block password without complexity requirements", async () => {
    const ctx = mockCtx({
      action: "CHANGE_PASSWORD",
      payload: { currentPassword: "OldPass123!", newPassword: "nopunctuation123ABC" },
    });
    const result = await SecurityPolicyEngine(ctx);
    assert.strictEqual(result.decision, "BLOCK");
  });

  await runTest("should block when currentPassword is missing", async () => {
    const ctx = mockCtx({
      action: "CHANGE_PASSWORD",
      payload: { newPassword: "NewStr0ng@Pass" },
    });
    const result = await SecurityPolicyEngine(ctx);
    assert.strictEqual(result.decision, "BLOCK");
    assert.strictEqual(result.reason, "MISSING_FIELDS");
  });

  console.log("\nEmail Policy:");
  await runTest("should allow valid email change", async () => {
    const ctx = mockCtx({ action: "CHANGE_EMAIL", payload: { email: "newemail@example.com" } });
    const result = await SecurityPolicyEngine(ctx);
    assert(["ALLOW", "MFA_REQUIRED"].includes(result.decision));
  });

  await runTest("should block invalid email format", async () => {
    const ctx = mockCtx({ action: "CHANGE_EMAIL", payload: { email: "not-an-email" } });
    const result = await SecurityPolicyEngine(ctx);
    assert.strictEqual(result.decision, "BLOCK");
    assert.strictEqual(result.reason, "INVALID_EMAIL");
  });

  await runTest("should block disposable email domains", async () => {
    const ctx = mockCtx({ action: "CHANGE_EMAIL", payload: { email: "user@tempmail.com" } });
    const result = await SecurityPolicyEngine(ctx);
    assert.strictEqual(result.decision, "BLOCK");
    assert.strictEqual(result.reason, "DISPOSABLE_EMAIL_NOT_ALLOWED");
  });

  await runTest("should block when email is missing", async () => {
    const ctx = mockCtx({ action: "CHANGE_EMAIL", payload: {} });
    const result = await SecurityPolicyEngine(ctx);
    assert.strictEqual(result.decision, "BLOCK");
    assert.strictEqual(result.reason, "MISSING_EMAIL");
  });

  console.log("\nName Policy:");
  await runTest("should allow valid name change", async () => {
    const ctx = mockCtx({ action: "CHANGE_NAME", payload: { name: "John Doe" } });
    const result = await SecurityPolicyEngine(ctx);
    assert.strictEqual(result.decision, "ALLOW");
  });

  await runTest("should block name with special characters", async () => {
    const ctx = mockCtx({ action: "CHANGE_NAME", payload: { name: "John <script>" } });
    const result = await SecurityPolicyEngine(ctx);
    assert.strictEqual(result.decision, "BLOCK");
    assert.strictEqual(result.reason, "NAME_FORMAT_INVALID");
  });

  await runTest("should block name too short", async () => {
    const ctx = mockCtx({ action: "CHANGE_NAME", payload: { name: "A" } });
    const result = await SecurityPolicyEngine(ctx);
    assert.strictEqual(result.decision, "BLOCK");
    assert.strictEqual(result.reason, "NAME_LENGTH_INVALID");
  });

  await runTest("should block name too long", async () => {
    const ctx = mockCtx({ action: "CHANGE_NAME", payload: { name: "A".repeat(51) } });
    const result = await SecurityPolicyEngine(ctx);
    assert.strictEqual(result.decision, "BLOCK");
    assert.strictEqual(result.reason, "NAME_LENGTH_INVALID");
  });

  console.log("\nMFA Policy:");
  await runTest("should allow ENABLE_MFA", async () => {
    const ctx = mockCtx({ action: "ENABLE_MFA" });
    const result = await SecurityPolicyEngine(ctx);
    assert.strictEqual(result.decision, "ALLOW");
  });

  await runTest("should allow DISABLE_MFA", async () => {
    const ctx = mockCtx({ action: "DISABLE_MFA" });
    const result = await SecurityPolicyEngine(ctx);
    assert.strictEqual(result.decision, "ALLOW");
  });

  console.log("\nRisk Evaluation:");
  await runTest("should require MFA for high risk score (50-79)", async () => {
    const ctx = mockCtx({
      action: "CHANGE_EMAIL",
      payload: { email: "test@example.com" },
      ip: null,
      userAgent: null,
    });
    const result = await SecurityPolicyEngine(ctx);
    assert.strictEqual(result.decision, "MFA_REQUIRED");
  });

  await runTest("should require MFA for very high risk (70+ from missing IP/UA + CHANGE_PASSWORD)", async () => {
    const ctx = mockCtx({
      action: "CHANGE_PASSWORD",
      payload: { currentPassword: "OldPass123!", newPassword: "NewStr0ng@Pass" },
      ip: null,
      userAgent: null,
    });
    const result = await SecurityPolicyEngine(ctx);
    assert.strictEqual(result.decision, "MFA_REQUIRED");
    assert.strictEqual(result.reason, "STEP_UP_AUTH_REQUIRED");
  });

  console.log("\nUnknown Action:");
  await runTest("should block unknown actions", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ctx = { userId: "user-123", action: "UNKNOWN_ACTION" } as any;
    const result = await SecurityPolicyEngine(ctx);
    assert.strictEqual(result.decision, "BLOCK");
    assert.strictEqual(result.reason, "UNKNOWN_ACTION");
  });

  console.log("\n" + "=".repeat(40));
  console.log(`Results: ${passed} passed, ${failed} failed`);

  if (failed > 0) {
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});