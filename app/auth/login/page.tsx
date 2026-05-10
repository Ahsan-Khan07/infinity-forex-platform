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

    // ❌ CLIENT VALIDATION
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

    if (res?.error) {
      setError(res.error);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  async function handleGoogleLogin() {
    setGoogleLoading(true);
    setError("");
    setMessage("");

    await signIn("google", {
      callbackUrl: "/dashboard",
    });

    setGoogleLoading(false);
  }

  async function handleResend() {
    setResendLoading(true);
    setMessage("");
    setError("");

    const res = await fetch("/api/auth/resend-verification", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Something went wrong");
    } else {
      setMessage(data.message);
    }

    setResendLoading(false);
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

        {/* ✅ GOOGLE LOGIN BUTTON */}
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

        {/* Divider */}
        <div className="flex items-center gap-3 my-2">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-xs text-white/40">OR</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        <input
          placeholder="Email"
          className="w-full p-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder:text-white/60"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          placeholder="Password"
          type="password"
          className="w-full p-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder:text-white/60"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

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

        {/* 🔁 RESEND BUTTON */}
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
