"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";

export default function UserAvatarMenu() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const user = session?.user as any;

  /**
   * SAFETY: prevent rendering before session loads
   */
  if (status === "loading") return null;
  if (!user) return null;

  const name = user?.name || "User";
  const email = user?.email || "unknown@email.com";
  const userId = user?.id || "N/A";
  const role = user?.role || "USER";
  const mfa = user?.mfaEnabled;

  const initials =
    name
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U";

  const shortId = userId !== "N/A" ? userId.slice(0, 8) : "N/A";

  /**
   * CLOSE ON OUTSIDE CLICK
   */
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /**
   * CLOSE ON ESC KEY (FINTECH UX STANDARD)
   */
  useEffect(() => {
    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, []);

  /**
   * COPY USER ID (SAFE + FEEDBACK READY)
   */
  const copyUserId = useCallback(() => {
    if (!userId) return;

    navigator.clipboard.writeText(userId).catch(() => {
      console.warn("Clipboard copy failed");
    });
  }, [userId]);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* AVATAR BUTTON */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2"
      >
        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 flex items-center justify-center text-sm font-bold text-white shadow-lg">
          {initials}
        </div>

        {/* ROLE INDICATOR */}
        <div className="hidden md:block text-left">
          <p className="text-xs text-white/60 leading-tight">
            ID: {shortId}
          </p>
          <p
            className={`text-xs font-semibold ${
              role === "ADMIN" ? "text-red-400" : "text-cyan-400"
            }`}
          >
            {role}
          </p>
        </div>
      </button>

      {/* DROPDOWN */}
      {open && (
        <div className="absolute right-0 mt-3 w-72 rounded-2xl border border-white/10 bg-black/80 backdrop-blur-xl shadow-2xl p-4 z-50">
          {/* HEADER */}
          <div className="flex items-center gap-3 border-b border-white/10 pb-3">
            <div className="w-11 h-11 rounded-full bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center font-bold text-white">
              {initials}
            </div>

            <div className="flex-1">
              <p className="text-white font-semibold leading-tight">{name}</p>
              <p className="text-xs text-gray-400 truncate">{email}</p>

              <div className="flex gap-2 mt-1">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-gray-300">
                  {role}
                </span>

                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full ${
                    mfa
                      ? "bg-green-500/10 text-green-400"
                      : "bg-yellow-500/10 text-yellow-400"
                  }`}
                >
                  {mfa ? "MFA ON" : "MFA OFF"}
                </span>
              </div>
            </div>
          </div>

          {/* USER ID */}
          <div className="mt-3 bg-white/5 border border-white/10 rounded-xl p-3">
            <p className="text-[11px] text-gray-400">User ID</p>

            <div className="flex items-center justify-between mt-1">
              <p className="text-xs text-white truncate">{userId}</p>

              <button
                onClick={copyUserId}
                className="text-xs text-cyan-400 hover:text-cyan-300"
              >
                Copy
              </button>
            </div>
          </div>

          {/* MENU */}
          <div className="mt-4 space-y-2 text-sm">
            <Link
              href="/dashboard/profile"
              className="block px-3 py-2 rounded-xl hover:bg-white/10"
            >
              Profile Settings
            </Link>

            <Link
              href="/dashboard/security"
              className="block px-3 py-2 rounded-xl hover:bg-white/10"
            >
              Security & MFA
            </Link>

            <Link
              href="/dashboard/sessions"
              className="block px-3 py-2 rounded-xl hover:bg-white/10"
            >
              Active Sessions
            </Link>

            <Link
              href="/dashboard/audit"
              className="block px-3 py-2 rounded-xl hover:bg-white/10"
            >
              Login History
            </Link>
          </div>

          {/* LOGOUT */}
          <div className="mt-4 border-t border-white/10 pt-3">
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="w-full px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 hover:bg-red-500/20 text-sm font-semibold"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
