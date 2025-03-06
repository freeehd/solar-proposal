"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface TextRevealProps {
  text: string
  delay?: number
  className?: string
  prefersReducedMotion?: boolean
}

export function TextReveal({ text, delay = 0, className = "", prefersReducedMotion = false }: TextRevealProps) {
  if (prefersReducedMotion) {
    return <span className={cn(" visible", className)}>{text}</span>
  }

  return (
    <span className="overflow-visible relative">
      <motion.span
        className={cn("inline-block", className)}
        initial={{ clipPath: "inset(0 100% 0 0)" }}
        animate={{ clipPath: "inset(0 0% 0 0)" }}
        transition={{
          duration: 0.8,
          delay,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        {text}
      </motion.span>
    </span>
  )
}

