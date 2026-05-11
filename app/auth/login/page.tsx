"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import AuthCard from "@/components/AuthCard";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const [error, setError] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

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
      });

      if (!res) {
        setError("Server error. Please try again");
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

          case "INVALID_INPUT":
            setError("Invalid email or password format.");
            break;

          default:
            setError("Invalid email, password, or account not verified.");
        }

        setLoading(false);
        return;
      }

      // ✅ FIX: reliable production redirect (PM2 / VPS safe)
      window.location.href = "/dashboard";

    } catch (err: any) {
      setError(err?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
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

  async function handleResend() {
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
    <AuthCard title="Welcome Back" description="Login to access your trading dashboard">
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

        {/* ✅ ADDED: Forgot Password Link (ONLY CHANGE) */}
        <div className="flex justify-end mt-1">
          <a
            href="/auth/forgot-password"
            className="text-sm text-cyan-400 hover:text-cyan-300"
          >
            Forgot password?
          </a>
        </div>

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

        <button
          type="button"
          onClick={handleResend}
          disabled={!email || resendLoading}
          className="w-full text-sm text-cyan-400 hover:text-cyan-300 mt-2"
        >
          {resendLoading ? "Sending..." : "Didn’t receive verification email? Resend"}
        </button>

      </form>
    </AuthCard>
  );
}
