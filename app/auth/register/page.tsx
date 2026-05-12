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

  // 🔐 EMAIL VALIDATION (CLIENT SIDE SAFETY)
  function isValidEmail(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  // 🔐 PASSWORD STRENGTH CHECK (MIN FINTECH RULES)
  function isStrongPassword(password: string) {
    return (
      password.length >= 8 &&
      /[A-Z]/.test(password) &&
      /[a-z]/.test(password) &&
      /[0-9]/.test(password)
    );
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);
    setError("");

    // 🔴 CLIENT VALIDATION (HARD SAFETY LAYER)
    if (!name || !email || !password) {
      setError("All fields are required");
      setLoading(false);
      return;
    }

    if (name.trim().length < 3) {
      setError("Name must be at least 3 characters");
      setLoading(false);
      return;
    }

    if (!isValidEmail(email)) {
      setError("Please enter a valid email address");
      setLoading(false);
      return;
    }

    if (!isStrongPassword(password)) {
      setError(
        "Password must contain uppercase, lowercase, number and be 8+ characters"
      );
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed. Please try again.");
        setLoading(false);
        return;
      }

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

        {/* SECURITY NOTE */}
        <div className="text-xs text-green-400 bg-green-500/10 p-2 rounded-lg border border-green-500/20">
          🔐 Secure encrypted registration • Anti-fraud protection enabled
        </div>

        {error && (
          <div className="text-red-400 text-sm bg-red-500/10 p-2 rounded-lg">
            {error}
          </div>
        )}

        <input
          placeholder="Full Name"
          className="w-full p-3 rounded-xl bg-black/40 border border-white/10 text-white"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

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
