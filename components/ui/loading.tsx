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

export default function Loading({ isLoading = true, onLoadingComplete, progress: externalProgress }: LoadingProps) {
  const [progress, setProgress] = useState(0)
  const [showLoader, setShowLoader] = useState(true)
  const [assetsLoaded, setAssetsLoaded] = useState(false)
  const assetLoadingAttempted = useRef(false)

  // Function to preload the star model
  useEffect(() => {
    if (!isLoading || assetLoadingAttempted.current) return

    assetLoadingAttempted.current = true

    // Set initial progress for asset loading
    if (externalProgress === undefined) {
      setProgress(10)
    }

    // Create a loader for the GLTF model
    const gltfLoader = new GLTFLoader()

    // Load the star model
    gltfLoader.load(
      "/models/star.glb",
      () => {
        console.log("Star model loaded successfully")
        setAssetsLoaded(true)
        if (externalProgress === undefined) {
          setProgress((prev) => Math.max(prev, 90))
        }
      },
      (xhr) => {
        // Update progress based on loading status
        if (externalProgress === undefined && xhr.lengthComputable) {
          const percentComplete = 10 + (xhr.loaded / xhr.total) * 80
          setProgress(Math.round(percentComplete))
        }
      },
      (error) => {
        console.error("Error loading star model:", error)
        // Even if there's an error, mark as loaded so we don't block the app
        setAssetsLoaded(true)
        if (externalProgress === undefined) {
          setProgress((prev) => Math.max(prev, 90))
        }
      },
    )

    // Set a timeout to ensure we don't block indefinitely
    const timeout = setTimeout(() => {
      if (!assetsLoaded) {
        console.warn("Asset loading timed out, continuing anyway")
        setAssetsLoaded(true)
        if (externalProgress === undefined) {
          setProgress((prev) => Math.max(prev, 90))
        }
      }
    }, 5000) // 5 second timeout

    return () => clearTimeout(timeout)
  }, [isLoading, assetsLoaded, externalProgress])

  useEffect(() => {
    if (!isLoading) {
      // If loading is explicitly set to false, hide the loader
      handleComplete()
      return
    }

    // Only run automatic progress if no external progress is provided
    if (externalProgress === undefined) {
      // Simulate progress
      const interval = setInterval(() => {
        setProgress((prev) => {
          // Progress goes up to 90% automatically, the last 10% is when content is actually loaded
          const newProgress = prev + (prev < 90 ? Math.random() * 5 : 0)
          return Math.min(newProgress, 90)
        })
      }, 200)

      return () => clearInterval(interval)
    }
  }, [isLoading, externalProgress])

  // Update progress when external progress changes
  useEffect(() => {
    if (externalProgress !== undefined) {
      setProgress(externalProgress)
    }
  }, [externalProgress])

  // Function to complete loading and hide the loader
  const handleComplete = () => {
    setProgress(100)

    // Delay hiding the loader to show the 100% state briefly
    setTimeout(() => {
      setShowLoader(false)
      if (onLoadingComplete) onLoadingComplete()
    }, 500)
  }

  // When progress reaches 100% or assets are loaded and video progress is high, complete the loading
  useEffect(() => {
    if (progress >= 100 && isLoading) {
      handleComplete()
    } else if (assetsLoaded && progress >= 90 && isLoading) {
      // If assets are loaded and progress is high enough, complete loading
      setProgress(100)
    }
  }, [progress, isLoading, assetsLoaded])

  return (
    <AnimatePresence>
      {showLoader && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
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
            <div className="w-64 h-2 bg-indigo-400 rounded-full overflow-hidden">
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
              {!assetsLoaded ? "Loading 3D assets..." : "Preparing your experience..."}
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

