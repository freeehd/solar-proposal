"use client"

import { useRef, useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowRight, Sun } from "lucide-react"

interface HeroSectionProps {
  name: string
  address: string
}

export default function HeroSection({ name, address }: HeroSectionProps) {
  // ⚠️ CRITICAL: Keep the exact same state management as the original
  const [isVideoLoaded, setIsVideoLoaded] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  // ⚠️ CRITICAL: Keep the exact same useEffect implementation
  useEffect(() => {
    const video = videoRef.current
    const handleLoadedData = () => {
      // Only add this console log for debugging
      console.log("Video loaded via loadeddata event")
      setIsVideoLoaded(true)
    }

    const handleLoadedMetadata = () => {
      console.log("Video loaded via loadedmetadata event")
      setIsVideoLoaded(true)
    }

    const handlePlaying = () => {
      console.log("Video loaded via playing event")
      setIsVideoLoaded(true)
    }

    if (video) {
      // Reset video loaded state
      setIsVideoLoaded(false)

      // ⚠️ CRITICAL: Keep all three event listeners exactly as in the original
      video.addEventListener("loadeddata", handleLoadedData)
      video.addEventListener("loadedmetadata", handleLoadedMetadata)
      video.addEventListener("playing", handlePlaying)

      // ⚠️ CRITICAL: Keep the force load call exactly as in the original
      video.load()
    }

    return () => {
      if (video) {
        // ⚠️ CRITICAL: Only remove the event listeners in cleanup, nothing else
        video.removeEventListener("loadeddata", handleLoadedData)
        video.removeEventListener("loadedmetadata", handleLoadedMetadata)
        video.removeEventListener("playing", handlePlaying)
      }
    }
  }, [])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10,
      },
    },
  }

  return (
    <motion.section
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <AnimatePresence>
        <motion.div
          className="absolute inset-0 overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        >
          <motion.div
            initial={{ scale: 1.2, opacity: 0 }}
            animate={{
              scale: 1,
              opacity: isVideoLoaded ? 1 : 0,
              transition: {
                duration: 2,
                ease: "easeOut",
                delay: 0.2,
              },
            }}
            className="absolute inset-0"
          >
            {/* ⚠️ CRITICAL: Keep the video element exactly as in the original */}
            <video
              ref={videoRef}
              className="absolute top-1/2 left-1/2 min-w-full min-h-full object-cover -translate-x-1/2 -translate-y-1/2"
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              onCanPlay={() => {
                videoRef.current?.play().catch(() => {
                  console.log("Video autoplay failed")
                })
              }}
            >
              <source src="/new.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>

            {/* SAFE ADDITION: Add fallback for when video is not loaded yet */}
            {!isVideoLoaded && (
              <div className="absolute inset-0 bg-gradient-to-b from-blue-900 to-purple-900" aria-hidden="true" />
            )}
          </motion.div>
          <motion.div
            className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-black/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2, ease: "easeOut", delay: 0.5 }}
          />
        </motion.div>
      </AnimatePresence>

      <div className="container mx-auto px-4 pt-20 pb-32 relative z-20">
        <div className="max-w-[1200px] mx-auto">
          <div className="max-w-3xl">
            <motion.div className="relative z-10">
              <motion.div variants={itemVariants} className="relative">
                <motion.h1
                  className="text-6xl md:text-7xl lg:text-8xl font-extrabold leading-tight tracking-tight mb-8 text-white"
                  initial={{ clipPath: "inset(100% 0 0 0)" }}
                  animate={{ clipPath: "inset(0% 0 0 0)" }}
                  transition={{ duration: 1, ease: "easeOut", delay: 1 }}
                >
                  Welcome to
                  <br />
                  <motion.span
                    className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, ease: "easeOut", delay: 2 }}
                  >
                    Solar Future
                  </motion.span>
                </motion.h1>

                {/* SAFE CHANGE: Use CSS animation for the sun rotation */}
                <div className="absolute -top-12 -left-12 w-24 h-24 text-yellow-400 opacity-20 animate-spin-slow">
                  <Sun className="w-full h-full" />
                </div>
              </motion.div>
              <motion.div className="space-y-6" variants={itemVariants}>
                <motion.p
                  className="text-2xl md:text-3xl text-white font-normal leading-tight"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.8, ease: "easeOut", delay: 2.3 }}
                >
                  Hello, <span className="text-blue-400">{name}</span>
                </motion.p>
                <motion.p
                  className="text-xl md:text-2xl text-white/90 font-normal leading-tight tracking-wide"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.8, ease: "easeOut", delay: 2.5 }}
                >
                  {address}
                </motion.p>
              </motion.div>
              <motion.div variants={itemVariants} className="mt-12">
                <motion.button
                  className="group bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white text-xl px-10 py-5 rounded-full transition-all duration-300 flex items-center shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-purple-500/30 font-semibold"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Explore Your Proposal
                  <ArrowRight className="ml-3 h-6 w-6 transition-transform duration-300 group-hover:translate-x-1" />
                </motion.button>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Premium decorative elements */}
      <motion.div
        className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1.5, delay: 3, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-0 right-0 w-1 h-1/3 bg-gradient-to-b from-blue-500 to-purple-500"
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ duration: 1.5, delay: 3.2, ease: "easeInOut" }}
      />
    </motion.section>
  )
}

