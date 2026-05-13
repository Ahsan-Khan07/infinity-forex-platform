"use client";

import { useState } from "react";
import { useAuthModal } from "@/components/auth/auth.store";
import AuthCard from "@/components/AuthCard";

export default function RegisterForm() {
  const { open } = useAuthModal();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed");
        return;
      }

      // 🔥 UX FLOW: after register → open login modal
      open("login");
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard title="Create Account">
      <form onSubmit={handleRegister} className="space-y-3">

        {error && (
          <div className="text-red-400 text-sm bg-red-500/10 p-2 rounded">
            {error}
          </div>
        )}

        <input
          placeholder="Full Name"
          className="w-full p-3 bg-black/40 border border-white/10 rounded"
          onChange={(e) => setName(e.target.value)}
        />

        <input
          placeholder="Email"
          className="w-full p-3 bg-black/40 border border-white/10 rounded"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 bg-black/40 border border-white/10 rounded"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          disabled={loading}
          className="btn-3d w-full disabled:opacity-50"
        >
          {loading ? "Creating Account..." : "Create Account"}
        </button>
      </form>
    </AuthCard>
  );
}
