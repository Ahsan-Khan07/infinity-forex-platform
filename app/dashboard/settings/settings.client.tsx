"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";

export default function SettingsClient() {
  const { data: session } = useSession();

  const [tab, setTab] = useState<
    "profile" | "password" | "mfa" | "sessions" | "history"
  >("profile");

  return (
    <div className="max-w-5xl mx-auto px-6 pt-28 pb-20">
      <h1 className="text-3xl font-bold text-white">Account Settings</h1>
      <p className="text-gray-400 mt-2">
        Manage your profile, password, MFA security, sessions and audit history.
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          onClick={() => setTab("profile")}
          className={`px-4 py-2 rounded-lg border text-sm ${
            tab === "profile"
              ? "bg-cyan-500/20 border-cyan-500/40 text-cyan-300"
              : "border-white/10 text-gray-400 hover:bg-white/5"
          }`}
        >
          Profile
        </button>

        <button
          onClick={() => setTab("password")}
          className={`px-4 py-2 rounded-lg border text-sm ${
            tab === "password"
              ? "bg-cyan-500/20 border-cyan-500/40 text-cyan-300"
              : "border-white/10 text-gray-400 hover:bg-white/5"
          }`}
        >
          Password
        </button>

        <button
          onClick={() => setTab("mfa")}
          className={`px-4 py-2 rounded-lg border text-sm ${
            tab === "mfa"
              ? "bg-cyan-500/20 border-cyan-500/40 text-cyan-300"
              : "border-white/10 text-gray-400 hover:bg-white/5"
          }`}
        >
          MFA Security
        </button>

        <button
          onClick={() => setTab("sessions")}
          className={`px-4 py-2 rounded-lg border text-sm ${
            tab === "sessions"
              ? "bg-cyan-500/20 border-cyan-500/40 text-cyan-300"
              : "border-white/10 text-gray-400 hover:bg-white/5"
          }`}
        >
          Active Sessions
        </button>

        <button
          onClick={() => setTab("history")}
          className={`px-4 py-2 rounded-lg border text-sm ${
            tab === "history"
              ? "bg-cyan-500/20 border-cyan-500/40 text-cyan-300"
              : "border-white/10 text-gray-400 hover:bg-white/5"
          }`}
        >
          Login History
        </button>
      </div>

      <div className="mt-10 card-3d p-8">
        {tab === "profile" && <ProfileSettings />}
        {tab === "password" && <PasswordSettings />}
        {tab === "mfa" && <MFASettings />}
        {tab === "sessions" && <SessionsSettings />}
        {tab === "history" && <LoginHistory />}
      </div>

      <div className="mt-6 text-xs text-gray-500">
        User ID:{" "}
        <span className="text-cyan-400 font-mono">
          {(session?.user as any)?.id || "N/A"}
        </span>
      </div>
    </div>
  );
}

/* ==========================================================
   PROFILE SETTINGS
========================================================== */
function ProfileSettings() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSave() {
    setLoading(true);
    setMessage("");

    const res = await fetch("/api/user/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email }),
    });

    const data = await res.json();

    setLoading(false);

    if (!res.ok) {
      setMessage(data.error || "Failed to update profile");
      return;
    }

    setMessage("Profile updated successfully");
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-white">Profile</h2>
      <p className="text-gray-400 text-sm mt-1">
        Update your personal identity information.
      </p>

      <div className="mt-6 space-y-4">
        <input
          placeholder="Full Name"
          className="w-full p-3 rounded-xl bg-black/40 border border-white/10 text-white"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          placeholder="Email Address"
          className="w-full p-3 rounded-xl bg-black/40 border border-white/10 text-white"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {message && (
          <div className="text-sm text-cyan-300 bg-cyan-500/10 p-3 rounded-lg border border-cyan-500/20">
            {message}
          </div>
        )}

        <button onClick={handleSave} disabled={loading} className="btn-3d">
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}

/* ==========================================================
   PASSWORD SETTINGS
========================================================== */
function PasswordSettings() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleChangePassword() {
    setLoading(true);
    setMessage("");

    const res = await fetch("/api/user/password", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ oldPassword, newPassword }),
    });

    const data = await res.json();

    setLoading(false);

    if (!res.ok) {
      setMessage(data.error || "Failed to change password");
      return;
    }

    setMessage("Password updated successfully");
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-white">Change Password</h2>
      <p className="text-gray-400 text-sm mt-1">
        Always use a strong password. Avoid reusing old passwords.
      </p>

      <div className="mt-6 space-y-4">
        <input
          placeholder="Current Password"
          type="password"
          className="w-full p-3 rounded-xl bg-black/40 border border-white/10 text-white"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
        />

        <input
          placeholder="New Password"
          type="password"
          className="w-full p-3 rounded-xl bg-black/40 border border-white/10 text-white"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />

        {message && (
          <div className="text-sm text-cyan-300 bg-cyan-500/10 p-3 rounded-lg border border-cyan-500/20">
            {message}
          </div>
        )}

        <button
          onClick={handleChangePassword}
          disabled={loading}
          className="btn-3d"
        >
          {loading ? "Updating..." : "Update Password"}
        </button>
      </div>
    </div>
  );
}

/* ==========================================================
   MFA SETTINGS
========================================================== */
function MFASettings() {
  const [qr, setQr] = useState("");
  const [secret, setSecret] = useState("");
  const [code, setCode] = useState("");

  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleGenerate() {
    setLoading(true);
    setMessage("");

    const res = await fetch("/api/user/mfa/setup", { method: "POST" });
    const data = await res.json();

    setLoading(false);

    if (!res.ok) {
      setMessage(data.error || "Failed to generate MFA");
      return;
    }

    setQr(data.qr);
    setSecret(data.secret);
  }

  async function handleEnable() {
    setLoading(true);
    setMessage("");

    const res = await fetch("/api/user/mfa/enable", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setMessage(data.error || "Failed to enable MFA");
      return;
    }

    setEnabled(true);
    setMessage("MFA Enabled successfully");
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-white">Multi-Factor Auth (MFA)</h2>
      <p className="text-gray-400 text-sm mt-1">
        Secure your account with Google Authenticator / Authy.
      </p>

      <div className="mt-6 space-y-4">
        <button onClick={handleGenerate} disabled={loading} className="btn-3d">
          {loading ? "Generating..." : "Generate MFA QR Code"}
        </button>

        {qr && (
          <div className="p-4 border border-white/10 rounded-xl bg-black/30">
            <img src={qr} className="w-44 h-44 mx-auto" alt="MFA QR" />

            <p className="text-xs text-gray-400 mt-3 text-center">
              Manual Key:{" "}
              <span className="text-cyan-400 font-mono">{secret}</span>
            </p>
          </div>
        )}

        {qr && (
          <>
            <input
              placeholder="Enter 6-digit MFA code"
              className="w-full p-3 rounded-xl bg-black/40 border border-white/10 text-white"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />

            <button onClick={handleEnable} disabled={loading} className="btn-3d">
              {loading ? "Enabling..." : "Enable MFA"}
            </button>
          </>
        )}

        {message && (
          <div className="text-sm text-cyan-300 bg-cyan-500/10 p-3 rounded-lg border border-cyan-500/20">
            {message}
          </div>
        )}
      </div>
    </div>
  );
}

/* ==========================================================
   SESSIONS SETTINGS (placeholder UI)
========================================================== */
function SessionsSettings() {
  return (
    <div>
      <h2 className="text-xl font-semibold text-white">Active Sessions</h2>
      <p className="text-gray-400 text-sm mt-1">
        Soon you will be able to logout all devices and manage sessions.
      </p>
    </div>
  );
}

/* ==========================================================
   LOGIN HISTORY (placeholder UI)
========================================================== */
function LoginHistory() {
  return (
    <div>
      <h2 className="text-xl font-semibold text-white">Login History</h2>
      <p className="text-gray-400 text-sm mt-1">
        Soon you will see your login attempts with device + IP logs.
      </p>
    </div>
  );
}
