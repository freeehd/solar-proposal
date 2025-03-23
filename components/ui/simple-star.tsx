"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"

interface SimpleStarProps {
  size?: number
  delay?: number
  onComplete?: () => void
  color?: string
  animated?: boolean
}

/**
 * A simplified star component that doesn't rely on Three.js
 * This is more reliable and performs better on low-end devices
 */
export function SimpleStar({ size = 100, delay = 0, onComplete, color = "#daa520", animated = true }: SimpleStarProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [hasCompleted, setHasCompleted] = useState(false)
  const starRef = useRef<HTMLDivElement>(null)

  // Handle animation completion
  useEffect(() => {
    if (!animated) {
      setIsVisible(true)
      setHasCompleted(true)
      onComplete?.()
      return
    }

    const timer = setTimeout(() => {
      setIsVisible(true)

      // Notify parent after animation completes
      const animationTimer = setTimeout(() => {
        setHasCompleted(true)
        onComplete?.()
      }, 500) // Animation duration

      return () => clearTimeout(animationTimer)
    }, delay)

    return () => clearTimeout(timer)
  }, [delay, onComplete, animated])

  // Set up intersection observer for better performance
  useEffect(() => {
    if (!starRef.current || hasCompleted) return

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 },
    )

    observer.observe(starRef.current)

    return () => {
      observer.disconnect()
    }
  }, [isVisible, hasCompleted])

  return (
    <div ref={starRef} className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {animated ? (
        <motion.div
          initial={{ scale: 0, rotate: -180, opacity: 0 }}
          animate={isVisible ? { scale: 1, rotate: 0, opacity: 1 } : { scale: 0, rotate: -180, opacity: 0 }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 20,
            duration: 0.5,
          }}
          className="w-full h-full"
        >
          <div
            className="w-full h-full rounded-full flex items-center justify-center"
            style={{
              background: `radial-gradient(circle, ${color} 0%, ${color}99 60%, ${color}33 100%)`,
              boxShadow: `0 0 15px ${color}66`,
            }}
          >
            <div className="text-white text-center text-3xl">★</div>
          </div>
        </motion.div>
      ) : (
        <div
          className="w-full h-full rounded-full flex items-center justify-center"
          style={{
            background: `radial-gradient(circle, ${color} 0%, ${color}99 60%, ${color}33 100%)`,
            boxShadow: `0 0 15px ${color}66`,
          }}
        >
          <div className="text-white text-center text-3xl">★</div>
        </div>
      )}
    </div>
  )
}

