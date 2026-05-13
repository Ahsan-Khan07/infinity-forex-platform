"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function CTA() {
  return (
    <motion.section
      initial={{ scale: 0.95, opacity: 0 }}
      whileInView={{ scale: 1, opacity: 1 }}
      viewport={{ once: true }}
      className="max-w-5xl mx-auto px-6 py-24 text-center"
    >

      <div className="card-3d p-10">

        <h2 className="text-2xl font-semibold">
          Build real trading discipline — not gambling behavior
        </h2>

        <p className="text-gray-400 mt-4">
          Join structured learning and mentorship system.
        </p>

        <motion.div whileHover={{ scale: 1.05 }}>
          <Link href="/auth/register" className="btn-3d mt-8 inline-block">
            Start Now
          </Link>
        </motion.div>

      </div>

    </motion.section>
  );
}
