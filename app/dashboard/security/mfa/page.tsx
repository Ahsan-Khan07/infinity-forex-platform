"use client";

import { useState } from "react";

export default function MFASetupPage() {
  const [qr, setQr] = useState("");
  const [code, setCode] = useState("");
  const [manualKey, setManualKey] = useState("");
  const [enabled, setEnabled] = useState(false);

  async function setupMFA() {
    const res = await fetch("/api/mfa/setup", { method: "POST" });
    const data = await res.json();

    setQr(data.qrCode);
    setManualKey(data.manualKey);
  }

  async function enableMFA() {
    const res = await fetch("/api/mfa/enable", {
      method: "POST",
      body: JSON.stringify({ token: code }),
    });

    const data = await res.json();

    if (data.success) {
      setEnabled(true);
    }
  }

  return (
    <div className="p-6 text-white max-w-xl mx-auto">
      <h1 className="text-xl font-bold mb-4">MFA Setup</h1>

      {!qr && (
        <button onClick={setupMFA} className="btn-3d">
          Generate QR Code
        </button>
      )}

      {qr && (
        <>
          <img src={qr} className="w-64 h-64 mt-4" />

          <p className="text-xs mt-2 text-gray-400">
            Manual Key: {manualKey}
          </p>

          <input
            className="w-full p-3 mt-4 bg-black/40 border border-white/10"
            placeholder="Enter 6-digit code"
            onChange={(e) => setCode(e.target.value)}
          />

          <button onClick={enableMFA} className="btn-3d w-full mt-3">
            Enable MFA
          </button>
        </>
      )}

      {enabled && (
        <p className="text-green-400 mt-4">MFA Enabled Successfully</p>
      )}
    </div>
  );
}
