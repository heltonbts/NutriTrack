"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1 },
};

export function AnimatedStatsContainer({ children, className }: { children: ReactNode, className?: string }) {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className={className || "grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4"}
    >
      {children}
    </motion.div>
  );
}

export function AnimatedStatItem({ children }: { children: ReactNode }) {
  return <motion.div variants={item}>{children}</motion.div>;
}
