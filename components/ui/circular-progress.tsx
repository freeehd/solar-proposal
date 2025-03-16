"use client"

import { useRef, useEffect, useState } from "react"
import { motion, useAnimationControls } from "framer-motion"

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
  const overflowControls = useAnimationControls()

  // Refs to avoid unnecessary re-renders
  const animationRef = useRef<number | null>(null)
  const isAnimatingRef = useRef(false)

  // State
  const [currentPercentage, setCurrentPercentage] = useState(0)
  const [showCompletionEffects, setShowCompletionEffects] = useState(false)
  const [showOverflowEffects, setShowOverflowEffects] = useState(false)

  // Constants
  const radius = 60
  const circumference = 2 * Math.PI * radius
  const animationDuration = 3000 // Increased from 1500ms to 3000ms to slow down the animation

  // Handle values over 100%
  const isOverHundred = percentage > 100
  const displayPercentage = percentage
  const overflowPercentage = isOverHundred ? percentage - 100 : 0

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

  const colors = getColors(Math.min(currentPercentage, 100))

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
    setShowOverflowEffects(false)

    // Reset animation state
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }

    // Start pulse animation
    pulseControls.start({
      scale: [1, 1.02, 1],
      transition: {
        duration: 1.5,
        repeat: Number.POSITIVE_INFINITY,
        repeatType: "reverse",
      },
    })

    // Start progress animation
    const startTime = performance.now()

    const animate = (time: number) => {
      const elapsed = time - startTime
      const progress = Math.min(elapsed / animationDuration, 1)

      // Improved easing function for smoother animation
      // This creates a more natural filling effect
      const easedProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress)

      // Use actual percentage for the animation target
      const newPercentage = Math.round(easedProgress * percentage)

      if (newPercentage !== currentPercentage) {
        setCurrentPercentage(newPercentage)
        onProgressUpdate?.(newPercentage / 100)

        // Add milestone effects at 25%, 50%, 75%
        if ([25, 50, 75].includes(newPercentage)) {
          addMilestoneEffect()
        }

        // Special effect when crossing 100%
        if (currentPercentage < 100 && newPercentage >= 100) {
          addOverHundredEffect()
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

  // Add a visual effect at milestone percentages
  const addMilestoneEffect = () => {
    // Quick pulse effect
    pulseControls.start({
      scale: [1, 1.05, 1],
      transition: { duration: 0.4, ease: "easeOut" },
    })

    // Text effect
    textControls.start({
      scale: [1, 1.1, 1],
      color: [colors.text, "#ffffff", colors.text],
      transition: { duration: 0.4, ease: "easeOut" },
    })
  }

  // Special effect when crossing 100%
  const addOverHundredEffect = () => {
    setShowOverflowEffects(true)

    // More dramatic pulse effect
    pulseControls.start({
      scale: [1, 1.08, 0.98, 1.04, 1],
      transition: {
        duration: 0.8,
        ease: [0.22, 1.2, 0.36, 1],
        times: [0, 0.2, 0.5, 0.8, 1],
      },
    })

    // Overflow animation
    overflowControls.start({
      opacity: [0, 0.8, 0.6],
      scale: [0.9, 1.05, 1],
      rotate: [0, 10, 0],
      transition: { duration: 0.8, ease: "easeOut" },
    })

    // Text effect
    textControls.start({
      scale: [1, 1.2, 0.95, 1.1, 1],
      transition: { duration: 0.8, ease: "easeOut" },
    })
  }

  // Handle animation completion
  const completeAnimation = () => {
    setShowCompletionEffects(true)

    // Final pulse effect
    pulseControls.start({
      scale: [1, 1.1, 0.98, 1.03, 1],
      transition: {
        duration: 0.8,
        ease: [0.22, 1.2, 0.36, 1],
        times: [0, 0.2, 0.5, 0.8, 1],
      },
    })

    // Text effect
    textControls.start({
      scale: [1, 1.15, 0.95, 1],
      color: [colors.text, "#ffffff", colors.text],
      transition: { duration: 0.6, ease: "easeOut" },
    })

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
      {/* Main circle container */}
      <div className="absolute inset-[-15px] sm:inset-[-20px] md:inset-[-25px] flex items-center justify-center">
        <div className="relative w-40 h-40 sm:w-44 sm:h-44 md:w-52 md:h-52 bg-gradient-to-br from-blue-50 to-white rounded-full shadow-md overflow-visible">
          <motion.div className="absolute inset-0 overflow-visible" animate={pulseControls}>
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
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>

                {/* Special filter for the overflow effect */}
                <filter id="sparkleGlow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="2" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  <feColorMatrix
                    type="matrix"
                    values="1 0 0 0 0
                            0 1 0 0 0
                            0 0 1 0 0
                            0 0 0 3 0"
                  />
                </filter>
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

              {/* Tick marks every 25% */}
              {[25, 50, 75, 100].map((tickPercentage) => {
                const point = getPointOnCircle(tickPercentage)
                return (
                  <circle
                    key={`tick-${tickPercentage}`}
                    cx={point.x}
                    cy={point.y}
                    r={2}
                    fill={tickPercentage <= Math.min(currentPercentage, 100) ? colors.start : "#cbd5e1"}
                    opacity={tickPercentage <= Math.min(currentPercentage, 100) ? 1 : 0.5}
                  />
                )
              })}

              {/* Progress circle - capped at 100% for visual */}
              <motion.circle
                stroke={`url(#progressGradient-${currentPercentage})`}
                strokeWidth="12"
                strokeLinecap="round"
                fill="none"
                r={radius}
                cx="70"
                cy="70"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{
                  strokeDashoffset: circumference - (Math.min(currentPercentage, 100) / 100) * circumference,
                }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                filter="url(#glow)"
              />

              {/* Progress indicator dot */}
              {currentPercentage > 0 && (
                <motion.g>
                  {(() => {
                    // Cap the angle at 100% for the main indicator
                    const cappedPercentage = Math.min(currentPercentage, 100)
                    const angle = (cappedPercentage / 100) * Math.PI * 2 - Math.PI / 2
                    const x = 70 + Math.cos(angle) * radius
                    const y = 70 + Math.sin(angle) * radius

                    return (
                      <>
                        {/* Outer glow */}
                        <circle cx={x} cy={y} r={4} fill={`${colors.start}40`} filter="url(#glow)" />
                        {/* Inner dot */}
                        <circle cx={x} cy={y} r={2.5} fill={colors.start} />
                      </>
                    )
                  })()}
                </motion.g>
              )}

              {/* Overflow effect - second circle that overlaps */}
              {isOverHundred && showOverflowEffects && currentPercentage > 100 && (
                <>
                  {/* Overflow circle - starts at 0 and goes up to the overflow percentage */}
                  <motion.circle
                    stroke={colors.start}
                    strokeWidth="12"
                    strokeLinecap="round"
                    fill="none"
                    r={radius}
                    cx="70"
                    cy="70"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{
                      strokeDashoffset: circumference - ((currentPercentage - 100) / 100) * circumference,
                    }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    filter="url(#sparkleGlow)"
                    opacity={0.7}
                    style={{ transform: "rotate(0deg)", transformOrigin: "center" }}
                  />

                  {/* Sparkle effects around the circle */}
                 
                 
                </>
              )}
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

            {/* Over 100% indicator text */}
            {isOverHundred && currentPercentage > 100 && (
              <motion.span
                className="text-[9px] xs:text-[10px] sm:text-xs font-medium mt-1"
                style={{ color: colors.text }}
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.7, 1, 0.7],
                }}
                transition={{
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatType: "reverse",
                }}
              >
              </motion.span>
            )}
          </motion.div>

          {/* Overflow circle effect - appears when over 100% */}
          {isOverHundred && showOverflowEffects && (
            <motion.div
              className="absolute inset-0"
              animate={overflowControls}
              style={{
                borderRadius: "50%",
                border: `2px dashed ${colors.start}`,
                opacity: 0,
              }}
            />
          )}
        </div>
      </div>

      {/* Completion effect - simplified */}
      {showCompletionEffects && (
        <div className="absolute inset-[-30px] overflow-visible pointer-events-none">
          {/* Simple ripple effect */}
          <motion.div
            className="absolute inset-[15px] rounded-full"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: [0, 0.3, 0], scale: [0.9, 1.2, 1.3] }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            style={{
              border: `2px solid ${colors.start}`,
            }}
          />

          {/* Glow effect */}
          <motion.div
            className="absolute inset-[15px] rounded-full"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: [0, 0.4, 0], scale: [0.9, 1.15, 1.25] }}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
            style={{
              background: `radial-gradient(circle, ${colors.start}50 0%, ${colors.end}00 70%)`,
            }}
          />
        </div>
      )}
    </div>
  )
}

