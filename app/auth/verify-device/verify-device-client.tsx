"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function VerifyDeviceClient() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState("Verifying device...");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function verify() {
      if (!token) {
        setStatus("Invalid verification link.");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch("/api/auth/verify-device", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        const data = await res.json();

        if (!res.ok) {
          setStatus(data.error || "Verification failed.");
        } else {
          setStatus("Device verified successfully. You can now login.");
        }
      } catch {
        setStatus("Something went wrong.");
      } finally {
        setLoading(false);
      }
    }

    verify();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white p-10">
      <div className="max-w-md w-full bg-white/5 border border-white/10 p-8 rounded-2xl text-center">
        <h1 className="text-2xl font-bold mb-4">Verify Device</h1>

        <p className="text-gray-300">{status}</p>

        {!loading && (
          <a
            href="/auth/login"
            className="inline-block mt-6 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 font-semibold"
          >
            Go to Login
          </a>
        )}
      </div>
    </div>
  );
}
