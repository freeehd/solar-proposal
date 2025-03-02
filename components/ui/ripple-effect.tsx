"use client";

import { motion } from "framer-motion";

interface RippleEffectProps {
  color?: string;
  size?: number;
  duration?: number;
  delay?: number;
}

export const RippleEffect = ({
  color = "rgba(59, 130, 246, 0.3)",
  size = 100,
  duration = 1,
  delay = 0,
}: RippleEffectProps) => {
  return (
    <motion.div
      className="absolute  pointer-events-none"
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{
        scale: [0.5, 1.5],
        opacity: [0, 0.2, 0],
      }}
      transition={{
        duration,
        delay,
        ease: "easeOut",
      }}
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        backgroundColor: "green",
        zIndex: 40, // Ensure ripple appears above both icon (20) and progress ring (30)
      }}
    />
  );
};
