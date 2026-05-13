"use client";

import { motion } from "framer-motion";
import { useAuthModal } from "@/store/auth/auth-modal.store";

export default function Navbar() {
  const { open } = useAuthModal();

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="fixed top-0 w-full z-50 backdrop-blur-xl bg-black/40 border-b border-white/10"
    >
      <div className="flex justify-between items-center px-6 py-4 max-w-7xl mx-auto">

        {/* BRAND */}
        <div className="font-semibold text-lg tracking-wide">
          Infinity <span className="text-cyan-400">Finance</span>
        </div>

        {/* NAV LINKS */}
        <nav className="hidden md:flex gap-6 text-sm text-gray-400">
          <a href="#features" className="hover:text-white transition">
            Features
          </a>
          <a href="#trust" className="hover:text-white transition">
            Trust
          </a>
        </nav>

        {/* AUTH ACTIONS */}
        <div className="flex gap-3">

          {/* LOGIN → MODAL */}
          <button
            onClick={() => open("login")}
            className="px-4 py-2 border border-white/10 rounded-lg hover:bg-white/5 transition"
          >
            Login
          </button>

          {/* REGISTER → MODAL */}
          <button
            onClick={() => open("register")}
            className="btn-3d"
          >
            Get Started
          </button>

        </div>

      </div>
    </motion.header>
  );
}
