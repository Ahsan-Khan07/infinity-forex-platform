"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthCard from "@/components/AuthCard";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);
    setError("");

    // 🔴 CLIENT VALIDATION
    if (!name || !email || !password) {
      setError("All fields are required");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        setLoading(false);
        return;
      }

      // success → redirect
      router.push("/auth/login");

    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const disabled = !name || !email || !password || loading;

  return (
    <AuthCard
      title="Create Account"
      description="Start your forex trading journey"
    >
      <form onSubmit={handleRegister} className="space-y-4">

        {error && (
          <div className="text-red-400 text-sm bg-red-500/10 p-2 rounded-lg">
            {error}
          </div>
        )}

        <input
          placeholder="Full Name"
          className="w-full p-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder:text-white/60"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

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
          {loading ? "Creating Account..." : "Register"}
        </button>
      </form>
    </AuthCard>
  );
}
