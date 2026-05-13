"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useAuthModal } from "@/store/auth/auth-modal.store";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";

export default function AuthModal() {
  const { mode, close } = useAuthModal();

  return (
    <AnimatePresence>
      {mode && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          
          {/* BACKDROP */}
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
            onClick={close}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* MODAL */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative z-10 w-full max-w-md"
          >
            {mode === "login" && <LoginForm />}
            {mode === "register" && <RegisterForm />}
          </motion.div>

        </div>
      )}
    </AnimatePresence>
  );
}
