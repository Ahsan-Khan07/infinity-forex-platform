"use client";

import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { useAuthModal } from "@/store/auth/auth-modal.store";
import AuthCard from "@/components/AuthCard";

export default function LoginForm() {
  const { close } = useAuthModal();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [fingerprint, setFingerprint] = useState("");

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // ✅ Simple fingerprint (no external lib)
  useEffect(() => {
    const fp =
      navigator.userAgent +
      "|" +
      navigator.language +
      "|" +
      screen.width +
      "x" +
      screen.height +
      "|" +
      Intl.DateTimeFormat().resolvedOptions().timeZone;

    setFingerprint(btoa(fp));
  }, []);

  async function handleLogin() {
    if (loading) return;

    setLoading(true);
    setError("");
    setMessage("");

    try {
      if (!email || !password) {
        setError("Email and password are required");
        setLoading(false);
        return;
      }

      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
        fingerprint: fingerprint || "unknown-device",
        twoFactorCode,
      });

      if (!res) {
        setError("Server error. Please try again.");
        setLoading(false);
        return;
      }

      if (res.error) {
        switch (res.error) {
          case "USER_NOT_FOUND":
            setError("This email is not registered. Please sign up first.");
            break;

          case "NOT_VERIFIED":
            setError("Please verify your email before logging in.");
            break;

          case "WRONG_PASSWORD":
            setError("Incorrect password. Please try again.");
            break;

          case "INVALID_2FA":
            setError("Invalid 2FA code. Please try again.");
            break;

          case "ACCOUNT_LOCKED":
            setError("Account temporarily locked or restricted.");
            break;

          case "NEW_DEVICE_DETECTED":
            setError("New device detected. Please verify login from email.");
            break;

          default:
            setError("Login failed. Please check your credentials.");
        }

        setLoading(false);
        return;
      }

      close();
      window.location.href = "/dashboard";
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    if (googleLoading) return;

    setGoogleLoading(true);
    setError("");
    setMessage("");

    try {
      await signIn("google", {
        callbackUrl: "/dashboard",
      });
    } catch {
      setError("Google login failed.");
    } finally {
      setGoogleLoading(false);
    }
  }

  async function handleResendVerification() {
    if (!email || resendLoading) return;

    setResendLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to resend verification email.");
        return;
      }

      setMessage(data.message || "Verification email sent.");
    } catch {
      setError("Network error.");
    } finally {
      setResendLoading(false);
    }
  }

  return (
    <AuthCard
      title="Welcome Back"
      subtitle="Login to access your trading dashboard"
    >
      <div className="space-y-4">
        {error && (
          <div className="text-red-400 text-sm bg-red-500/10 p-2 rounded-lg border border-red-500/20">
            {error}
          </div>
        )}

        {message && (
          <div className="text-cyan-400 text-sm bg-cyan-500/10 p-2 rounded-lg border border-cyan-500/20">
            {message}
          </div>
        )}

        {/* Google Login */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={googleLoading}
          className={`w-full py-3 rounded-xl font-semibold transition ${
            googleLoading
              ? "bg-gray-600 cursor-not-allowed"
              : "bg-white/10 border border-white/10 hover:bg-white/20"
          }`}
        >
          {googleLoading ? "Connecting..." : "Continue with Google"}
        </button>

        <div className="flex items-center gap-3 my-2">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-xs text-white/40">OR</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        <input
          placeholder="Email"
          className="w-full p-3 rounded-xl bg-black/40 border border-white/10 text-white"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          placeholder="Password"
          type="password"
          className="w-full p-3 rounded-xl bg-black/40 border border-white/10 text-white"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <input
          placeholder="2FA Code (if enabled)"
          className="w-full p-3 rounded-xl bg-black/40 border border-white/10 text-white"
          value={twoFactorCode}
          onChange={(e) => setTwoFactorCode(e.target.value)}
        />

        <div className="flex justify-end mt-1">
          <a
            href="/auth/forgot-password"
            className="text-sm text-cyan-400 hover:text-cyan-300"
          >
            Forgot password?
          </a>
        </div>

        <button
          onClick={handleLogin}
          disabled={!email || !password || loading}
          className={`w-full py-3 rounded-xl font-semibold transition ${
            loading
              ? "bg-gray-600 cursor-not-allowed"
              : "bg-gradient-to-r from-blue-600 to-cyan-500 hover:scale-105"
          }`}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <button
          type="button"
          onClick={handleResendVerification}
          disabled={!email || resendLoading}
          className="w-full text-sm text-cyan-400 hover:text-cyan-300"
        >
          {resendLoading
            ? "Sending..."
            : "Didn’t receive verification email? Resend"}
        </button>
      </div>
    </AuthCard>
  );
}
