"use client";

import Logo from "@/components/Logo";
import { motion } from "framer-motion";

export default function Loading() {
  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: [0.8, 1.1, 1], opacity: 1 }}
        transition={{ 
          duration: 0.8,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut"
        }}
        className="flex flex-col items-center gap-4"
      >
        <Logo iconOnly size={100} />
        <div className="flex gap-1">
          <motion.div
            animate={{ scale: [1, 1.5, 1] }}
            transition={{ repeat: Infinity, duration: 1, delay: 0 }}
            className="w-2 h-2 rounded-full bg-brand-teal"
          />
          <motion.div
            animate={{ scale: [1, 1.5, 1] }}
            transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
            className="w-2 h-2 rounded-full bg-brand-purple"
          />
          <motion.div
            animate={{ scale: [1, 1.5, 1] }}
            transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
            className="w-2 h-2 rounded-full bg-brand-magenta"
          />
        </div>
        <p className="text-sm font-medium brand-gradient-text animate-pulse">
          Preparando seu ambiente...
        </p>
      </motion.div>
    </div>
  );
}
