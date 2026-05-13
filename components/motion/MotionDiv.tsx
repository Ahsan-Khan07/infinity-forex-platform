"use client";

import { motion } from "framer-motion";

export default function MotionDiv({
  children,
  variants,
  className
}: {
  children: React.ReactNode;
  variants: any;
  className?: string;
}) {
  return (
    <motion.div
      variants={variants}
      initial="hidden"
      animate="show"
      className={className}
    >
      {children}
    </motion.div>
  );
}
