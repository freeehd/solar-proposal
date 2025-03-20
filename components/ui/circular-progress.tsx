"use client"

import { useRef, useEffect, useState } from "react"
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
  size = 280, // Increased from 140 to 280
}: CircularProgressProps) {
  // Animation controls
  const progressControls = useAnimationControls()
  const pulseControls = useAnimationControls()
  const textControls = useAnimationControls()
  const overflowControls = useAnimationControls()
  const boomControls = useAnimationControls()
  const boomRingControls = useAnimationControls()
  const boomGlowControls = useAnimationControls()

  // Refs to avoid unnecessary re-renders
  const animationRef = useRef<number | null>(null)
  const isAnimatingRef = useRef(false)
  const vibrationIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const lastVibrationTime = useRef(0)

  // State
  const [currentPercentage, setCurrentPercentage] = useState(0)
  const [showCompletionEffects, setShowCompletionEffects] = useState(false)
  const [showOverflowEffects, setShowOverflowEffects] = useState(false)
  const [showBoomEffect, setShowBoomEffect] = useState(false)
  const [preBoomPhase, setPreBoomPhase] = useState(false)

  // Calculate dimensions based on size prop
  const viewBoxSize = 140
  const radius = viewBoxSize * 0.4
  const strokeWidth = viewBoxSize * 0.06
  const center = viewBoxSize / 2
  const circumference = 2 * Math.PI * radius

  // Animation duration
  const animationDuration = 2500 // Slightly faster than original

  // Handle values over 100%
  const isOverHundred = percentage > 100
  const displayPercentage = percentage
  const overflowPercentage = isOverHundred ? percentage - 100 : 0

  // Get color based on percentage
  const getColors = (percent: number) => {
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
      // Changed from 75 to 70
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
  }

  const colors = getColors(Math.min(currentPercentage, 100))

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      if (vibrationIntervalRef.current) {
        clearInterval(vibrationIntervalRef.current)
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
      if (vibrationIntervalRef.current) {
        clearInterval(vibrationIntervalRef.current)
        vibrationIntervalRef.current = null
      }
      isAnimatingRef.current = false
      setPreBoomPhase(false)
    }
  }, [isCharging])

  // Add a vibration animation function that increases in intensity
  const updateVibrationEffect = (percent: number) => {
    // Clear previous interval if it exists
    if (vibrationIntervalRef.current) {
      clearInterval(vibrationIntervalRef.current)
    }

    // Calculate vibration intensity based on percentage
    // EXTREME exponential increase in amplitude as percentage increases
    const baseAmplitude = 0.3
    const maxAmplitude = 12 // Dramatically increased from 5 to 12

    // Higher exponent for even more dramatic curve
    const exponent = 4 // Increased from 3 to 4
    const normalizedPercent = percent / 100
    const amplitudeFactor = Math.pow(normalizedPercent, exponent)
    const amplitude = baseAmplitude + (maxAmplitude - baseAmplitude) * amplitudeFactor

    // Calculate vibration frequency based on percentage
    // Start slow and get EXTREMELY fast as percentage increases
    const baseFrequency = 250 // ms
    const minFrequency = 2 // ms - extremely fast at high percentages (reduced from 5ms)

    // Exponential decrease in frequency (faster vibration)
    const frequencyFactor = Math.pow(normalizedPercent, exponent)
    const frequency = Math.max(minFrequency, baseFrequency - (baseFrequency - minFrequency) * frequencyFactor)

    // Pre-boom phase - extreme vibration
    if (preBoomPhase) {
      // Ultra chaotic, extremely rapid vibration right before the boom
      vibrationIntervalRef.current = setInterval(() => {
        const randomAmplitudeX = Math.random() * 15 - 7.5 // Increased from 8 to 15
        const randomAmplitudeY = Math.random() * 15 - 7.5
        const randomRotate = Math.random() * 5 - 2.5 // Increased rotation
        const randomScale = 1 + (Math.random() * 0.1 - 0.05) // Add random scaling

        pulseControls.start({
          x: randomAmplitudeX,
          y: randomAmplitudeY,
          rotate: randomRotate,
          scale: randomScale,
          transition: {
            duration: 0.03, // Even faster transitions (reduced from 0.05)
            ease: "linear",
          },
        })
      }, 15) // Ultra rapid updates (reduced from 30ms)

      return
    }

    // Set new vibration interval with updated frequency
    vibrationIntervalRef.current = setInterval(() => {
      // More complex vibration pattern that gets more chaotic at higher percentages
      if (percent < 20) {
        // Reduced threshold from 30 to 20
        // Simple vibration at low percentages
        pulseControls.start({
          x: [0, -amplitude / 2, amplitude / 2, 0],
          y: [0, amplitude / 2, -amplitude / 2, 0],
          transition: {
            duration: 0.12, // Faster (reduced from 0.15)
            ease: "easeInOut",
          },
        })
      } else if (percent < 60) {
        // Reduced threshold from 70 to 60
        // More complex vibration at medium percentages
        pulseControls.start({
          x: [0, -amplitude, amplitude, -amplitude / 2, amplitude / 2, 0],
          y: [0, amplitude / 2, -amplitude, amplitude / 2, -amplitude / 2, 0],
          rotate: [0, 0.3, -0.3, 0], // Added slight rotation
          transition: {
            duration: 0.1, // Faster (reduced from 0.12)
            ease: "easeInOut",
          },
        })
      } else {
        // Extremely chaotic vibration at high percentages
        const randomOffset = Math.random() * amplitude * 0.3
        pulseControls.start({
          x: [0, -amplitude + randomOffset, amplitude / 2, -amplitude / 3, amplitude - randomOffset, -amplitude / 2, 0],
          y: [0, amplitude / 2, -amplitude + randomOffset, amplitude / 3, -amplitude / 2 - randomOffset, amplitude, 0],
          rotate: [0, 1, -1, 0.5, -0.5, 0], // More extreme rotation
          scale: [1, 1.02, 0.98, 1.01, 0.99, 1], // Add pulsing effect
          transition: {
            duration: 0.08, // Even faster (reduced from 0.1)
            ease: "linear",
          },
        })
      }
    }, frequency)

    // Add random "thugs" - extra pulses at random intervals for higher percentages
    if (percent > 40) {
      // Reduced threshold from 50 to 40
      const now = Date.now()
      // Don't add extra thugs too frequently
      if (now - lastVibrationTime.current > 300) {
        // Reduced from 500ms to 300ms
        lastVibrationTime.current = now

        // Random extra "thug" pulse - more intense
        setTimeout(() => {
          // More dramatic pulse
          pulseControls.start({
            scale: [1, 1.05, 0.97, 1.02, 0.99, 1], // More extreme scale changes
            rotate: [0, Math.random() * 2 - 1, 0], // Add random rotation
            transition: { duration: 0.15, ease: "easeOut" }, // Faster (reduced from 0.2)
          })
        }, Math.random() * 200) // Faster random timing (reduced from 300ms)
      }
    }

    // Add even more random "thugs" at very high percentages
    if (percent > 80) {
      // Additional random pulses for extreme percentages
      setTimeout(() => {
        const randomAmplitudeX = Math.random() * amplitude - amplitude / 2
        const randomAmplitudeY = Math.random() * amplitude - amplitude / 2

        pulseControls.start({
          x: randomAmplitudeX,
          y: randomAmplitudeY,
          transition: { duration: 0.05, ease: "linear" },
        })
      }, Math.random() * 100)
    }
  }

  // Animation function
  const startAnimation = () => {
    isAnimatingRef.current = true
    setCurrentPercentage(0) // Start from 0
    setShowOverflowEffects(false)
    setShowBoomEffect(false)
    setPreBoomPhase(false)

    // Reset animation state
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }

    // Start initial vibration
    updateVibrationEffect(0)

    // Start progress animation
    const startTime = performance.now()

    const animate = (time: number) => {
      const elapsed = time - startTime
      const progress = Math.min(elapsed / animationDuration, 1)

      // Changed easing function to prevent overshooting
      // Using a simpler easeOutQuad function instead of cubic bezier
      const easedProgress = easeOutQuad(progress)

      // Use actual percentage for the animation target
      const newPercentage = Math.round(easedProgress * percentage)

      if (newPercentage !== currentPercentage) {
        setCurrentPercentage(newPercentage)
        onProgressUpdate?.(newPercentage / 100)

        // Update vibration intensity based on current percentage
        updateVibrationEffect(newPercentage)

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
          updateVibrationEffect(100) // Update with pre-boom vibration
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

  // Simple easeOutQuad function that doesn't overshoot
  const easeOutQuad = (t: number) => t * (2 - t)

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
    setShowBoomEffect(true)
    setPreBoomPhase(false)

    // Stop vibration
    if (vibrationIntervalRef.current) {
      clearInterval(vibrationIntervalRef.current)
      vibrationIntervalRef.current = null
    }

    // Reset position
    pulseControls.start({
      x: 0,
      y: 0,
      rotate: 0,
      transition: { duration: 0.1 },
    })

    // BOOM effect - dramatic expansion and contraction
    setTimeout(() => {
      // More refined BOOM effect with smaller scale values
      pulseControls.start({
        scale: [1, 1.15, 0.9, 1.08, 0.95, 1.03, 0.98, 1.01, 1], // Reduced scale changes
        rotate: [0, 1.5, -0.8, 0.4, -0.2, 0], // Less extreme rotation
        transition: {
          duration: 0.9, // Slightly shorter duration
          ease: [0.22, 1.2, 0.36, 1],
          times: [0, 0.15, 0.3, 0.45, 0.6, 0.75, 0.85, 0.95, 1],
        },
      })

      // Text effect - more subtle
      textControls.start({
        scale: [1, 1.2, 0.85, 1.1, 0.95, 1.05, 1], // Less extreme scale changes
        transition: { duration: 0.9, ease: "easeOut" },
      })

      // Boom animation for the outer ring - more contained
      boomControls.start({
        scale: [1, 1, 1], // Smaller expansion
        opacity: [0, 0.8, 0],
        transition: { duration: 1.1, ease: "easeOut" },
      })

      // Multiple concentric rings for more refined effect
      boomRingControls.start({
        scale: [1, 1.1],
        opacity: [0, 0.7, 0],
        transition: { duration: 1.2, ease: "easeOut", times: [0, 0.3, 1] },
      })

      // Refined glow effect
      boomGlowControls.start({
        scale: [1, 1.2],
        opacity: [0, 0.7, 0],
        transition: { duration: 1.3, ease: "easeOut", times: [0, 0.25, 1] },
      })
    }, 100)

    // Clean up after effects
    setTimeout(() => {
      setShowCompletionEffects(false)
      setShowBoomEffect(false)
      isAnimatingRef.current = false
      onChargingComplete?.()
    }, 1800) // Longer cleanup time for more dramatic effect
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
      <div className="absolute inset-0 flex items-center justify-center">
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

                <filter id="boomGlow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="12" result="blur" />
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

          {/* BOOM effect - outer ring explosion */}
          {showBoomEffect && (
            <motion.div
              className="absolute inset-[-15px] rounded-full pointer-events-none"
              animate={boomControls}
              initial={{ scale: 1, opacity: 0 }}
              style={{
                border: `6px solid ${colors.start}`, // Thinner border
                filter: "blur(3px)", // Less blur
              }}
            />
          )}

          {/* BOOM effect - secondary ring (replacing particles) */}
          {showBoomEffect && (
            <motion.div
              className="absolute inset-[-8px] rounded-full pointer-events-none"
              animate={boomRingControls}
              initial={{ scale: 1, opacity: 0 }}
              style={{
                border: `2px solid ${colors.start}`,
                filter: "blur(1.5px)",
              }}
            />
          )}

          {/* BOOM effect - radial glow */}
          {showBoomEffect && (
            <motion.div
              className="absolute inset-0 rounded-full pointer-events-none"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{
                opacity: [0, 0.8, 0],
                scale: [0.9, 1.5, 1.7], // More contained expansion
              }}
              transition={{
                duration: 1.2, // Slightly shorter
                ease: "easeOut",
                times: [0, 0.3, 1],
              }}
              style={{
                background: `radial-gradient(circle, ${colors.start}80 0%, ${colors.end}00 70%)`,
                filter: "blur(10px)", // Less blur
              }}
            />
          )}

          {/* BOOM effect - enhanced glow (replacing particles) */}
          {showBoomEffect && (
            <motion.div
              className="absolute inset-0 rounded-full pointer-events-none"
              animate={boomGlowControls}
              initial={{ scale: 1, opacity: 0 }}
              style={{
                background: `radial-gradient(circle, ${colors.start}70 10%, transparent 70%)`,
                filter: "blur(12px)", // Less intense blur
              }}
            />
          )}

          {/* Completion effect - simplified */}
          {showCompletionEffects && !showBoomEffect && (
            <div className="absolute inset-0 overflow-visible pointer-events-none">
              {/* Simple ripple effect */}
              <motion.div
                className="absolute inset-0 rounded-full"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: [0, 0.2, 0], scale: [0.9, 1.1, 1.15] }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                style={{
                  border: `1px solid ${colors.start}`,
                }}
              />

              {/* Glow effect */}
              <motion.div
                className="absolute inset-0 rounded-full"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: [0, 0.3, 0], scale: [0.9, 1.08, 1.12] }}
                transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
                style={{
                  background: `radial-gradient(circle, ${colors.start}30 0%, ${colors.end}00 70%)`,
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

