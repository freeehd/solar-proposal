"use client"

import { useRef, useEffect, useState } from "react"
import { motion, useAnimationControls, AnimatePresence } from "framer-motion"

interface CircularProgressProps {
  percentage: number
  isCharging?: boolean
  onChargingComplete?: () => void
  onProgressUpdate?: (progress: number) => void
  className?: string
}

export function CircularProgress({
  percentage,
  isCharging,
  onChargingComplete,
  onProgressUpdate,
  className,
}: CircularProgressProps) {
  // Animation controls
  const progressControls = useAnimationControls()
  const pulseControls = useAnimationControls()
  const textControls = useAnimationControls()
  const particlesControls = useAnimationControls()

  // Refs to avoid unnecessary re-renders
  const animationRef = useRef<number | null>(null)
  const isAnimatingRef = useRef(false)

  // State
  const [currentPercentage, setCurrentPercentage] = useState(0)
  const [showCompletionEffects, setShowCompletionEffects] = useState(false)
  const [particles, setParticles] = useState<
    Array<{
      id: number
      x: number
      y: number
      size: number
      delay: number
      duration: number
      opacity: number
    }>
  >([])

  // Constants
  const radius = 60
  const circumference = 2 * Math.PI * radius
  const animationDuration = 1500 // Animation duration in ms
  const particleCount = 8 // Number of particles

  // Get color based on percentage
  const getColors = (percent: number) => {
    if (percent <= 25) {
      return {
        start: "#ef4444", // red-500
        end: "#f97316", // orange-500
        text: "#ef4444",
      }
    } else if (percent <= 50) {
      return {
        start: "#f97316", // orange-500
        end: "#eab308", // yellow-500
        text: "#f97316",
      }
    } else if (percent <= 75) {
      return {
        start: "#eab308", // yellow-500
        end: "#22c55e", // green-500
        text: "#eab308",
      }
    } else {
      return {
        start: "#22c55e", // green-500
        end: "#15803d", // green-700
        text: "#22c55e",
      }
    }
  }

  const colors = getColors(currentPercentage)

  // Generate particles at different positions along the circle
  useEffect(() => {
    if (isCharging) {
      const newParticles = Array.from({ length: particleCount }, (_, i) => {
        // Calculate position on the circle
        const angle = (i / particleCount) * Math.PI * 2
        const x = 70 + Math.cos(angle) * radius
        const y = 70 + Math.sin(angle) * radius

        return {
          id: i,
          x,
          y,
          size: 2 + Math.random() * 4, // Random size between 2-6
          delay: Math.random() * 2, // Random delay
          duration: 0.8 + Math.random() * 1.2, // Random duration
          opacity: 0.6 + Math.random() * 0.4, // Random opacity
        }
      })

      setParticles(newParticles)
    }
  }, [isCharging, radius])

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  // Handle charging state changes
  useEffect(() => {
    if (isCharging && !isAnimatingRef.current) {
      // Start animation
      startAnimation()
    } else if (!isCharging && isAnimatingRef.current) {
      // Stop animation
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
        animationRef.current = null
      }
      isAnimatingRef.current = false
    }
  }, [isCharging])

  // Animation function
  const startAnimation = () => {
    isAnimatingRef.current = true
    setCurrentPercentage(0) // Start from 0

    // Reset animation state
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }

    // Start pulse animation
    pulseControls.start({
      scale: [1, 1.03, 1],
      transition: {
        duration: 1.2,
        repeat: Number.POSITIVE_INFINITY,
        repeatType: "reverse",
      },
    })

    // Start particles animation
    particlesControls.start({
      opacity: 1,
      transition: { duration: 0.5 },
    })

    // Start progress animation
    const startTime = performance.now()

    const animate = (time: number) => {
      const elapsed = time - startTime
      const progress = Math.min(elapsed / animationDuration, 1)

      // Use a custom easing function for more dynamic animation
      // This creates a fast start, slower middle, fast end effect
      const easedProgress = progress < 0.5 ? 4 * progress * progress * progress : 1 - Math.pow(-2 * progress + 2, 3) / 2

      const newPercentage = Math.round(easedProgress * percentage)

      if (newPercentage !== currentPercentage) {
        setCurrentPercentage(newPercentage)
        onProgressUpdate?.(newPercentage / 100)

        // Add milestone effects at 25%, 50%, 75%
        if ([25, 50, 75].includes(newPercentage)) {
          addMilestoneEffect(newPercentage)
        }

        // Add micro effects at every 10% increment
        if (newPercentage % 10 === 0 && newPercentage > 0) {
          addMicroEffect()
        }
      }

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate)
      } else {
        // Animation complete
        completeAnimation()
      }
    }

    animationRef.current = requestAnimationFrame(animate)
  }

  // Add a micro visual effect for smaller increments
  const addMicroEffect = () => {
    // Subtle text pulse
    textControls.start({
      scale: [1, 1.05, 1],
      transition: { duration: 0.3, ease: "easeOut" },
    })
  }

  // Add a visual effect at milestone percentages
  const addMilestoneEffect = (milestone: number) => {
    // Quick pulse effect
    pulseControls.start({
      scale: [1, 1.08, 1],
      transition: { duration: 0.4, ease: "easeOut" },
    })

    // Text effect
    textControls.start({
      scale: [1, 1.15, 1],
      color: [colors.text, "#ffffff", colors.text],
      transition: { duration: 0.4, ease: "easeOut" },
    })

    // Create milestone-specific particles
    const newParticles = Array.from({ length: 4 }, (_, i) => {
      // Calculate position on the circle based on the milestone percentage
      const angle = (milestone / 100) * Math.PI * 2 - Math.PI / 2 // Adjust for SVG rotation
      const x = 70 + Math.cos(angle) * radius
      const y = 70 + Math.sin(angle) * radius

      return {
        id: i + 100 + milestone, // Ensure unique IDs
        x,
        y,
        size: 4 + Math.random() * 6, // Larger size for milestone particles
        delay: Math.random() * 0.3,
        duration: 0.6 + Math.random() * 0.8,
        opacity: 0.8 + Math.random() * 0.2,
      }
    })

    setParticles((prev) => [...prev, ...newParticles])
  }

  // Handle animation completion
  const completeAnimation = () => {
    setShowCompletionEffects(true)

    // Final pulse effect
    pulseControls.start({
      scale: [1, 1.15, 0.95, 1.05, 1],
      transition: {
        duration: 0.8,
        ease: [0.22, 1.2, 0.36, 1],
        times: [0, 0.2, 0.5, 0.8, 1],
      },
    })

    // Text effect
    textControls.start({
      scale: [1, 1.2, 0.9, 1],
      color: [colors.text, "#ffffff", colors.text],
      transition: { duration: 0.6, ease: "easeOut" },
    })

    // Particles explosion
    const explosionParticles = Array.from({ length: 20 }, (_, i) => {
      const angle = (i / 20) * Math.PI * 2
      const distance = radius * (0.7 + Math.random() * 0.6)
      const x = 70 + Math.cos(angle) * distance
      const y = 70 + Math.sin(angle) * distance

      return {
        id: i + 200, // Ensure unique IDs
        x,
        y,
        size: 3 + Math.random() * 5,
        delay: Math.random() * 0.2,
        duration: 0.8 + Math.random() * 1.2,
        opacity: 0.7 + Math.random() * 0.3,
      }
    })

    setParticles(explosionParticles)

    // Clean up after effects
    setTimeout(() => {
      setShowCompletionEffects(false)
      isAnimatingRef.current = false
      onChargingComplete?.()
    }, 1000)
  }

  // Calculate point on circle for ticks
  const getPointOnCircle = (percentage: number) => {
    const angle = (percentage / 100) * Math.PI * 2 - Math.PI / 2 // Adjust for SVG rotation
    return {
      x: 70 + Math.cos(angle) * radius,
      y: 70 + Math.sin(angle) * radius,
    }
  }

  return (
    <div
      className={`relative w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 lg:w-52 lg:h-52 flex items-center justify-center ${className || ""}`}
      style={{ zIndex: 30 }}
    >
      {/* Main circle container with extended padding to prevent clipping */}
      <div className="absolute inset-[-20px] sm:inset-[-25px] md:inset-[-30px] flex items-center justify-center">
        <div className="relative w-40 h-40 sm:w-44 sm:h-44 md:w-52 md:h-52 bg-gradient-to-br from-blue-50 to-white rounded-full shadow-md overflow-visible">
          <motion.div className="absolute inset-0 overflow-visible" animate={pulseControls}>
            {/* Increased viewBox to prevent clipping */}
            <svg
              className="w-full h-full -rotate-90 overflow-visible"
              viewBox="0 0 140 140"
              style={{ overflow: "visible" }}
            >
              <defs>
                <linearGradient id={`progressGradient-${currentPercentage}`} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={colors.start} />
                  <stop offset="100%" stopColor={colors.end} />
                </linearGradient>

                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>

                {/* Enhanced glow for particles */}
                <filter id="particleGlow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="2" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>

                {/* Radial gradient for particles */}
                <radialGradient id="particleGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                  <stop offset="0%" stopColor={`${colors.start}ff`} />
                  <stop offset="100%" stopColor={`${colors.start}00`} />
                </radialGradient>
              </defs>

              {/* Background track with tick marks */}
              <circle
                className="text-slate-100"
                strokeWidth="10"
                stroke="currentColor"
                fill="none"
                r={radius}
                cx="70"
                cy="70"
              />

              {/* Tick marks every 10% */}
              {Array.from({ length: 10 }).map((_, i) => {
                const percentage = (i + 1) * 10
                const point = getPointOnCircle(percentage)
                const isQuarter = percentage % 25 === 0

                return (
                  <circle
                    key={`tick-${percentage}`}
                    cx={point.x}
                    cy={point.y}
                    r={isQuarter ? 2 : 1}
                    fill={percentage <= currentPercentage ? colors.start : "#cbd5e1"}
                    opacity={percentage <= currentPercentage ? 1 : 0.5}
                  />
                )
              })}

              {/* Progress circle */}
              <motion.circle
                stroke={`url(#progressGradient-${currentPercentage})`}
                strokeWidth="15"
                strokeLinecap="round"
                fill="none"
                r={radius}
                cx="70"
                cy="70"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{
                  strokeDashoffset: circumference - (currentPercentage / 100) * circumference,
                }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                filter="url(#glow)"
              />

              {/* Progress indicator dot */}
              {currentPercentage > 0 && (
                <motion.g>
                  {/* Calculate position based on current percentage */}
                  {(() => {
                    const angle = (currentPercentage / 100) * Math.PI * 2 - Math.PI / 2
                    const x = 70 + Math.cos(angle) * radius
                    const y = 70 + Math.sin(angle) * radius

                    return (
                      <>
                        {/* Outer glow */}
                        <circle cx={x} cy={y} r={5} fill={`${colors.start}40`} filter="url(#glow)" />
                        {/* Inner dot */}
                        <circle cx={x} cy={y} r={3} fill={colors.start} />
                      </>
                    )
                  })()}
                </motion.g>
              )}

              {/* Animated particles */}
              <motion.g animate={particlesControls}>
                {particles.map((particle) => (
                  <motion.circle
                    key={`particle-${particle.id}`}
                    cx={particle.x}
                    cy={particle.y}
                    r={particle.size}
                    fill={`${colors.start}`}
                    filter="url(#particleGlow)"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{
                      opacity: [0, particle.opacity, 0],
                      scale: [0, 1, 0],
                      x: [particle.x, particle.x + (Math.random() * 20 - 10)],
                      y: [particle.y, particle.y + (Math.random() * 20 - 10)],
                    }}
                    transition={{
                      duration: particle.duration,
                      delay: particle.delay,
                      ease: "easeOut",
                      times: [0, 0.4, 1],
                    }}
                  />
                ))}
              </motion.g>
            </svg>
          </motion.div>

          {/* Percentage text */}
          <motion.div
            className="absolute inset-0 flex flex-col items-center justify-center"
            animate={textControls}
            style={{ zIndex: 40 }}
          >
            <motion.span
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-medium leading-tight"
              style={{ color: colors.text }}
            >
              {currentPercentage}%
            </motion.span>
            <span className="text-[10px] xs:text-xs sm:text-sm text-slate-500 font-normal leading-tight">
              Energy Offset
            </span>
          </motion.div>
        </div>
      </div>

      {/* Completion effects - moved outside the main circle for better visibility */}
      <AnimatePresence>
        {showCompletionEffects && (
          <div className="absolute inset-[-50px] overflow-visible pointer-events-none">
            {/* Multiple ripple effects */}
            {[0, 1, 2].map((i) => (
              <motion.div
                key={`ripple-${i}`}
                className="absolute inset-[20px] rounded-full"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: [0, 0.4, 0], scale: [0.8, 1.3, 1.5] }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: 1,
                  ease: "easeOut",
                  delay: i * 0.15, // Staggered delay
                }}
                style={{
                  border: `2px solid ${colors.start}`,
                }}
              />
            ))}

            {/* Enhanced glow effect */}
            <motion.div
              className="absolute inset-[20px] rounded-full"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: [0, 0.5, 0], scale: [0.8, 1.2, 1.4] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
              style={{
                background: `radial-gradient(circle, ${colors.start}60 0%, ${colors.end}00 70%)`,
              }}
            />

            {/* Flash effect */}
            <motion.div
              className="absolute inset-[20px] rounded-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.7, 0] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              style={{
                background: colors.start,
              }}
            />

            {/* Radial lines burst effect */}
            <svg className="absolute inset-0 w-full h-full overflow-visible" style={{ overflow: "visible" }}>
              {Array.from({ length: 12 }).map((_, i) => {
                const angle = (i / 12) * Math.PI * 2
                const centerX = 104
                const centerY = 104
                const innerRadius = 60
                const outerRadius = 100

                const x1 = centerX + Math.cos(angle) * innerRadius
                const y1 = centerY + Math.sin(angle) * innerRadius
                const x2 = centerX + Math.cos(angle) * outerRadius
                const y2 = centerY + Math.sin(angle) * outerRadius

                return (
                  <motion.line
                    key={`burst-${i}`}
                    x1={x1}
                    y1={y1}
                    x2={x1} // Start at same point
                    y2={y1}
                    stroke={colors.start}
                    strokeWidth="2"
                    initial={{ opacity: 0 }}
                    animate={{
                      opacity: [0, 0.8, 0],
                      x2: [x1, x2],
                      y2: [y1, y2],
                    }}
                    transition={{
                      duration: 0.6,
                      delay: 0.1 + i * 0.03,
                      ease: "easeOut",
                    }}
                  />
                )
              })}
            </svg>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

