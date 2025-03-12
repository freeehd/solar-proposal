"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { useMediaQuery } from "@/hooks/use-media-query"

interface ImprovedTextRevealProps {
  text: string
  className?: string
  delay?: number
  staggerChildren?: number
}

export function ImprovedTextReveal({
  text,
  className = "",
  delay = 0,
  staggerChildren = 0.02,
}: ImprovedTextRevealProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.5 })
  const isMobile = useMediaQuery("(max-width: 640px)")

  // For mobile, we'll split into fewer chunks to improve performance
  const words = isMobile ? text.split(". ").join(".").split(" ") : text.split(" ")

  // Simple container animation - just controls the staggering
  const container = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: isMobile ? staggerChildren * 1.5 : staggerChildren,
        delayChildren: delay,
      },
    },
  }

  // Simple fade-in animation for each word
  const child = {
    hidden: {
      opacity: 0,
    },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  }

  return (
    <motion.div
      ref={ref}
      className={`inline-block ${className}`}
      variants={container}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
    >
      {words.map((word, index) => (
        <motion.span key={index} className="inline-block mr-[0.25em] whitespace-nowrap" variants={child}>
          {word}
        </motion.span>
      ))}
    </motion.div>
  )
}

