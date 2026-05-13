"use client";

import { motion } from "framer-motion";

export default function TrustStrip() {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      className="grid grid-cols-2 md:grid-cols-4 text-center py-16 max-w-5xl mx-auto"
    >
      {[
        ["10K+", "Students"],
        ["50+", "Countries"],
        ["1:1", "Mentorship"],
        ["24/7", "Support"]
      ].map(([a, b], i) => (
        <div key={i}>
          <div className="text-2xl font-bold">{a}</div>
          <div className="text-gray-400 text-sm">{b}</div>
        </div>
      ))}
    </motion.section>
  );
}
