"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Sun } from 'lucide-react'

interface LoadingProps {
  isLoading?: boolean
  onLoadingComplete?: () => void
}

export default function Loading({ isLoading = true, onLoadingComplete }: LoadingProps) {
  const [progress, setProgress] = useState(0)
  const [showLoader, setShowLoader] = useState(true)

  useEffect(() => {
    if (!isLoading) {
      // If loading is explicitly set to false, hide the loader
      handleComplete()
      return
    }

    // Simulate progress
    const interval = setInterval(() => {
      setProgress(prev => {
        // Progress goes up to 90% automatically, the last 10% is when content is actually loaded
        const newProgress = prev + (prev < 90 ? Math.random() * 5 : 0)
        return Math.min(newProgress, 90)
      })
    }, 200)

    return () => clearInterval(interval)
  }, [isLoading])

  // Function to complete loading and hide the loader
  const handleComplete = () => {
    setProgress(100)
    
    // Delay hiding the loader to show the 100% state briefly
    setTimeout(() => {
      setShowLoader(false)
      if (onLoadingComplete) onLoadingComplete()
    }, 500)
  }

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
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                rotate: { duration: 10, repeat: Infinity, ease: "linear" },
                scale: { duration: 2, repeat: Infinity, repeatType: "reverse" }
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
            <div className="w-64 h-2 bg-indigo-400  rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            
          
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
