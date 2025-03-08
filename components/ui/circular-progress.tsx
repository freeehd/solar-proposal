"use client"

import { useRef, useCallback, useState, useEffect } from "react"
import { motion, useAnimation } from "framer-motion"

interface CircularProgressProps {
  percentage: number
  isCharging?: boolean
  onChargingComplete?: () => void
  onProgressUpdate?: (progress: number) => void // New callback for progress updates
}

export function CircularProgress({
  percentage,
  isCharging,
  onChargingComplete,
  onProgressUpdate,
}: CircularProgressProps) {
  // Use refs for values that don't need to trigger re-renders
  const progressRef = useRef(0)
  const animationFrameRef = useRef<number | null>(null)
  const startTimeRef = useRef<number>(0)
  const startPercentageRef = useRef<number>(0)
  const isGrowingRef = useRef(false) // Use ref instead of state to avoid re-renders
  const scaleRef = useRef(1)
  const pulseTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastMilestoneRef = useRef(0) // Track the last milestone we hit

  // Controls for animations
  const circleControls = useAnimation()
  const pulseControls = useAnimation() // Separate controls for pulse
  const textControls = useAnimation()
  const glowControls = useAnimation()

  // States that require re-renders
  const [currentPercentage, setCurrentPercentage] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const [showRipple, setShowRipple] = useState(false)
  const [showPulse, setShowPulse] = useState(false)

  // Constants
  const circumference = 2 * Math.PI * 60

  // Define milestone percentages and their corresponding scales
  const milestones = [
    { percentage: 0, scale: 0.85 },
    { percentage: 20, scale: 0.92 },
    { percentage: 40, scale: 0.98 },
    { percentage: 60, scale: 1.05 },
    { percentage: 80, scale: 1.12 },
    { percentage: 100, scale: 1.2 },
  ]

  // Helper function to get color based on percentage - premium gradients
  const getColorGradient = useCallback((percentage: number) => {
    if (percentage <= 25) {
      return {
        start: "rgb(239, 68, 68)", // red-500
        end: "rgb(249, 115, 22)", // orange-500
        text: "rgb(239, 68, 68)", // red-500
      }
    } else if (percentage <= 50) {
      return {
        start: "rgb(249, 115, 22)", // orange-500
        end: "rgb(234, 179, 8)", // yellow-500
        text: "rgb(249, 115, 22)", // orange-500
      }
    } else if (percentage <= 75) {
      return {
        start: "rgb(234, 179, 8)", // yellow-500
        end: "rgb(34, 197, 94)", // green-500
        text: "rgb(234, 179, 8)", // yellow-500
      }
    } else {
      return {
        start: "rgb(34, 197, 94)", // green-500
        end: "rgb(21, 128, 61)", // green-700
        text: "rgb(34, 197, 94)", // green-500
      }
    }
  }, [])

  const colors = getColorGradient(currentPercentage)

  // Clean up animation frame and timeouts on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      if (pulseTimeoutRef.current !== null) {
        clearTimeout(pulseTimeoutRef.current)
      }
    }
  }, [])

  // Function to trigger a subtle pulse animation
  const triggerPulse = useCallback(
    (continuous = false, intensity = 1) => {
      // Get the current base scale
      const baseScale = scaleRef.current

      if (continuous) {
        // Continuous subtle pulsing effect
        pulseControls.start({
          scale: [1, 1.02, 1],
          transition: {
            duration: 1.2,
            ease: "easeInOut",
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
          },
        })
      } else {
        // One-time more noticeable pulse effect for milestones
        // Intensity factor allows for stronger pulses at higher milestones
        const pulseAmount = 0.05 * intensity

        pulseControls.start({
          scale: [1, 1 + pulseAmount, 1],
          transition: {
            duration: 0.6,
            ease: "easeInOut",
          },
        })
      }
    },
    [pulseControls],
  )

  // Function to find the appropriate scale for a given percentage
  const getScaleForPercentage = useCallback((percentage: number) => {
    // Find the two milestones that this percentage falls between
    let lowerMilestone = milestones[0]
    let upperMilestone = milestones[milestones.length - 1]

    for (let i = 0; i < milestones.length - 1; i++) {
      if (percentage >= milestones[i].percentage && percentage < milestones[i + 1].percentage) {
        lowerMilestone = milestones[i]
        upperMilestone = milestones[i + 1]
        break
      }
    }

    // If we're at exactly 100%, use the final milestone
    if (percentage === 100) {
      return milestones[milestones.length - 1].scale
    }

    // Calculate how far we are between the two milestones (0 to 1)
    const range = upperMilestone.percentage - lowerMilestone.percentage
    const progress = range === 0 ? 0 : (percentage - lowerMilestone.percentage) / range

    // Interpolate between the two scales using easeInOut for a nice curve
    // This creates a slow start, fast middle, slow end effect
    const easedProgress = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2

    return lowerMilestone.scale + (upperMilestone.scale - lowerMilestone.scale) * easedProgress
  }, [])

  // Function to animate completion effect - more dramatic and elastic BOOM
  const animateCompletion = useCallback(async () => {
    // Cancel any ongoing animation frame
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }

    pulseControls.stop() // Stop the continuous pulsing

    // Clear any pending pulse timeouts
    if (pulseTimeoutRef.current !== null) {
      clearTimeout(pulseTimeoutRef.current)
      pulseTimeoutRef.current = null
    }

    setIsComplete(true)
    setShowRipple(true)
    setShowPulse(true)

    // Prepare for the BOOM - initial build-up
    await circleControls.start({
      scale: [scaleRef.current, scaleRef.current + 0.05, scaleRef.current + 0.1],
      transition: {
        duration: 0.4,
        ease: "easeIn",
      },
    })

    // BOOM effect - super dramatic elastic effect
    await circleControls.start({
      scale: [scaleRef.current + 0.1, scaleRef.current + 0.2, 0.9, 1.05, 1],
      transition: {
        duration: 1,
        ease: [0.22, 1.2, 0.36, 1], // Less extreme bounce
        times: [0, 0.2, 0.5, 0.8, 1],
      },
    })

    // Text animation with dramatic bounce
    await textControls.start({
      scale: [1, 1.2, 0.9, 1],
      opacity: [1, 1, 1, 1],
      transition: {
        duration: 0.8,
        ease: "easeOut",
        times: [0, 0.3, 0.7, 1],
      },
    })

    // Glow pulse effect
    glowControls.start({
      opacity: [0.2, 0.8, 0.2],
      scale: [1, 1.3, 1],
      transition: {
        duration: 0.8,
        ease: "easeOut",
      },
    })

    // Cleanup and callback
    setTimeout(() => {
      setShowRipple(false)
      setShowPulse(false)
      setIsComplete(false)
      isGrowingRef.current = false // Reset for next time
      scaleRef.current = 1 // Reset scale
      lastMilestoneRef.current = 0 // Reset milestone tracker
      onChargingComplete?.()
    }, 1200)
  }, [circleControls, textControls, glowControls, pulseControls, onChargingComplete])

  // Effect to handle initial animation when charging starts
  useEffect(() => {
    if (isCharging && !isGrowingRef.current) {
      isGrowingRef.current = true
      scaleRef.current = milestones[0].scale // Start from the first milestone scale
      lastMilestoneRef.current = 0 // Reset milestone tracker

      // Simple grow from small to normal size - ONE TIME ONLY
      circleControls.start({
        scale: milestones[0].scale,
        transition: {
          duration: 0.1, // Quick transition to starting scale
          ease: "easeOut",
        },
      })

      // Start continuous pulsing immediately
      triggerPulse(true)

      // Notify about initial progress
      onProgressUpdate?.(0)
    } else if (!isCharging) {
      isGrowingRef.current = false
      scaleRef.current = 1
      lastMilestoneRef.current = 0

      // Clear any pending pulse timeouts
      if (pulseTimeoutRef.current !== null) {
        clearTimeout(pulseTimeoutRef.current)
        pulseTimeoutRef.current = null
      }
    }
  }, [isCharging, circleControls, triggerPulse, onProgressUpdate])

  // Main charging animation effect - with incremental growth at milestones
  useEffect(() => {
    if (!isCharging) return

    // Reset animation state
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }

    // Initialize charging state
    setShowRipple(false) // Don't show ripple during charging
    startTimeRef.current = 0 // Reset to 0 to ensure proper initialization
    startPercentageRef.current = currentPercentage
    progressRef.current = currentPercentage

    // Fast but smooth progress animation
    const duration = 600 // 0.6 seconds

    const animateProgress = (timestamp: number) => {
      // Initialize start time on first frame
      if (startTimeRef.current === 0) {
        startTimeRef.current = timestamp
      }

      const elapsed = timestamp - startTimeRef.current
      const progress = Math.min(elapsed / duration, 1)

      // Linear progress - no easing
      const targetPercentage = startPercentageRef.current + (percentage - startPercentageRef.current) * progress

      // Only update state when there's a meaningful change (integer change)
      if (Math.floor(targetPercentage) !== Math.floor(progressRef.current)) {
        const newPercentage = Math.floor(targetPercentage)
        setCurrentPercentage(newPercentage)

        // Call the progress update callback with normalized progress (0-1)
        onProgressUpdate?.(newPercentage / 100)

        // Get the appropriate scale for this percentage using our milestone-based calculation
        const newScale = getScaleForPercentage(newPercentage)
        scaleRef.current = newScale

        // Update the scale animation
        circleControls.set({
          scale: newScale,
        })

        // Check if we've hit a new milestone
        const currentMilestone = Math.floor(newPercentage / 20) * 20
        if (currentMilestone > lastMilestoneRef.current && currentMilestone > 0) {
          // We've hit a new milestone!
          lastMilestoneRef.current = currentMilestone

          // Calculate intensity based on milestone (higher milestones get stronger pulses)
          const intensity = 1 + currentMilestone / 100

          // Clear any existing timeout
          if (pulseTimeoutRef.current !== null) {
            clearTimeout(pulseTimeoutRef.current)
          }

          // Trigger a stronger one-time pulse with a small delay
          pulseTimeoutRef.current = setTimeout(() => {
            // Temporarily stop continuous pulse
            pulseControls.stop()

            // Trigger stronger pulse with increasing intensity
            triggerPulse(false, intensity)

            // Resume continuous pulse after the stronger pulse
            setTimeout(() => {
              triggerPulse(true)
            }, 700)
          }, 50)

          // Animate the growth step more dramatically
          circleControls.start({
            scale: newScale,
            transition: {
              type: "spring",
              stiffness: 300,
              damping: 15,
              duration: 0.5,
            },
          })
        }
      }

      progressRef.current = targetPercentage

      if (progress < 1) {
        // Continue animation
        animationFrameRef.current = requestAnimationFrame(animateProgress)
      } else {
        // Animation complete
        animationFrameRef.current = null

        // Final progress update
        onProgressUpdate?.(1)

        animateCompletion()
      }
    }

    // Start the animation
    animationFrameRef.current = requestAnimationFrame(animateProgress)

    // Cleanup function
    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }
      if (pulseTimeoutRef.current !== null) {
        clearTimeout(pulseTimeoutRef.current)
        pulseTimeoutRef.current = null
      }
      circleControls.stop()
      pulseControls.stop()
      textControls.stop()
      glowControls.stop()
    }
  }, [
    isCharging,
    percentage,
    circleControls,
    pulseControls,
    animateCompletion,
    currentPercentage,
    textControls,
    glowControls,
    triggerPulse,
    getScaleForPercentage,
    onProgressUpdate,
  ])

  return (
    <div className="relative w-52 h-52 flex items-center justify-center">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-white rounded-full shadow-md">
        <motion.div className="absolute inset-0" animate={circleControls} style={{ zIndex: 30 }}>
          <motion.div className="absolute inset-0" animate={pulseControls}>
            <svg className="w-full h-full -rotate-90" viewBox="0 0 140 140" style={{ overflow: "visible" }}>
              <defs>
                <linearGradient id={`progressGradient-${currentPercentage}`} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={colors.start} />
                  <stop offset="100%" stopColor={colors.end} />
                </linearGradient>

                {/* Premium glow effect */}
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>

                {/* Super enhanced glow for completion - SIMPLIFIED */}
                <filter id="super-glow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="8" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Background track */}
              <circle
                className="text-slate-100"
                strokeWidth="10"
                stroke="currentColor"
                fill="none"
                r="60"
                cx="70"
                cy="70"
              />

              {/* Progress circle */}
              <motion.circle
                stroke={`url(#progressGradient-${currentPercentage})`}
                strokeWidth="15"
                strokeLinecap="round"
                fill="white"
                r="60"
                cx="70"
                cy="70"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{
                  strokeDashoffset: circumference - (currentPercentage / 100) * circumference,
                }}
                transition={{
                  duration: 0.5,
                  ease: "easeOut",
                }}
                filter={isComplete ? "url(#super-glow)" : "url(#glow)"}
              />

              {/* Ripple effect - ONLY SHOWN AT COMPLETION */}
              {showRipple && isComplete && (
                <motion.circle
                  r="60"
                  cx="70"
                  cy="70"
                  fill="none"
                  stroke={`url(#progressGradient-${currentPercentage})`}
                  strokeWidth="2"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{
                    opacity: [0, 0.5, 0],
                    scale: [0.8, 1.3, 1.5],
                  }}
                  transition={{
                    duration: 1.5,
                    ease: "easeOut",
                  }}
                />
              )}
            </svg>
          </motion.div>
        </motion.div>

        {/* Percentage text and label */}
        <motion.div
          className="absolute inset-0 flex flex-col items-center justify-center"
          animate={textControls}
          style={{ zIndex: 40 }}
        >
          <motion.span
            className="text-5xl font-medium leading-tight"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            style={{ color: colors.text }}
          >
            {currentPercentage}%
          </motion.span>
          <motion.span
            className="text-sm text-slate-500 font-normal leading-tight"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            Energy Offset
          </motion.span>
        </motion.div>
      </div>

      {/* Enhanced glow effect on completion */}
      {showPulse && (
        <motion.div
          className="absolute inset-0 rounded-full"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={glowControls}
          style={{
            background: `radial-gradient(circle, ${colors.start}40 0%, ${colors.end}00 70%)`,
            zIndex: 25,
          }}
        />
      )}

      {/* Flash effect on completion */}
      {isComplete && (
        <motion.div
          className="absolute inset-0 rounded-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.9, 0] }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          style={{
            background: colors.start,
            zIndex: 45,
          }}
        />
      )}
    </div>
  )
}

