"use client";

import { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        return;
      }

      setMessage("If this email exists, reset link has been sent.");
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md p-6 bg-white/5 rounded-xl border border-white/10 space-y-4"
      >
        <h1 className="text-xl font-semibold">Forgot Password</h1>

        {error && (
          <div className="text-red-400 text-sm bg-red-500/10 p-2 rounded">
            {error}
          </div>
        )}

        {message && (
          <div className="text-cyan-400 text-sm bg-cyan-500/10 p-2 rounded">
            {message}
          </div>
        )}

        <input
          placeholder="Enter your email"
          className="w-full p-3 rounded bg-black/40 border border-white/10"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button
          disabled={!email || loading}
          className="w-full py-3 rounded bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600"
        >
          {loading ? "Sending..." : "Send Reset Link"}
        </button>
      </form>
    </div>
  );
}
