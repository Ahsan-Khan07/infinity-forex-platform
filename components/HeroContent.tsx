"use client";

import { motion } from "framer-motion";

export default function HeroContent() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >

      {/* BADGE */}
      <div className="inline-block px-4 py-1 rounded-full bg-white/5 border border-white/10 text-sm text-blue-300 mb-6">
        🚀 Next-Gen Forex Trading Academy
      </div>

      {/* TITLE */}
      <h1 className="text-5xl md:text-6xl font-extrabold leading-tight">
        Master Forex Trading with{" "}
        <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-purple-500 bg-clip-text text-transparent">
          Real Market Systems
        </span>
      </h1>

      {/* DESCRIPTION */}
      <p className="mt-6 text-white/70 text-lg leading-relaxed">
        Learn professional trading strategies, risk management, and live market execution.
        Join a platform built for real traders — not theory.
      </p>

      {/* CTA */}
      <div className="mt-8 flex gap-4">
        <a
          href="/auth/register"
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500
          hover:scale-105 transition shadow-lg shadow-blue-500/20 font-semibold"
        >
          Join Now
        </a>

        <a
          href="/auth/login"
          className="px-6 py-3 rounded-xl border border-white/10
          hover:border-cyan-400 hover:bg-white/5 transition font-semibold"
        >
          Login
        </a>
      </div>

      {/* STATS */}
      <div className="mt-10 grid grid-cols-3 gap-4 text-center">
        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
          <p className="text-xl font-bold">10K+</p>
          <p className="text-xs text-gray-400">Students</p>
        </div>

        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
          <p className="text-xl font-bold">95%</p>
          <p className="text-xs text-gray-400">Accuracy</p>
        </div>

        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
          <p className="text-xl font-bold">24/7</p>
          <p className="text-xs text-gray-400">Market Access</p>
        </div>
      </div>

    </motion.div>
  );
}
