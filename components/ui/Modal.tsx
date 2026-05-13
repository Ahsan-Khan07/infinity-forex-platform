"use client";

import { ReactNode } from "react";

export default function Modal({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md p-4">
        <div className="bg-black/60 border border-white/10 rounded-2xl p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-white/60"
          >
            ✕
          </button>

          {children}
        </div>
      </div>
    </div>
  );
}
