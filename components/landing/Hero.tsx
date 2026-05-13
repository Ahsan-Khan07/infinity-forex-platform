"use client";

import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">

      {/* BACKGROUND GLOW */}
      <div className="bg-depth-1 top-[-200px] left-[-200px]" />
      <div className="bg-depth-2 bottom-[-200px] right-[-200px]" />

      {/* MAIN CONTENT */}
      <div className="relative z-10 text-center px-6">

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-5xl md:text-7xl font-bold text-glow"
        >
          The Future of{" "}
          <span className="text-cyan-400">Forex Education</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 text-gray-400 max-w-2xl mx-auto"
        >
          A cinematic learning ecosystem where traders are built through structure,
          discipline, and institutional thinking.
        </motion.p>

      </div>
    </section>
  );
}
