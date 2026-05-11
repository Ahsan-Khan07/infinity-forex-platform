"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";

export default function ResetPasswordClient() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch("/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Invalid token or password");
        return;
      }

      setMessage("Password updated successfully");
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
        <h1 className="text-xl font-semibold">Reset Password</h1>

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
          type="password"
          placeholder="New password"
          className="w-full p-3 rounded bg-black/40 border border-white/10"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          disabled={!password || loading}
          className="w-full py-3 rounded bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600"
        >
          {loading ? "Updating..." : "Reset Password"}
        </button>
      </form>
    </div>
  );
}
