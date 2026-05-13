"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useAuthModal } from "@/components/auth/auth.store";
import AuthCard from "@/components/AuthCard";

export default function LoginForm() {
  const { close } = useAuthModal();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin() {
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setError("Invalid credentials");
      return;
    }

    if (res?.ok) {
      close();
      window.location.href = "/dashboard";
    }
  }

  return (
    <AuthCard title="Login">
      {error && (
        <p className="text-red-400 text-sm mb-2">{error}</p>
      )}

      <input
        placeholder="Email"
        className="w-full p-3 mb-3 bg-black/40 border border-white/10"
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        className="w-full p-3 mb-3 bg-black/40 border border-white/10"
        onChange={(e) => setPassword(e.target.value)}
      />

      <button
        onClick={handleLogin}
        disabled={loading}
        className="btn-3d w-full"
      >
        {loading ? "Signing in..." : "Login"}
      </button>
    </AuthCard>
  );
}
