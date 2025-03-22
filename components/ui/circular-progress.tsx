"use client"

import { useRef, useEffect, useState, useCallback } from "react"
import { motion, useAnimationControls } from "framer-motion"

interface CircularProgressProps {
  percentage: number
  isCharging?: boolean
  onChargingComplete?: () => void
  onProgressUpdate?: (progress: number) => void
  className?: string
  size?: number
}

export function CircularProgress({
  percentage,
  isCharging,
  onChargingComplete,
  onProgressUpdate,
  className,
  size = 280,
}: CircularProgressProps) {
  // Animation controls
  const progressControls = useAnimationControls()
  const pulseControls = useAnimationControls()
  const textControls = useAnimationControls()
  const overflowControls = useAnimationControls()
  const boomControls = useAnimationControls()
  const containerScaleControls = useAnimationControls()

  // Refs to avoid unnecessary re-renders
  const animationRef = useRef<number | null>(null)
  const vibrationRef = useRef<number | null>(null)
  const isAnimatingRef = useRef(false)
  const lastVibrationTime = useRef(0)
  const currentProgressRef = useRef(0)

  // State
  const [currentPercentage, setCurrentPercentage] = useState(0)
  const [showCompletionEffects, setShowCompletionEffects] = useState(false)
  const [showOverflowEffects, setShowOverflowEffects] = useState(false)
  const [preBoomPhase, setPreBoomPhase] = useState(false)

  // Calculate dimensions based on size prop
  const viewBoxSize = 140
  const radius = viewBoxSize * 0.35
  const strokeWidth = viewBoxSize * 0.06
  const center = viewBoxSize / 2
  const circumference = 2 * Math.PI * radius

  // Animation constants
  const maxScale = 1.15 // Maximum scale at 100%
  const animationDuration = 2500

  // Handle values over 100%
  const isOverHundred = percentage > 100

  // Get color based on percentage - memoized via useCallback
  const getColors = useCallback((percent: number) => {
    if (percent <= 25) {
      return {
        start: "#ef4444", // red-500
        end: "#dc2626", // red-600
        text: "#dc2626",
      }
    } else if (percent <= 50) {
      return {
        start: "#f97316", // orange-500
        end: "#ea580c", // orange-600
        text: "#ea580c",
      }
    } else if (percent <= 70) {
      return {
        start: "#eab308", // yellow-500
        end: "#ca8a04", // yellow-600
        text: "#ca8a04",
      }
    } else {
      return {
        start: "#22c55e", // green-500
        end: "#16a34a", // green-600
        text: "#16a34a",
      }
    }
  }, [])

  const colors = getColors(Math.min(currentPercentage, 100))

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      if (vibrationRef.current) {
        cancelAnimationFrame(vibrationRef.current)
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
      if (vibrationRef.current) {
        cancelAnimationFrame(vibrationRef.current)
        vibrationRef.current = null
      }
      isAnimatingRef.current = false
      setPreBoomPhase(false)
    }
  }, [isCharging])

  // Optimized vibration effect using requestAnimationFrame
  const startVibrationEffect = useCallback(() => {
    // Stop any existing vibration animation
    if (vibrationRef.current) {
      cancelAnimationFrame(vibrationRef.current)
    }

    let lastTimestamp = 0
    const vibrationInterval = 16 // ~60fps

    // Use a single requestAnimationFrame loop for all vibration effects
    const updateVibration = (timestamp: number) => {
      if (!isAnimatingRef.current) return

      // Throttle updates to improve performance
      if (timestamp - lastTimestamp < vibrationInterval) {
        vibrationRef.current = requestAnimationFrame(updateVibration)
        return
      }

      lastTimestamp = timestamp
      const percent = currentProgressRef.current

      // Scale up the container as percentage increases
      const baseScale = 1
      const scaleIncrease = baseScale + (maxScale - baseScale) * (percent / 100)

      // Apply the scale with a slight wobble effect
      containerScaleControls.start({
        scale: preBoomPhase ? maxScale * 1.05 : scaleIncrease,
        transition: { duration: 0.3, ease: "easeOut" },
      })

      // Calculate vibration intensity based on percentage - simplified
      const normalizedPercent = percent / 100
      // Use a simpler quadratic curve instead of exponential
      const amplitudeFactor = normalizedPercent * normalizedPercent

      // Pre-boom phase - extreme vibration
      if (preBoomPhase) {
        // Simplified chaotic vibration - only scale and rotate, no position change
        const randomRotate = (Math.random() * 2 - 1) * 3

        pulseControls.start({
          rotate: randomRotate,
          scale: 1 + (Math.random() * 0.08 - 0.04),
          transition: { duration: 0.03, ease: "linear" },
        })
      }
      // Normal vibration - simplified patterns with no position change
      else {
        // Low percentage - simple scale vibration
        if (percent < 30) {
          const smallScale = 1 + (Math.random() * 0.01 - 0.005)
          pulseControls.start({
            scale: smallScale,
            transition: { duration: 0.1, ease: "linear" },
          })
        }
        // Medium to high percentage - more complex vibration
        else {
          const rotationIntensity = Math.min(1, percent / 70)
          pulseControls.start({
            rotate: (Math.random() * 2 - 1) * rotationIntensity,
            scale: 1 + (Math.random() * 0.02 - 0.01) * amplitudeFactor,
            transition: { duration: 0.08, ease: "linear" },
          })

          // Add occasional "thugs" for higher percentages
          const now = Date.now()
          if (percent > 60 && now - lastVibrationTime.current > 300 && Math.random() > 0.7) {
            lastVibrationTime.current = now
            pulseControls.start({
              scale: [1, 1.03, 0.98, 1],
              transition: { duration: 0.15, ease: "easeOut" },
            })
          }
        }
      }

      vibrationRef.current = requestAnimationFrame(updateVibration)
    }

    vibrationRef.current = requestAnimationFrame(updateVibration)
  }, [containerScaleControls, maxScale, preBoomPhase, pulseControls])

  // Animation function
  const startAnimation = () => {
    isAnimatingRef.current = true
    setCurrentPercentage(0)
    currentProgressRef.current = 0
    setShowOverflowEffects(false)
    setPreBoomPhase(false)

    // Reset animation state
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }

    // Reset container scale
    containerScaleControls.start({
      scale: 1,
      transition: { duration: 0.2 },
    })

    // Start vibration effect
    startVibrationEffect()

    // Start progress animation
    const startTime = performance.now()

    const animate = (time: number) => {
      if (!isAnimatingRef.current) return

      const elapsed = time - startTime
      const progress = Math.min(elapsed / animationDuration, 1)

      // Simple easeOutQuad function that doesn't overshoot
      const easedProgress = progress * (2 - progress)

      // Use actual percentage for the animation target
      const newPercentage = Math.round(easedProgress * percentage)

      if (newPercentage !== currentPercentage) {
        setCurrentPercentage(newPercentage)
        currentProgressRef.current = newPercentage
        onProgressUpdate?.(newPercentage / 100)

        // Add milestone effects at 25%, 50%, 75% - more subtle
        if ([25, 50, 75].includes(newPercentage)) {
          addMilestoneEffect()
        }

        // Special effect when crossing 100%
        if (currentPercentage < 100 && newPercentage >= 100) {
          addOverHundredEffect()
        }

        // Pre-boom phase - when we're almost done (95%+)
        if (newPercentage >= 95 && progress > 0.95 && !preBoomPhase) {
          setPreBoomPhase(true)
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

  // Add a visual effect at milestone percentages - more subtle
  const addMilestoneEffect = () => {
    // Quick pulse effect
    pulseControls.start({
      scale: [1, 1.02, 1],
      transition: { duration: 0.3, ease: "easeOut" },
    })

    // Text effect
    textControls.start({
      scale: [1, 1.05, 1],
      transition: { duration: 0.3, ease: "easeOut" },
    })
  }

  // Special effect when crossing 100% - more subtle
  const addOverHundredEffect = () => {
    setShowOverflowEffects(true)

    // More dramatic pulse effect
    pulseControls.start({
      scale: [1, 1.04, 0.99, 1.02, 1],
      transition: {
        duration: 0.6,
        ease: [0.22, 1.2, 0.36, 1],
        times: [0, 0.2, 0.5, 0.8, 1],
      },
    })

    // Overflow animation
    overflowControls.start({
      opacity: [0, 0.6, 0.4],
      scale: [0.95, 1.02, 1],
      transition: { duration: 0.6, ease: "easeOut" },
    })

    // Text effect
    textControls.start({
      scale: [1, 1.1, 0.98, 1.05, 1],
      transition: { duration: 0.6, ease: "easeOut" },
    })
  }

  // Handle animation completion with BOOM effect
  const completeAnimation = () => {
    setShowCompletionEffects(true)
    setPreBoomPhase(false)

    // Stop vibration
    if (vibrationRef.current) {
      cancelAnimationFrame(vibrationRef.current)
      vibrationRef.current = null
    }

    // Reset position and rotation
    pulseControls.start({
      rotate: 0,
      transition: { duration: 0.1 },
    })

    // BOOM effect - dramatic expansion and contraction
    setTimeout(() => {
      // First, quickly scale down from expanded state to normal with a bounce
      containerScaleControls.start({
        scale: [maxScale, 0.92, 1.03, 0.98, 1],
        transition: {
          duration: 0.8,
          ease: [0.22, 1.2, 0.36, 1],
          times: [0, 0.3, 0.6, 0.8, 1],
        },
      })

      // More refined BOOM effect with smaller scale values
      pulseControls.start({
        scale: [1, 0.9, 1.05, 0.97, 1.02, 1], // Emphasize compression then slight bounce
        rotate: [0, 1, -0.5, 0.2, -0.1, 0], // Less extreme rotation
        transition: {
          duration: 0.9,
          ease: [0.22, 1.2, 0.36, 1],
          times: [0, 0.2, 0.4, 0.6, 0.8, 1],
        },
      })

      // Text effect - compress then bounce
      textControls.start({
        scale: [1, 0.85, 1.1, 0.95, 1.02, 1],
        transition: { duration: 0.9, ease: "easeOut" },
      })

      // Consolidated boom effect - combines previous multiple effects into one
      boomControls.start({
        scale: [1, 1.6, 1],
        opacity: [0, 0.8, 0],
        transition: { duration: 1.2, ease: "easeOut" },
      })
    }, 100)

    // Clean up after effects
    setTimeout(() => {
      setShowCompletionEffects(false)
      isAnimatingRef.current = false
      onChargingComplete?.()
    }, 1800)
  }

  // Calculate point on circle for ticks
  const getPointOnCircle = (percentage: number) => {
    const angle = (percentage / 100) * Math.PI * 2 - Math.PI / 2 // Adjust for SVG rotation
    return {
      x: center + Math.cos(angle) * radius,
      y: center + Math.sin(angle) * radius,
    }
  }

  // Calculate container size based on provided size prop
  const containerSize = `${size}px`

  return (
    <div
      className={`relative flex items-center justify-center ${className || ""}`}
      style={{ width: containerSize, height: containerSize, zIndex: 30 }}
    >
      {/* Main circle container */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        animate={containerScaleControls}
        initial={{ scale: 1 }}
      >
        <div className="relative w-full h-full bg-gradient-to-br from-blue-50 to-white rounded-full shadow-md overflow-visible">
          <motion.div className="absolute inset-0 overflow-visible" animate={pulseControls}>
            <svg
              className="w-full h-full -rotate-90 overflow-visible"
              viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
              style={{ overflow: "visible" }}
            >
              <defs>
                <linearGradient id={`progressGradient-${currentPercentage}`} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={colors.start} />
                  <stop offset="100%" stopColor={colors.end} />
                </linearGradient>

                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="2" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Background track */}
              <circle
                className="text-slate-100"
                strokeWidth={strokeWidth}
                stroke="currentColor"
                fill="none"
                r={radius}
                cx={center}
                cy={center}
              />

              {/* Tick marks every 25% - more subtle */}
              {[25, 50, 75, 100].map((tickPercentage) => {
                const point = getPointOnCircle(tickPercentage)
                return (
                  <circle
                    key={`tick-${tickPercentage}`}
                    cx={point.x}
                    cy={point.y}
                    r={1.5}
                    fill={tickPercentage <= Math.min(currentPercentage, 100) ? colors.start : "#cbd5e1"}
                    opacity={tickPercentage <= Math.min(currentPercentage, 100) ? 0.8 : 0.4}
                  />
                )
              })}

              {/* Progress circle - capped at 100% for visual */}
              <motion.circle
                stroke={`url(#progressGradient-${currentPercentage})`}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                fill="none"
                r={radius}
                cx={center}
                cy={center}
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{
                  strokeDashoffset: circumference - (Math.min(currentPercentage, 100) / 100) * circumference,
                }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                filter="url(#glow)"
              />

              {/* Progress indicator dot - more subtle */}
              {currentPercentage > 0 && (
                <motion.g>
                  {(() => {
                    // Cap the angle at 100% for the main indicator
                    const cappedPercentage = Math.min(currentPercentage, 100)
                    const angle = (cappedPercentage / 100) * Math.PI * 2 - Math.PI / 2
                    const x = center + Math.cos(angle) * radius
                    const y = center + Math.sin(angle) * radius

                    return (
                      <>
                        {/* Outer glow */}
                        <circle cx={x} cy={y} r={3} fill={`${colors.start}30`} filter="url(#glow)" />
                        {/* Inner dot */}
                        <circle cx={x} cy={y} r={2} fill={colors.start} />
                      </>
                    )
                  })()}
                </motion.g>
              )}

              {/* Overflow effect - second circle that overlaps */}
              {isOverHundred && showOverflowEffects && currentPercentage > 100 && (
                <motion.circle
                  stroke={colors.start}
                  strokeWidth={strokeWidth}
                  strokeLinecap="round"
                  fill="none"
                  r={radius}
                  cx={center}
                  cy={center}
                  strokeDasharray={circumference}
                  initial={{ strokeDashoffset: circumference }}
                  animate={{
                    strokeDashoffset: circumference - ((currentPercentage - 100) / 100) * circumference,
                  }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  opacity={0.5}
                  style={{ transform: "rotate(0deg)", transformOrigin: "center" }}
                />
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
          </motion.div>

          {/* Consolidated BOOM effect - combines multiple effects into one */}
          {showCompletionEffects && (
            <>
              {/* Main boom ring */}
              {/* <motion.div
                className="absolute inset-[-12px] rounded-full pointer-events-none"
                animate={boomControls}
                initial={{ scale: 1, opacity: 0 }}
                style={{
                  border: `4px solid ${colors.start}`,
                  filter: "blur(2px)",
                  background: `radial-gradient(circle, ${colors.start}20 0%, transparent 100%)`,
                }}
              /> */}

              {/* Glow effect
              <motion.div
                className="absolute inset-0 rounded-full pointer-events-none"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{
                  opacity: [0, 0., 0],
                  scale: [0.9, 1.3, 1.4],
                }}
                transition={{
                  duration: 1.0,
                  ease: "easeOut",
                  times: [0, 0.3, 1],
                }}
                style={{
                  background: `radial-gradient(circle, ${colors.start}60 0%, transparent 70%)`,
                  filter: "blur(8px)",
                }}
              /> */}
            </>
          )}
        </div>
      </motion.div>
    </div>
  )
}

