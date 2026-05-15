"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Card3D from "@/components/ui/Card3D";

type MFASetupResponse = {
  qr: string;
  secret: string;
  otpauthUrl: string;
};

export default function SecurityPage() {
  const { data, update, status } = useSession();
  const user = data?.user as any;

  // ================= STATE =================
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  // 🔐 FIX: proper secure password fields
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [qr, setQr] = useState("");
  const [secret, setSecret] = useState("");
  const [mfaCode, setMfaCode] = useState("");

  const [loading, setLoading] = useState(false);

  // 🔐 request lock (prevents double submission)
  const [submitting, setSubmitting] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // ================= SYNC SESSION =================
  useEffect(() => {
    if (!user) return;

    setName(user.name || "");
    setEmail(user.email || "");
  }, [user]);

  const reset = () => {
    setError("");
    setMessage("");
  };

  // ======================================================
  // PROFILE UPDATE
  // ======================================================
  async function updateProfile() {
    if (submitting) return;
    setSubmitting(true);
    reset();

    try {
      const res = await fetch("/api/user/update-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error || "PROFILE_UPDATE_FAILED");
        return;
      }

      setMessage("Profile updated successfully");

      await update({ name, email });
    } catch {
      setError("NETWORK_ERROR");
    } finally {
      setSubmitting(false);
    }
  }

  // ======================================================
  // PASSWORD CHANGE (SECURE FIX)
  // ======================================================
  async function changePassword() {
    if (submitting) return;
    setSubmitting(true);
    reset();

    try {
      const res = await fetch("/api/user/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error || "PASSWORD_CHANGE_FAILED");
        return;
      }

      setMessage("Password updated successfully");

      setCurrentPassword("");
      setNewPassword("");

      await update();
    } catch {
      setError("NETWORK_ERROR");
    } finally {
      setSubmitting(false);
    }
  }

  // ======================================================
  // MFA SETUP
  // ======================================================
  async function setupMFA() {
    if (submitting) return;
    setSubmitting(true);
    reset();

    try {
      const res = await fetch("/api/mfa/setup", {
        method: "POST",
      });

      const json: MFASetupResponse = await res.json();

      if (!res.ok) {
        setError("MFA_SETUP_FAILED");
        return;
      }

      setQr(json.qr);
      setSecret(json.secret);
    } catch {
      setError("NETWORK_ERROR");
    } finally {
      setSubmitting(false);
    }
  }

  // ======================================================
  // ENABLE MFA
  // ======================================================
  async function enableMFA() {
    if (submitting) return;
    setSubmitting(true);
    reset();

    try {
      const res = await fetch("/api/mfa/enable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: mfaCode }),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error || "INVALID_MFA_CODE");
        return;
      }

      setMessage("MFA enabled successfully");

      setQr("");
      setSecret("");
      setMfaCode("");

      await update({
        mfaEnabled: true,
        mfaSetupRequired: false,
      });
    } catch {
      setError("NETWORK_ERROR");
    } finally {
      setSubmitting(false);
    }
  }

  // ======================================================
  // DISABLE MFA
  // ======================================================
  async function disableMFA() {
    if (submitting) return;
    setSubmitting(true);
    reset();

    try {
      const res = await fetch("/api/mfa/disable", {
        method: "POST",
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error || "MFA_DISABLE_FAILED");
        return;
      }

      setMessage("MFA disabled successfully");

      setQr("");
      setSecret("");
      setMfaCode("");

      await update({
        mfaEnabled: false,
        mfaSetupRequired: false,
      });
    } catch {
      setError("NETWORK_ERROR");
    } finally {
      setSubmitting(false);
    }
  }

  // ================= LOADING =================
  if (status === "loading") {
    return (
      <div className="max-w-4xl mx-auto p-6 text-white">
        <Card3D>
          <div className="text-white/60">Loading security center...</div>
        </Card3D>
      </div>
    );
  }

  // ================= UI =================
  return (
    <div className="max-w-4xl mx-auto p-6 text-white space-y-6">

      <Card3D>
        <h1 className="text-2xl font-semibold">Security Center</h1>
        <p className="text-sm text-white/50 mt-1">
          Manage authentication and account security.
        </p>
      </Card3D>

      {error && (
        <Card3D>
          <p className="text-red-300 text-sm">{error}</p>
        </Card3D>
      )}

      {message && (
        <Card3D>
          <p className="text-green-300 text-sm">{message}</p>
        </Card3D>
      )}

      {/* PROFILE */}
      <Card3D>
        <h2 className="font-semibold mb-3">Profile</h2>

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-3 bg-black/40 border border-white/10 rounded-lg"
          placeholder="Name"
        />

        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 mt-2 bg-black/40 border border-white/10 rounded-lg"
          placeholder="Email"
        />

        <button
          onClick={updateProfile}
          disabled={submitting}
          className="w-full mt-3 py-2 rounded-lg bg-cyan-500/20 border border-cyan-500/30 disabled:opacity-50"
        >
          Update Profile
        </button>
      </Card3D>

      {/* PASSWORD */}
      <Card3D>
        <h2 className="font-semibold mb-3">Password Security</h2>

        <input
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          placeholder="Current Password"
          className="w-full p-3 bg-black/40 border border-white/10 rounded-lg"
        />

        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="New Password"
          className="w-full mt-2 p-3 bg-black/40 border border-white/10 rounded-lg"
        />

        <button
          onClick={changePassword}
          disabled={submitting}
          className="w-full mt-3 py-2 rounded-lg bg-purple-500/20 border border-purple-500/30 disabled:opacity-50"
        >
          Change Password
        </button>
      </Card3D>

      {/* MFA */}
      <Card3D>
        <h2 className="font-semibold mb-3">MFA Security</h2>

        <div className="flex justify-between text-sm mb-3">
          <span>Status</span>
          <span className={user?.mfaEnabled ? "text-green-400" : "text-red-400"}>
            {user?.mfaEnabled ? "Enabled" : "Disabled"}
          </span>
        </div>

        <div className="flex gap-3">
          {!user?.mfaEnabled && (
            <button
              onClick={setupMFA}
              disabled={submitting}
              className="flex-1 py-2 bg-cyan-500/20 border border-cyan-500/30 rounded-lg disabled:opacity-50"
            >
              Enable MFA
            </button>
          )}

          {user?.mfaEnabled && (
            <button
              onClick={disableMFA}
              disabled={submitting}
              className="flex-1 py-2 bg-red-500/20 border border-red-500/30 rounded-lg disabled:opacity-50"
            >
              Disable MFA
            </button>
          )}
        </div>

        {qr && (
          <div className="space-y-4 pt-4 border-t border-white/10">
            <img src={qr} className="w-40 h-40 mx-auto" />

            <div className="text-xs text-green-300 break-all font-mono">
              {secret}
            </div>

            <input
              value={mfaCode}
              onChange={(e) => setMfaCode(e.target.value)}
              className="w-full p-3 bg-black/40 border border-white/10 rounded-lg"
              placeholder="6-digit code"
            />

            <button
              onClick={enableMFA}
              disabled={submitting}
              className="w-full py-2 bg-green-500/20 border border-green-500/30 rounded-lg disabled:opacity-50"
            >
              Confirm MFA
            </button>
          </div>
        )}
      </Card3D>
    </div>
  );
}
