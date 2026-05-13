"use client";

import { useState } from "react";
import { useAuthModal } from "@/components/auth/auth.store";
import AuthCard from "@/components/AuthCard";

export default function RegisterForm() {
  const { openLogin } = useAuthModal();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleRegister() {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
      headers: { "Content-Type": "application/json" },
    });

    if (res.ok) {
      openLogin(); // redirect to login modal
    }
  }

  return (
    <AuthCard title="Create Account">
      <input placeholder="Name" onChange={(e) => setName(e.target.value)} />
      <input placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
      <input type="password" onChange={(e) => setPassword(e.target.value)} />

      <button onClick={handleRegister} className="btn-3d w-full">
        Create Account
      </button>
    </AuthCard>
  );
}
