"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Sun } from "lucide-react"
import { addProgressListener, preloadAllAssets, getOverallProgress, areAllAssetsLoaded } from "@/utils/asset-preloader"

interface LoadingScreenProps {
  onLoadingComplete: () => void
  progress?: number // Add optional progress prop
  minDisplayTime?: number // Minimum time to display the loading screen
}

// Default minimum display time of 3 seconds (3000ms)
const DEFAULT_MINIMUM_DISPLAY_TIME = 3000

export default function LoadingScreen({
  onLoadingComplete,
  progress: externalProgress,
  minDisplayTime = DEFAULT_MINIMUM_DISPLAY_TIME,
}: LoadingScreenProps) {
  const [progress, setProgress] = useState(0)
  const [displayProgress, setDisplayProgress] = useState(0)
  const [starModelProgress, setStarModelProgress] = useState(0)
  const [videoProgress, setVideoProgress] = useState(0)
  const [loadingMessage, setLoadingMessage] = useState("Initializing...")
  const [isVisible, setIsVisible] = useState(true)
  const [showParticles, setShowParticles] = useState(false)
  const [assetsLoaded, setAssetsLoaded] = useState(false)
  const progressRef = useRef(0)
  const isMountedRef = useRef(true)
  const assetsLoadedRef = useRef(false)
  const startTimeRef = useRef(Date.now())
  const removeListenerRef = useRef<(() => void) | undefined>(undefined)
  const completionTimeoutRef = useRef<NodeJS.Timeout | null>(null)

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

  // Animate progress counter
  useEffect(() => {
    progressRef.current = externalProgress !== undefined ? externalProgress : progressRef.current

    // Smoothly animate the displayed progress
    const animateProgress = () => {
      if (displayProgress < progressRef.current) {
        setDisplayProgress((prev) => Math.min(prev + 1, progressRef.current))
        requestAnimationFrame(animateProgress)
      }
    }

    requestAnimationFrame(animateProgress)
  }, [progress, externalProgress, displayProgress])

  // Show particles after initial load
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isMountedRef.current) {
        setShowParticles(true)
      }
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  // Calculate remaining time to meet minimum display time
  const calculateRemainingTime = (): number => {
    const elapsedTime = Date.now() - startTimeRef.current
    return Math.max(0, minDisplayTime - elapsedTime)
  }

  // Handle loading completion
  const completeLoading = () => {
    if (completionTimeoutRef.current) {
      clearTimeout(completionTimeoutRef.current)
      completionTimeoutRef.current = null
    }

    console.log("LoadingScreen: Starting fade-out after minimum display time")
    setIsVisible(false)

    // Notify parent component after fade-out animation
    setTimeout(() => {
      if (!isMountedRef.current) return
      console.log("LoadingScreen: Notifying parent of completion")
      onLoadingComplete()
    }, 1300)
  }

  // Handle loading and ensure minimum display time
  useEffect(() => {
    isMountedRef.current = true
    console.log("LoadingScreen: Initializing")

    // Record start time
    startTimeRef.current = Date.now()

    // Update loading message based on progress
    if (progressRef.current < 20) {
      setLoadingMessage("Initializing...")
    } else if (progressRef.current < 40) {
      setLoadingMessage("Loading 3D assets...")
    } else if (progressRef.current < 80) {
      setLoadingMessage("Loading video...")
    } else {
      setLoadingMessage("Almost ready...")
    }

    // Only set up internal progress tracking if external progress is not provided
    let removeListener: (() => void) | undefined

    if (externalProgress === undefined) {
      console.log("LoadingScreen: Setting up progress tracking")

      // Listen for progress updates
      removeListener = addProgressListener((type, assetProgress) => {
        if (!isMountedRef.current) return

        if (type === "starModel") {
          setStarModelProgress(assetProgress)
        } else if (type === "video") {
          setVideoProgress(assetProgress)
        }

        // Update overall progress
        const overallProgress = getOverallProgress()
        progressRef.current = overallProgress
        setProgress(overallProgress)

        // If both assets are loaded, ensure we show 100%
        if (assetProgress === 100 && areAllAssetsLoaded()) {
          assetsLoadedRef.current = true
          setAssetsLoaded(true)
          progressRef.current = 100
          setProgress(100)
        }
      })

      // Start preloading assets - this is the ONLY place we trigger loading
      console.log("LoadingScreen: Starting asset preloading")
      preloadAllAssets()
        .then((assets) => {
          if (!isMountedRef.current) return

          console.log("LoadingScreen: All assets loaded successfully", {
            hasStarModel: !!assets.starModel,
            hasVideo: !!assets.video,
          })

          // Double-check that the assets are actually loaded and cached
          if (!assets.starModel || !assets.video) {
            console.warn("LoadingScreen: Assets loaded but some are missing, retrying...")
            // Try one more time to ensure assets are loaded
            return preloadAllAssets()
          }

          assetsLoadedRef.current = true
          setAssetsLoaded(true)

          // Set progress to 100% when complete
          progressRef.current = 100
          setProgress(100)
          setLoadingMessage("Ready!")

          // Calculate remaining time to meet minimum display time
          const remainingTime = calculateRemainingTime()

          // Wait for the minimum display time before hiding
          completionTimeoutRef.current = setTimeout(() => {
            if (!isMountedRef.current) return
            completeLoading()
          }, remainingTime)

          return assets
        })
        .catch((error) => {
          console.error("LoadingScreen: Error preloading assets:", error)

          // Even on error, wait the minimum time
          const remainingTime = calculateRemainingTime()

          completionTimeoutRef.current = setTimeout(() => {
            if (!isMountedRef.current) return
            completeLoading()
          }, remainingTime)
        })
    } else {
      // If external progress is provided, use it
      progressRef.current = externalProgress
      setProgress(externalProgress)
    }

    // If progress reaches 100%, complete loading after minimum time
    if (progressRef.current >= 100) {
      setLoadingMessage("Ready!")

      // Calculate remaining time to meet minimum display time
      const remainingTime = calculateRemainingTime()

      // Wait for the minimum display time before hiding
      completionTimeoutRef.current = setTimeout(() => {
        if (!isMountedRef.current) return
        completeLoading()
      }, remainingTime)
    }

    // Force completion after timeout (15 seconds)
    const forceCompleteTimeout = setTimeout(() => {
      if (!isMountedRef.current) return

      if (isVisible) {
        console.warn("LoadingScreen: Force completing loading after timeout")
        progressRef.current = 100
        setProgress(100)
        setLoadingMessage("Ready!")

        // Still ensure minimum display time
        const remainingTime = calculateRemainingTime()

        completionTimeoutRef.current = setTimeout(
          () => {
            if (!isMountedRef.current) return
            completeLoading()
          },
          Math.min(remainingTime, minDisplayTime / 2),
        ) // Use half the minimum time if we've already waited 15 seconds
      }
    }, 15000)

    return () => {
      isMountedRef.current = false
      if (removeListener) removeListener()
      if (completionTimeoutRef.current) {
        clearTimeout(completionTimeoutRef.current)
      }
      clearTimeout(forceCompleteTimeout)
    }
  }, [onLoadingComplete, isVisible, externalProgress, minDisplayTime])

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-b from-gray-900 to-gray-950"
      style={{
        opacity: isVisible ? 1 : 0,
        visibility: isVisible ? "visible" : "hidden",
        transition: "opacity 1.2s cubic-bezier(0.22, 1, 0.36, 1), visibility 0s linear 1.2s",
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
              animate={{ width: `${progress}%` }}
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

        {/* Asset-specific progress (only show if not using external progress) */}
        {externalProgress === undefined && (
          <motion.div
            className="mt-4 flex gap-6 text-xs text-white/40"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <div className="flex items-center">
              <div className="w-2 h-2 rounded-full bg-yellow-400/70 mr-2" />
              <span>3D Model: {starModelProgress}%</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 rounded-full bg-amber-400/70 mr-2" />
              <span>Video: {videoProgress}%</span>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

