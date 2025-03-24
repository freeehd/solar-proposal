"use client"

import { useEffect, useState, useRef } from "react"
import { motion } from "framer-motion"
import { Sun } from "lucide-react"

interface LoadingScreenProps {
  onLoadingComplete: () => void
  minDisplayTime?: number
}

export default function LoadingScreen({
  onLoadingComplete,
  minDisplayTime = 3000, // Default 3 seconds minimum display time
}: LoadingScreenProps) {
  const [isVisible, setIsVisible] = useState(true)
  const startTimeRef = useRef(Date.now())
  const isMountedRef = useRef(true)
  const completionCalled = useRef(false)

  // Block scrolling when loading screen is visible
  useEffect(() => {
    if (isVisible) {
      document.body.style.overflow = "hidden"
      return () => {
        document.body.style.overflow = ""
      }
    }
  }, [isVisible])

  // Handle loading completion after minimum display time
  useEffect(() => {
    console.log("LoadingScreen: Setting up completion timer for", minDisplayTime, "ms")

    const timer = setTimeout(() => {
      if (!isMountedRef.current) return

      console.log("LoadingScreen: Minimum display time reached, starting fade-out")
      // Start fade-out
      setIsVisible(false)

      // Notify parent after fade-out animation completes
      setTimeout(() => {
        if (isMountedRef.current && !completionCalled.current) {
          console.log("LoadingScreen: Fade-out complete, notifying parent")
          completionCalled.current = true
          onLoadingComplete()
        }
      }, 800) // Match the transition duration
    }, minDisplayTime)

    return () => {
      clearTimeout(timer)
      isMountedRef.current = false
    }
  }, [minDisplayTime, onLoadingComplete])

  // Ensure cleanup on unmount
  useEffect(() => {
    return () => {
      // If component unmounts before completion callback is called, call it
      if (!completionCalled.current) {
        console.log("LoadingScreen: Component unmounting, ensuring completion callback is called")
        completionCalled.current = true
        onLoadingComplete()
      }
    }
  }, [onLoadingComplete])

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
      <div className="flex flex-col items-center">
        {/* Sun icon with animation */}
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
          >
            <Sun className="h-24 w-24 text-yellow-400" strokeWidth={1.5} />
          </motion.div>

          {/* Glow effect */}
          <div className="absolute inset-0 rounded-full bg-yellow-400/20 blur-xl -z-10" />
        </div>

        {/* Company name */}
        <motion.h1
          className="text-4xl font-bold text-white mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          Sun Studios
        </motion.h1>

        {/* Simple loading indicator */}
        <div className="flex space-x-2 mt-4">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="w-3 h-3 rounded-full bg-yellow-400"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1.2,
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "loop",
                delay: i * 0.2,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

