"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export default function SecurityPage() {
  const { data, update } = useSession();

  const user = data?.user as any;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [qr, setQr] = useState("");
  const [mfaCode, setMfaCode] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // sync session user
  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
    }
  }, [user]);

  // =========================
  // PROFILE UPDATE
  // =========================
  async function updateProfile() {
    setLoading(true);
    setError("");
    setMessage("");

    const res = await fetch("/api/user/update-profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email }),
    });

    const data = await res.json();

    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Failed to update profile");
      return;
    }

    setMessage("Profile updated successfully");
    update(); // refresh session
  }

  // =========================
  // PASSWORD CHANGE
  // =========================
  async function changePassword() {
    setLoading(true);
    setError("");
    setMessage("");

    const res = await fetch("/api/user/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    const data = await res.json();

    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Failed to change password");
      return;
    }

    setMessage("Password changed successfully");
    setPassword("");
  }

  // =========================
  // MFA SETUP (GET QR)
  // =========================
  async function setupMFA() {
    setLoading(true);
    setError("");
    setMessage("");

    const res = await fetch("/api/mfa/setup", {
      method: "POST",
    });

    const data = await res.json();

    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Failed to setup MFA");
      return;
    }

    setQr(data.qr);
  }

  // =========================
  // ENABLE MFA
  // =========================
  async function enableMFA() {
    setLoading(true);
    setError("");
    setMessage("");

    const res = await fetch("/api/mfa/enable", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: mfaCode }),
    });

    const data = await res.json();

    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Invalid MFA code");
      return;
    }

    setMessage("MFA enabled successfully");
    setQr("");
    setMfaCode("");
    update();
  }

  return (
    <div className="max-w-3xl mx-auto p-6 text-white space-y-8">

      {/* HEADER */}
      <div>
        <h1 className="text-xl font-bold">Security Settings</h1>

        {error && (
          <p className="text-red-400 text-sm mt-2">{error}</p>
        )}

        {message && (
          <p className="text-green-400 text-sm mt-2">{message}</p>
        )}
      </div>

      {/* PROFILE */}
      <div className="space-y-3 p-4 border border-white/10 rounded-xl">
        <h2 className="font-semibold">Profile</h2>

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-3 bg-black/40 border border-white/10"
          placeholder="Name"
        />

        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 bg-black/40 border border-white/10"
          placeholder="Email"
        />

        <button
          onClick={updateProfile}
          disabled={loading}
          className="btn-3d w-full"
        >
          Update Profile
        </button>
      </div>

      {/* PASSWORD */}
      <div className="space-y-3 p-4 border border-white/10 rounded-xl">
        <h2 className="font-semibold">Password</h2>

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 bg-black/40 border border-white/10"
          placeholder="New Password"
        />

        <button
          onClick={changePassword}
          disabled={loading}
          className="btn-3d w-full"
        >
          Change Password
        </button>
      </div>

      {/* MFA SECTION */}
      <div className="space-y-3 p-4 border border-white/10 rounded-xl">
        <h2 className="font-semibold">Multi-Factor Authentication (MFA)</h2>

        <p className="text-sm text-white/70">
          Status:{" "}
          <span className={user?.mfaEnabled ? "text-green-400" : "text-red-400"}>
            {user?.mfaEnabled ? "Enabled" : "Disabled"}
          </span>
        </p>

        {!user?.mfaEnabled && (
          <button
            onClick={setupMFA}
            className="text-cyan-400 hover:text-cyan-300 text-sm"
          >
            Enable MFA (Google Authenticator)
          </button>
        )}

        {/* QR DISPLAY */}
        {qr && (
          <div className="mt-4 space-y-3">
            <p className="text-sm text-white/70">
              Scan this QR with Google Authenticator
            </p>

            <img src={qr} className="w-40 h-40" />

            <input
              value={mfaCode}
              onChange={(e) => setMfaCode(e.target.value)}
              className="w-full p-3 bg-black/40 border border-white/10"
              placeholder="Enter 6-digit code"
            />

            <button
              onClick={enableMFA}
              className="btn-3d w-full"
            >
              Confirm MFA
            </button>
          </div>
        )}
      </div>

      {/* ADMIN PANEL */}
      {user?.role === "ADMIN" && (
        <div className="p-4 border border-red-500/30 rounded-xl">
          <p className="text-red-400 font-semibold">
            Admin Security Panel
          </p>

          <p className="text-xs text-white/60 mt-2">
            MFA is mandatory for admin accounts. First login requires setup.
          </p>

          {!user?.mfaEnabled && (
            <p className="text-yellow-400 text-xs mt-2">
              ⚠ Admin account must enable MFA immediately
            </p>
          )}
        </div>
      )}

    </div>
  );
}
