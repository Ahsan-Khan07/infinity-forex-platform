"use client";

export default function AIOrb() {
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="w-14 h-14 rounded-full bg-cyan-400/20 blur-xl animate-pulse" />
      <div className="absolute inset-0 flex items-center justify-center text-xs">
        AI
      </div>
    </div>
  );
}
