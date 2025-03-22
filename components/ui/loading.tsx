"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Sun } from "lucide-react"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"

interface LoadingProps {
  isLoading?: boolean
  onLoadingComplete?: () => void
  progress?: number
}

// Global star model cache
const starModelCache = {
  isLoaded: false,
  isLoading: false,
  loadPromise: null as Promise<void> | null,
  error: false,
}

export default function Loading({ isLoading = true, onLoadingComplete, progress: externalProgress }: LoadingProps) {
  const [progress, setProgress] = useState(0)
  const [showLoader, setShowLoader] = useState(true)
  const [assetsLoaded, setAssetsLoaded] = useState(false)
  const assetLoadingAttempted = useRef(false)
  const completionTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const mountedRef = useRef(true)

  // Function to preload the star model
  useEffect(() => {
    if (!isLoading || assetLoadingAttempted.current) return

    console.log("Loading component: Starting asset preloading")
    assetLoadingAttempted.current = true

    // Set initial progress for asset loading
    if (externalProgress === undefined) {
      setProgress(10)
    }

    // Check if the model is already loaded in the global cache
    if (typeof window !== "undefined" && window.starModelCache?.isLoaded) {
      console.log("Loading component: Star model already loaded in global cache")
      setAssetsLoaded(true)
      if (externalProgress === undefined) {
        setProgress((prev) => Math.max(prev, 90))
      }
      return
    }

    // If the model is currently loading in the global cache, wait for it
    if (typeof window !== "undefined" && window.starModelCache?.isLoading && window.starModelCache?.loadPromise) {
      console.log("Loading component: Star model loading in progress in global cache, waiting...")
      window.starModelCache.loadPromise
        .then(() => {
          console.log("Loading component: Star model loaded from global promise")
          setAssetsLoaded(true)
          if (externalProgress === undefined && mountedRef.current) {
            setProgress((prev) => Math.max(prev, 90))
          }
        })
        .catch((error) => {
          console.error("Loading component: Error loading star model from global promise:", error)
          setAssetsLoaded(true) // Continue anyway
          if (externalProgress === undefined && mountedRef.current) {
            setProgress((prev) => Math.max(prev, 90))
          }
        })
      return
    }

    // Initialize the global cache if it doesn't exist
    if (typeof window !== "undefined" && !window.starModelCache) {
      window.starModelCache = {
        isLoaded: false,
        isLoading: false,
        loadPromise: null,
        error: false,
      }
    }

    // Create a loader for the GLTF model
    const gltfLoader = new GLTFLoader()

    // Set the global cache to loading state
    if (typeof window !== "undefined") {
      window.starModelCache.isLoading = true

      // Create a promise for the loading process
      window.starModelCache.loadPromise = new Promise<void>((resolve, reject) => {
        // Load the star model
        gltfLoader.load(
          "/models/star.glb",
          () => {
            console.log("Loading component: Star model loaded successfully")
            if (typeof window !== "undefined") {
              window.starModelCache.isLoaded = true
              window.starModelCache.isLoading = false
            }
            if (mountedRef.current) {
              setAssetsLoaded(true)
              if (externalProgress === undefined) {
                setProgress((prev) => Math.max(prev, 90))
              }
            }
            resolve()
          },
          (xhr) => {
            // Update progress based on loading status
            if (externalProgress === undefined && xhr.lengthComputable && mountedRef.current) {
              const percentComplete = 10 + (xhr.loaded / xhr.total) * 80
              setProgress(Math.round(percentComplete))
            }
          },
          (error) => {
            console.error("Loading component: Error loading star model:", error)
            // Even if there's an error, mark as loaded so we don't block the app
            if (typeof window !== "undefined") {
              window.starModelCache.error = true
              window.starModelCache.isLoading = false
            }
            if (mountedRef.current) {
              setAssetsLoaded(true)
              if (externalProgress === undefined) {
                setProgress((prev) => Math.max(prev, 90))
              }
            }
            reject(error)
          },
        )
      })
    } else {
      // Fallback for SSR
      setAssetsLoaded(true)
      if (externalProgress === undefined) {
        setProgress((prev) => Math.max(prev, 90))
      }
    }

    // Set a timeout to ensure we don't block indefinitely
    const timeout = setTimeout(() => {
      if (!assetsLoaded && mountedRef.current) {
        console.warn("Loading component: Asset loading timed out, continuing anyway")
        if (typeof window !== "undefined") {
          window.starModelCache.isLoaded = true
          window.starModelCache.isLoading = false
          window.starModelCache.error = true
        }
        setAssetsLoaded(true)
        if (externalProgress === undefined) {
          setProgress((prev) => Math.max(prev, 90))
        }
      }
    }, 10000) // 10 second timeout

    return () => clearTimeout(timeout)
  }, [isLoading, assetsLoaded, externalProgress])

  // Handle automatic progress simulation
  useEffect(() => {
    if (!isLoading) {
      // If loading is explicitly set to false, hide the loader
      handleComplete()
      return
    }

    // Only run automatic progress if no external progress is provided
    if (externalProgress === undefined) {
      console.log("Loading component: Using simulated progress")
      // Simulate progress
      const interval = setInterval(() => {
        setProgress((prev) => {
          // Progress goes up to 90% automatically, the last 10% is when content is actually loaded
          const newProgress = prev + (prev < 90 ? Math.random() * 3 : 0) // Slower progress
          return Math.min(newProgress, 90)
        })
      }, 300) // Slower updates

      return () => clearInterval(interval)
    }
  }, [isLoading, externalProgress])

  // Update progress when external progress changes
  useEffect(() => {
    if (externalProgress !== undefined) {
      console.log(`Loading component: External progress update: ${externalProgress}%`)
      setProgress(externalProgress)
    }
  }, [externalProgress])

  // Function to complete loading and hide the loader
  const handleComplete = () => {
    console.log("Loading component: Completing loading process")
    setProgress(100)

    // Clear any existing timeout
    if (completionTimeoutRef.current) {
      clearTimeout(completionTimeoutRef.current)
    }

    // Delay hiding the loader to show the 100% state briefly
    completionTimeoutRef.current = setTimeout(() => {
      if (mountedRef.current) {
        console.log("Loading component: Hiding loader")
        setShowLoader(false)
        if (onLoadingComplete) onLoadingComplete()
      }
    }, 800) // Increased to 800ms for smoother transition
  }

  // When progress reaches 100% or assets are loaded and video progress is high, complete the loading
  useEffect(() => {
    if (progress >= 100 && isLoading) {
      console.log("Loading component: Progress reached 100%, completing")
      handleComplete()
    } else if (assetsLoaded && progress >= 90 && isLoading) {
      // If assets are loaded and progress is high enough, complete loading
      console.log("Loading component: Assets loaded and progress high, completing")
      setProgress(100)
    }
  }, [progress, isLoading, assetsLoaded])

  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true

    return () => {
      mountedRef.current = false
      if (completionTimeoutRef.current) {
        clearTimeout(completionTimeoutRef.current)
      }
    }
  }, [])

  // Determine loading message based on progress
  const loadingMessage = () => {
    if (!assetsLoaded) return "Loading 3D assets..."
    if (progress < 50) return "Preparing your experience..."
    if (progress < 80) return "Almost ready..."
    return "Finalizing..."
  }

  return (
    <AnimatePresence>
      {showLoader && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }} // Longer fade-out
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-b from-gray-800 to-gray-900"
        >
          <div className="relative flex flex-col items-center">
            {/* Animated sun icon */}
            <motion.div
              animate={{
                rotate: 360,
                scale: [1, 1.1, 1],
              }}
              transition={{
                rotate: { duration: 10, repeat: Number.POSITIVE_INFINITY, ease: "linear" },
                scale: { duration: 2, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" },
              }}
              className="mb-8"
            >
              <Sun className="h-20 w-20 text-yellow-400" />
            </motion.div>

            {/* Company name */}
            <motion.h1
              className="text-3xl font-bold text-white mb-8"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Sun Studios
            </motion.h1>

            {/* Progress bar */}
            <div className="w-64 h-2 bg-indigo-400/40 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>

            {/* Loading status */}
            <motion.p
              className="mt-4 text-sm text-white/70"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {loadingMessage()}
            </motion.p>

            {/* Progress percentage */}
            <motion.p
              className="mt-2 text-xs text-white/50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              {Math.round(progress)}%
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

