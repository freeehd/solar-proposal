"use client"

import { useEffect, useState, useRef } from "react"
import { motion } from "framer-motion"
import { Sun } from "lucide-react"

interface LoadingScreenProps {
  displayTime?: number
}

export default function LoadingScreen({
  displayTime = 5000, // Default 3 seconds display time
}: LoadingScreenProps) {
  // State to track if component should render
  const [show, setShow] = useState(true)
  // State to track progress
  const [progress, setProgress] = useState(0)
  // State to track fade out
  const [fadeOut, setFadeOut] = useState(false)

  // Ref to track particles
  const particlesRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    console.log("LoadingScreen: Mounted")

    // Block scrolling
    document.body.style.overflow = "hidden"

    // Set up progress updates with smoother animation
    const startTime = Date.now()
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime
      const newProgress = Math.min(100, (elapsed / displayTime) * 100)
      setProgress(newProgress)

      // If we've reached 100%, clear the interval and start fade out
      if (newProgress >= 100) {
        clearInterval(interval)
        setFadeOut(true)

        // After fade out animation, unmount component
        setTimeout(() => {
          setShow(false)
          document.body.style.overflow = ""
        }, 800) // Match this with the CSS transition duration
      }
    }, 16) // Update at 60fps for smoother animation

    // Clean up
    return () => {
      clearInterval(interval)
      document.body.style.overflow = ""
    }
  }, [displayTime])

  // If show is false, don't render anything
  if (!show) {
    return null
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-b from-gray-900 to-gray-950 transition-opacity duration-800 ease-in-out ${fadeOut ? "opacity-0" : "opacity-100"}`}
      style={{ transitionDuration: "800ms" }}
    >
      {/* Premium background particles */}
      <div ref={particlesRef} className="absolute inset-0 overflow-hidden pointer-events-none">
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

      <div className="flex flex-col items-center z-10">
        {/* Sun icon with enhanced animation */}
        <div className="relative mb-10">
          <motion.div
            animate={{
              rotate: 360,
              scale: [1, 1.05, 1],
            }}
            transition={{
              rotate: { duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" },
              scale: { duration: 3, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" },
            }}
            className="relative z-10"
          >
            <Sun className="h-24 w-24 text-yellow-400" strokeWidth={1.5} />
          </motion.div>

          {/* Enhanced glow effect */}
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

        {/* Company name with animation */}
        <motion.h1
          className="text-4xl font-bold text-white mb-10"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          Sun Studios
        </motion.h1>

        {/* Premium progress bar container */}
        <div className="w-72 mb-2">
          <div className="flex justify-between text-xs text-white/50 mb-1">
            <span>Loading Progress</span>
            <span>{Math.round(progress)}%</span>
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

        {/* Loading status with animation */}
        <motion.p
          className="text-sm text-white/70 font-medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Preparing your solar experience...
        </motion.p>

        {/* Animated dots */}
        <div className="flex space-x-2 mt-4">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-yellow-400/70"
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

