"use client";

import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import AuthCard from "@/components/AuthCard";

function generateFingerprint() {
  if (typeof window === "undefined") return "server";

  return btoa(
    navigator.userAgent +
      "|" +
      navigator.language +
      "|" +
      window.screen.width +
      "x" +
      window.screen.height +
      "|" +
      Intl.DateTimeFormat().resolvedOptions().timeZone
  );
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fingerprint, setFingerprint] = useState<string>("");

  const [twoFactorCode, setTwoFactorCode] = useState("");

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const [error, setError] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [message, setMessage] = useState("");

  // ================= SAFE CLIENT FINGERPRINT =================
  useEffect(() => {
    setFingerprint(generateFingerprint());
  }, []);

  // ================= LOGIN =================
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    if (loading) return;

    setLoading(true);
    setError("");
    setMessage("");

    try {
      if (!email || !password) {
        setError("Email and password are required");
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
        setError("Server error. Please try again");
        return;
      }

      if (res.error) {
        switch (res.error) {
          case "USER_NOT_FOUND":
            setError("This email is not registered.");
            break;

          case "NOT_VERIFIED":
            setError("Please verify your email before logging in.");
            break;

          case "WRONG_PASSWORD":
            setError("Incorrect password.");
            break;

          case "INVALID_2FA":
            setError("Invalid 2FA code.");
            break;

          case "ACCOUNT_LOCKED":
            setError("Account temporarily locked.");
            break;

          case "NEW_DEVICE_DETECTED":
            setError("New device detected. Verify login via email.");
            break;

          default:
            setError("Login failed.");
        }

        return;
      }

      window.location.href = "/dashboard";
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  // ================= GOOGLE LOGIN =================
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
      setError("Google login failed");
    } finally {
      setGoogleLoading(false);
    }
  }

  // ================= RESEND EMAIL =================
  async function handleResend() {
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
        setError(data.error || "Failed to resend email");
      } else {
        setMessage(data.message || "Verification email sent");
      }
    } catch {
      setError("Network error");
    } finally {
      setResendLoading(false);
    }
  }

  const disabled = !email || !password || loading;

  return (
    <AuthCard
      title="Welcome Back"
      description="Login to access your trading dashboard"
    >
      <form onSubmit={handleLogin} className="space-y-4">

        {error && (
          <div className="text-red-400 text-sm bg-red-500/10 p-2 rounded-lg">
            {error}
          </div>
        )}

        {message && (
          <div className="text-cyan-400 text-sm bg-cyan-500/10 p-2 rounded-lg">
            {message}
          </div>
        )}

        {/* GOOGLE LOGIN */}
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

        {/* EMAIL */}
        <input
          placeholder="Email"
          className="w-full p-3 rounded-xl bg-black/40 border border-white/10 text-white"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* PASSWORD */}
        <input
          placeholder="Password"
          type="password"
          className="w-full p-3 rounded-xl bg-black/40 border border-white/10 text-white"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {/* 2FA */}
        <input
          placeholder="2FA Code (if enabled)"
          className="w-full p-3 rounded-xl bg-black/40 border border-white/10 text-white"
          value={twoFactorCode}
          onChange={(e) => setTwoFactorCode(e.target.value)}
        />

        <div className="flex justify-end">
          <a
            href="/auth/forgot-password"
            className="text-sm text-cyan-400 hover:text-cyan-300"
          >
            Forgot password?
          </a>
        </div>

        {/* LOGIN BUTTON */}
        <button
          disabled={disabled}
          className={`w-full py-3 rounded-xl font-semibold transition ${
            disabled
              ? "bg-gray-600 cursor-not-allowed"
              : "bg-gradient-to-r from-blue-600 to-cyan-500 hover:scale-105"
          }`}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        {/* RESEND EMAIL */}
        <button
          type="button"
          onClick={handleResend}
          disabled={!email || resendLoading}
          className="w-full text-sm text-cyan-400 hover:text-cyan-300 mt-2"
        >
          {resendLoading
            ? "Sending..."
            : "Didn’t receive verification email? Resend"}
        </button>

      </form>
    </AuthCard>
  );
}