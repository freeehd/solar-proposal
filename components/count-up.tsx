"use client"

import { useEffect, useRef } from "react"
import { motion, useMotionValue, useTransform, animate } from "framer-motion"

interface CountUpProps {
  value: number
  duration?: number
  isActive?: boolean
  prefix?: string
  suffix?: string
  formatter?: (value: number) => string
  className?: string
}

export function CountUp({
  value,
  duration = 2.5,
  isActive = true,
  prefix = "",
  suffix = "",
  formatter = (val) => val.toLocaleString(),
  className = "",
}: CountUpProps) {
  // Use a ref to track if animation has been triggered
  const hasAnimatedRef = useRef(false)

  // Use motion value for more direct control
  const count = useMotionValue(0)
  const roundedCount = useTransform(count, (latest) => {
    return formatter(Math.round(latest))
  })

  // Reset and start animation when isActive changes
  useEffect(() => {
    // Only run animation when component becomes active
    if (isActive && !hasAnimatedRef.current) {
      // Mark that we've started animating
      hasAnimatedRef.current = true

      // Explicitly set to 0 first
      count.set(0)

      // Use a more significant delay to ensure 0 is visible
      const animationTimeout = setTimeout(() => {
        // Use Framer's animate function for more control
        animate(count, value, {
          duration,
          ease: "easeOut",
        })
      }, 300) // Longer delay to ensure 0 is visible

      return () => clearTimeout(animationTimeout)
    } else if (!isActive && hasAnimatedRef.current) {
      // Reset when becoming inactive
      count.set(0)
      hasAnimatedRef.current = false
    }
  }, [isActive, value, count, duration])

  return (
    <span className={className}>
      {prefix}
      <motion.span>{roundedCount}</motion.span>
      {suffix}
    </span>
  )
}

