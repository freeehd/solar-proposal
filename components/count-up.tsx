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
  duration = 1.5,
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
    // Ensure we never exceed the target value
    const cappedValue = Math.min(latest, value)
    return formatter(Math.round(cappedValue))
  })

  // Reset and start animation when isActive changes
  useEffect(() => {
    // Only run animation when component becomes active
    if (isActive && !hasAnimatedRef.current) {
      // Mark that we've started animating
      hasAnimatedRef.current = true

      // Explicitly set to 0 first
      count.set(0)

      // Start the animation with a slight delay
      const timer = setTimeout(() => {
        // Use Framer's animate function with a non-overshooting easing curve
        animate(count, value, {
          duration,
          // Use a standard easeOut curve that doesn't overshoot
          ease: "easeOut",
          // Ensure we never exceed the target value
          onUpdate: (latest) => {
            if (latest > value) {
              count.set(value)
            }
          },
          onComplete: () => {
            // Make sure we end exactly at the target value
            count.set(value)
          },
        })
      }, 300)

      return () => clearTimeout(timer)
    } else if (!isActive && hasAnimatedRef.current) {
      // Reset when becoming inactive
      count.set(0)
      hasAnimatedRef.current = false
    }
  }, [isActive, value, count, duration])

  return (
    <span className={className}>
      {prefix}
      <motion.span
        style={{
          display: "inline-block",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {roundedCount}
      </motion.span>
      {suffix}
    </span>
  )
}

