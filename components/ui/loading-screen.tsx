"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Sun } from "lucide-react"

interface LoadingScreenProps {
  onLoadingComplete: () => void
  progress?: number // External progress value (0-100)
  minDisplayTime?: number // Minimum time to display the loading screen
}

// Default minimum display time of 2 seconds
const DEFAULT_MINIMUM_DISPLAY_TIME = 2000

export default function LoadingScreen({
  onLoadingComplete,
  progress: externalProgress,
  minDisplayTime = DEFAULT_MINIMUM_DISPLAY_TIME,
}: LoadingScreenProps) {
  const [displayProgress, setDisplayProgress] = useState(0)
  const [loadingMessage, setLoadingMessage] = useState("Initializing...")
  const [isVisible, setIsVisible] = useState(true)
  const [showParticles, setShowParticles] = useState(false)
  const isMountedRef = useRef(true)
  const startTimeRef = useRef(Date.now())
  const completionTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const progressRef = useRef(0)
  const animationFrameRef = useRef<number | null>(null)
  const instanceIdRef = useRef(`loading-screen-${Math.random().toString(36).substring(2, 9)}`)

  // Log component mounting
  useEffect(() => {
    const instanceId = instanceIdRef.current
    console.log(`LoadingScreen [${instanceId}]: Component mounted`)

    return () => {
      console.log(`LoadingScreen [${instanceId}]: Component unmounted`)
      isMountedRef.current = false

      // Clean up animation frame
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [])

  // Block scrolling when loading screen is visible
  useEffect(() => {
    if (isVisible) {
      // Save the current overflow style
      const originalStyle = window.getComputedStyle(document.body).overflow

      // Prevent scrolling
      document.body.style.overflow = "hidden"

      // Restore scrolling when component unmounts or loading completes
      return () => {
        document.body.style.overflow = originalStyle
      }
    }
  }, [isVisible])

  // Show particles after initial load
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isMountedRef.current) {
        setShowParticles(true)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  // Calculate remaining time to meet minimum display time
  const calculateRemainingTime = (): number => {
    const elapsedTime = Date.now() - startTimeRef.current
    return Math.max(0, minDisplayTime - elapsedTime)
  }

  // Handle loading completion
  const completeLoading = () => {
    const instanceId = instanceIdRef.current

    if (completionTimeoutRef.current) {
      clearTimeout(completionTimeoutRef.current)
      completionTimeoutRef.current = null
    }

    console.log(`LoadingScreen [${instanceId}]: Starting fade-out after minimum display time`)
    setIsVisible(false)

    // Notify parent component after fade-out animation
    setTimeout(() => {
      if (!isMountedRef.current) return
      console.log(`LoadingScreen [${instanceId}]: Notifying parent of completion`)
      onLoadingComplete()
    }, 800)
  }

  // Handle progress updates
  useEffect(() => {
    const instanceId = instanceIdRef.current

    // Update the internal progress reference when external progress changes
    if (externalProgress !== undefined) {
      console.log(`LoadingScreen [${instanceId}]: External progress updated to ${externalProgress}%`)
      progressRef.current = externalProgress
    }

    // Smoothly animate the displayed progress
    const animateProgress = () => {
      if (!isMountedRef.current) return

      if (displayProgress < progressRef.current) {
        setDisplayProgress((prev) => {
          // Move faster when there's a big gap
          const gap = progressRef.current - prev
          const increment = Math.max(1, Math.floor(gap / 10))
          return Math.min(prev + increment, progressRef.current)
        })
        animationFrameRef.current = requestAnimationFrame(animateProgress)
      }
    }

    // Start the animation
    animationFrameRef.current = requestAnimationFrame(animateProgress)

    // Clean up animation frame on unmount or when dependencies change
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [externalProgress, displayProgress])

  // Update loading message based on progress
  useEffect(() => {
    if (progressRef.current < 20) {
      setLoadingMessage("Initializing...")
    } else if (progressRef.current < 40) {
      setLoadingMessage("Loading videos...")
    } else if (progressRef.current < 80) {
      setLoadingMessage("Preparing content...")
    } else {
      setLoadingMessage("Almost ready...")
    }

    // If progress reaches 100%, complete loading after minimum time
    if (progressRef.current >= 100) {
      const instanceId = instanceIdRef.current
      console.log(`LoadingScreen [${instanceId}]: Progress reached 100%, preparing to complete`)
      setLoadingMessage("Ready!")

      // Calculate remaining time to meet minimum display time
      const remainingTime = calculateRemainingTime()
      console.log(`LoadingScreen [${instanceId}]: Minimum display time remaining: ${remainingTime}ms`)

      // Wait for the minimum display time before hiding
      completionTimeoutRef.current = setTimeout(() => {
        if (!isMountedRef.current) return
        completeLoading()
      }, remainingTime)
    }
  }, [externalProgress])

  // Handle loading and ensure minimum display time
  useEffect(() => {
    const instanceId = instanceIdRef.current
    isMountedRef.current = true
    console.log(`LoadingScreen [${instanceId}]: Initializing with min display time: ${minDisplayTime}ms`)

    // Record start time
    startTimeRef.current = Date.now()

    // Force completion after timeout (15 seconds)
    const forceCompleteTimeout = setTimeout(() => {
      if (!isMountedRef.current) return

      if (isVisible) {
        console.warn(`LoadingScreen [${instanceId}]: Force completing loading after timeout`)
        progressRef.current = 100
        setLoadingMessage("Ready!")

        // Still ensure minimum display time
        const remainingTime = calculateRemainingTime()

        completionTimeoutRef.current = setTimeout(
          () => {
            if (!isMountedRef.current) return
            completeLoading()
          },
          Math.min(remainingTime, minDisplayTime / 2),
        )
      }
    }, 15000) // 15 second timeout (increased from 10s)

    return () => {
      isMountedRef.current = false
      if (completionTimeoutRef.current) {
        clearTimeout(completionTimeoutRef.current)
      }
      clearTimeout(forceCompleteTimeout)
    }
  }, [onLoadingComplete, isVisible, minDisplayTime])

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-b from-gray-900 to-gray-950"
      style={{
        opacity: isVisible ? 1 : 0,
        visibility: isVisible ? "visible" : "hidden",
        transition: "opacity 0.8s cubic-bezier(0.22, 1, 0.36, 1), visibility 0s linear 0.8s",
        pointerEvents: isVisible ? "auto" : "none",
      }}
    >
      {showParticles && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-yellow-400/20"
              initial={{
                x: `${Math.random() * 100}%`,
                y: `${Math.random() * 100}%`,
                scale: 0,
                opacity: 0,
              }}
              animate={{
                scale: Math.random() * 0.5 + 0.5,
                opacity: Math.random() * 0.3 + 0.1,
                x: `${Math.random() * 100}%`,
                y: `${Math.random() * 100}%`,
              }}
              transition={{
                duration: Math.random() * 10 + 10,
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "reverse",
                ease: "easeInOut",
                delay: Math.random() * 2,
              }}
              style={{
                width: `${Math.random() * 20 + 5}px`,
                height: `${Math.random() * 20 + 5}px`,
              }}
            />
          ))}
        </div>
      )}

      <div className="relative flex flex-col items-center">
        {/* Animated sun icon with rays */}
        <div className="relative mb-8">
          <motion.div
            animate={{
              rotate: 360,
              scale: [1, 1.1, 1],
            }}
            transition={{
              rotate: { duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" },
              scale: { duration: 3, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" },
            }}
            className="relative z-10"
          >
            <Sun className="h-24 w-24 text-yellow-400" strokeWidth={1.5} />
          </motion.div>

          {/* Animated rays */}
          <motion.div
            className="absolute inset-0 z-0"
            animate={{
              opacity: [0.4, 0.7, 0.4],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 3,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "reverse",
            }}
          >
            <div className="absolute inset-0 rounded-full bg-yellow-400/20 blur-xl" />
          </motion.div>
        </div>

        {/* Company name */}
        <motion.h1
          className="text-4xl font-bold text-white mb-10"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          Sun Studios
        </motion.h1>

        {/* Progress bar container */}
        <div className="w-72 mb-2">
          <div className="flex justify-between text-xs text-white/50 mb-1">
            <span>Loading Progress</span>
            <span>{displayProgress}%</span>
          </div>

          {/* Enhanced progress bar */}
          <div className="h-2 bg-gray-800/60 rounded-full overflow-hidden backdrop-blur-sm border border-white/10">
            <motion.div
              className="h-full bg-gradient-to-r from-yellow-500 to-amber-400 relative"
              initial={{ width: 0 }}
              animate={{ width: `${displayProgress}%` }}
              transition={{
                type: "spring",
                stiffness: 50,
                damping: 20,
              }}
            >
              {/* Animated shine effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                animate={{ x: ["-100%", "200%"] }}
                transition={{
                  duration: 1.5,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatDelay: 1,
                }}
              />
            </motion.div>
          </div>
        </div>

        {/* Loading status */}
        <motion.p
          className="text-sm text-white/70 font-medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {loadingMessage}
        </motion.p>
      </div>
    </div>
  )
}

