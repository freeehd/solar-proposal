"use client"

import { useRef, useCallback, useState, useEffect } from "react"
import { motion, useAnimation } from "framer-motion"

interface CircularProgressProps {
  percentage: number
  isCharging?: boolean
  onChargingComplete?: () => void
}

export function CircularProgress({ percentage, isCharging, onChargingComplete }: CircularProgressProps) {
  // Use refs for values that don't need to trigger re-renders
  const progressRef = useRef(0)
  const animationFrameRef = useRef<number | null>(null)
  const startTimeRef = useRef<number>(0)
  const startPercentageRef = useRef<number>(0)
  const lastMilestoneRef = useRef<number>(0)

  // Controls for animations
  const circleControls = useAnimation()
  const textControls = useAnimation()
  const containerControls = useAnimation()
  const chargeControls = useAnimation()

  // States that require re-renders
  const [currentPercentage, setCurrentPercentage] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const [showRipple, setShowRipple] = useState(false)
  const [isChargingUp, setIsChargingUp] = useState(false)

  // Constants
  const circumference = 2 * Math.PI * 60

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

  // Clean up animation frame on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [])

  // Function to animate completion effect - explosive but premium
  const animateCompletion = useCallback(async () => {
    // Cancel any ongoing animation frame
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }

    setIsComplete(true)
    setShowRipple(true)
    setIsChargingUp(false)

    // Stop charging animation
    chargeControls.stop()

    // BOOM effect - more dramatic but still premium
    await circleControls.start({
      scale: [1, 1.15, 0.95, 1.05, 1],
      transition: {
        duration: 0.8,
        ease: [0.22, 1.4, 0.36, 1], // More bouncy for the boom
        times: [0, 0.3, 0.5, 0.7, 1],
      },
    })

    // Text animation with slight bounce
    await textControls.start({
      scale: [1, 1.1, 0.95, 1],
      opacity: [1, 1, 1, 1],
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    })

    // Cleanup and callback
    setTimeout(() => {
      setShowRipple(false)
      setIsComplete(false)
      lastMilestoneRef.current = 0
      onChargingComplete?.()
    }, 800)
  }, [circleControls, textControls, chargeControls, onChargingComplete])

  // Main charging animation effect - with build-up
  useEffect(() => {
    if (!isCharging) return

    // Reset animation state
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }

    // Initialize charging state
    setShowRipple(true)
    setIsChargingUp(false)
    startTimeRef.current = 0 // Reset to 0 to ensure proper initialization
    startPercentageRef.current = currentPercentage
    progressRef.current = currentPercentage
    lastMilestoneRef.current = 0

    // Fast but smooth progress animation
    const duration = 600 // 0.6 seconds - fast but not too aggressive

    const animateProgress = (timestamp: number) => {
      // Initialize start time on first frame
      if (startTimeRef.current === 0) {
        startTimeRef.current = timestamp
      }

      const elapsed = timestamp - startTimeRef.current
      const progress = Math.min(elapsed / duration, 1)

      // Smooth acceleration curve
      const easedProgress = progress === 0 ? 0 : Math.pow(progress, 1.8) // Accelerated but not too aggressive

      const targetPercentage = startPercentageRef.current + (percentage - startPercentageRef.current) * easedProgress

      // Only update state when there's a meaningful change (integer change)
      if (Math.floor(targetPercentage) !== Math.floor(progressRef.current)) {
        const newPercentage = Math.floor(targetPercentage)
        setCurrentPercentage(newPercentage)

        // Start charging up effect at 20%
        if (newPercentage >= 20 && !isChargingUp) {
          setIsChargingUp(true)

          // Start vibration and scaling that intensifies with progress
          chargeControls.start({
            x: [0, -1, 1, -1, 0],
            y: [0, 1, -1, 1, 0],
            scale: [1, 1.01, 1, 1.01, 1],
            transition: {
              duration: 0.3,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "loop",
            },
          })
        }

        // Increase vibration intensity as percentage increases
        if (isChargingUp && newPercentage >= 20) {
          const intensity = 0.5 + (newPercentage / 100) * 2
          const scale = 1 + (newPercentage / 100) * 0.05

          chargeControls.start({
            x: [0, -intensity, intensity, -intensity, 0],
            y: [0, intensity, -intensity, intensity, 0],
            scale: [1, scale, 1, scale, 1],
            transition: {
              duration: Math.max(0.1, 0.3 - (newPercentage / 100) * 0.2), // Get faster
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "loop",
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
      circleControls.stop()
      textControls.stop()
      containerControls.stop()
      chargeControls.stop()
      setIsChargingUp(false)
    }
  }, [
    isCharging,
    percentage,
    circleControls,
    animateCompletion,
    currentPercentage,
    textControls,
    containerControls,
    chargeControls,
    isChargingUp,
  ])

  return (
    <div className="relative w-52 h-52 flex items-center justify-center">
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-blue-50 to-white rounded-full shadow-md"
        animate={chargeControls}
      >
        <motion.div className="absolute inset-0" animate={circleControls} style={{ zIndex: 30 }}>
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

              {/* Enhanced glow for charging state */}
              <filter id="enhanced-glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="8" result="coloredBlur" />
                <feColorMatrix
                  in="coloredBlur"
                  type="matrix"
                  values="1 0 0 0 0
                          0 1 0 0 0
                          0 0 2 0 0
                          0 0 0 3 0"
                />
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
              filter={isCharging ? "url(#enhanced-glow)" : "url(#glow)"}
            />

            {/* Ripple effect */}
            {showRipple && (
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
                  scale: [0.8, 1.2, 1.4],
                }}
                transition={{
                  duration: 1,
                  ease: "easeOut",
                  repeat: isComplete ? 0 : Number.POSITIVE_INFINITY,
                  repeatDelay: 0.5,
                }}
              />
            )}
          </svg>
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

        {/* Background ripple effect */}
        {showRipple && (
          <motion.div
            className="absolute inset-0"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{
              scale: [0.8, 1.2, 1.4],
              opacity: [0, 0.3, 0],
            }}
            transition={{
              duration: 1.5,
              ease: "easeInOut",
              repeat: isComplete ? 0 : Number.POSITIVE_INFINITY,
              repeatDelay: 0.5,
            }}
            style={{ zIndex: 20 }}
          >
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: colors.start,
                opacity: 0.2,
              }}
            />
          </motion.div>
        )}
      </motion.div>

      {/* Flash effect on completion */}
      {isComplete && (
        <motion.div
          className="absolute inset-0 rounded-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.7, 0] }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          style={{
            background: colors.start,
            zIndex: 45,
          }}
        />
      )}
    </div>
  )
}

