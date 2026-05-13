"use client";

import { motion } from "framer-motion";

const items = [
  {
    title: "Institutional Learning",
    desc: "Market structure, liquidity, execution logic"
  },
  {
    title: "Risk Engineering",
    desc: "Capital preservation before profit expansion"
  },
  {
    title: "Mentorship Layer",
    desc: "1:1 guidance from experienced traders"
  }
];

export default function Features() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-32">

      <motion.h2
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-3xl font-semibold text-center mb-16"
      >
        Why serious traders choose us
      </motion.h2>

      <div className="grid md:grid-cols-3 gap-6">

        {items.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.05, rotateX: 5 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="card-3d p-6"
          >
            <h3 className="text-white font-semibold mb-2">
              {item.title}
            </h3>
            <p className="text-gray-400 text-sm">
              {item.desc}
            </p>
          </motion.div>
        ))}

      </div>
    </section>
  );
}
