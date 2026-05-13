"use client";

import { signOut, useSession } from "next-auth/react";

export default function UserDropdown({
  onClose,
}: {
  onClose: () => void;
}) {
  const { data } = useSession();
  const user = data?.user as any;

  return (
    <div className="absolute right-0 mt-3 w-64 bg-black/90 border border-white/10 rounded-xl p-4 z-50">
      <p className="text-sm text-white font-semibold">{user?.email}</p>

      <div className="mt-2 text-xs text-white/60">
        <p>Role: {user?.role}</p>
        <p>MFA: {user?.mfaEnabled ? "Enabled" : "Disabled"}</p>
      </div>

      <div className="mt-4 flex flex-col gap-2">
        <a href="/dashboard/security" className="text-sm text-cyan-400">
          Security Settings
        </a>

        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="text-sm text-red-400 text-left"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
