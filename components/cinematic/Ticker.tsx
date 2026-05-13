"use client";

export default function Ticker() {
  return (
    <div className="w-full overflow-hidden border-b border-white/10 bg-black/40 text-xs text-gray-400 py-2">
      <div className="animate-pulse whitespace-nowrap">
        EUR/USD +0.12% • GBP/USD -0.03% • XAU/USD +0.45% • BTC/USD +1.02% • Market Liquidity Stable •
      </div>
    </div>
  );
}
