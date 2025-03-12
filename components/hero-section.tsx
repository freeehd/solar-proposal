"use client"

import { useRef, useState, useEffect } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { Sun } from "lucide-react"
import dynamic from "next/dynamic"
import { useMediaQuery } from "@/hooks/use-media-query"

const MetalicPaint = dynamic(() => import("@/components/ui/metallic"), {
  ssr: false,
})

interface HeroSectionProps {
  name: string
  address: string
}

export default function HeroSection({ name, address }: HeroSectionProps) {
  const [isVideoLoaded, setIsVideoLoaded] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Media queries for responsive design
  const isMobile = useMediaQuery("(max-width: 640px)")
  const isTablet = useMediaQuery("(min-width: 641px) and (max-width: 1024px)")

  // Scroll animations
  const { scrollY } = useScroll()
  const opacity = useTransform(scrollY, [0, 300], [1, 0.5])
  const scale = useTransform(scrollY, [0, 300], [1, 1])

  // Video loading handlers
  useEffect(() => {
    const video = videoRef.current
    const handleLoadedData = () => setIsVideoLoaded(true)
    const handleLoadedMetadata = () => setIsVideoLoaded(true)
    const handlePlaying = () => setIsVideoLoaded(true)

    if (video) {
      setIsVideoLoaded(false)
      video.addEventListener("loadeddata", handleLoadedData)
      video.addEventListener("loadedmetadata", handleLoadedMetadata)
      video.addEventListener("playing", handlePlaying)
      video.load()
    }

    return () => {
      if (video) {
        video.removeEventListener("loadeddata", handleLoadedData)
        video.removeEventListener("loadedmetadata", handleLoadedMetadata)
        video.removeEventListener("playing", handlePlaying)
      }
    }
  }, [])

  return (
    <motion.section ref={containerRef} className="relative h-screen w-full overflow-hidden" style={{ opacity, scale }}>
      {/* Video Background with subtle zoom effect */}
      <div className="absolute inset-0 z-0">
        <motion.div
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{
            opacity: isVideoLoaded ? 1 : 0,
            scale: isVideoLoaded ? 1 : 1.1,
            transition: { duration: 2, ease: "easeOut" },
          }}
          className="absolute inset-0"
        >
          <video
            ref={videoRef}
            className="absolute h-full w-full object-cover"
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
            <source src="/video3.webm" type="video/webm" />
            Your browser does not support the video tag.
          </video>
        </motion.div>

        {/* Gradient overlay for better text contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/10 to-black/10" />
      </div>

      {/* Content Container - Adjusted for better mobile spacing */}
      <div className="relative z-10 h-full flex flex-col">
        {/* Top section with main heading - reduced height on mobile */}
        <div className="flex-1 flex items-center justify-center px-4 sm:px-6 md:px-12">
          <div className="w-full max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 1,
                delay: 0.5,
                ease: [0.25, 0.1, 0.25, 1],
              }}
              className="text-center relative"
            >
              {/* Animated sun icon - responsive size */}
              <motion.div
                className="absolute -top-8 sm:-top-12 md:-top-16 text-yellow-400/90 flex justify-center w-full"
                animate={{
                  rotate: 360,
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  rotate: { duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" },
                  scale: { duration: 3, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse", ease: "easeInOut" },
                }}
              >
                <Sun size={isMobile ? 36 : isTablet ? 44 : 52} strokeWidth={1.5} />
              </motion.div>

              {/* Responsive text sizes */}
              <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white drop-shadow-md">
                Welcome to
                <motion.span
                  className="block mt-1 sm:mt-2 text-indigo-dye-700 text-4xl sm:text-5xl md:text-7xl lg:text-8xl"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.8 }}
                >
                  Solar Future
                </motion.span>
              </h1>

              {/* Responsive underline */}
              <motion.div
                className="h-0.5 bg-indigo-dye-500 mt-4 sm:mt-6 mx-auto"
                initial={{ width: 0 }}
                animate={{ width: isMobile ? "120px" : isTablet ? "160px" : "200px" }}
                transition={{ duration: 1, delay: 1.2 }}
              />
            </motion.div>
          </div>
        </div>

        {/* User information section - repositioned for mobile */}
        {isMobile ? (
          <div className="w-full flex-grow flex flex-col">
            {/* User info with compact glass effect on mobile */}
            <motion.div
              className="relative flex items-center justify-center mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.4 }}
            >
              {/* Compact glass panel for user info */}
              <div className="relative inline-block px-5 py-3 rounded-xl">
                {/* Frosted glass background */}
                <div className="absolute inset-0 bg-white/15 backdrop-blur-md rounded-xl border border-white/20" />

                <div className="relative z-10 text-center">
                  <motion.p
                    className="text-xl font-medium text-white mb-1 drop-shadow-md"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 1.4 }}
                  >
                    Hello, <span className="font-bold text-indigo-dye-700">{name}</span>
                  </motion.p>
                  <motion.p
                    className="text-base text-white/80 drop-shadow-sm max-w-full truncate"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 1.6 }}
                  >
                    {address}
                  </motion.p>
                </div>
              </div>
            </motion.div>
          </div>
        ) : (
          // Desktop and tablet layout
          <div className="w-full">
            <motion.div
              className="relative mx-auto max-w-5xl px-6 md:px-12 pb-12 pt-12"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1 }}
            >
              {/* Frosted glass panel */}
              <div className="absolute inset-0 bg-white/15 backdrop-blur-md rounded-t-3xl border-t border-white/20" />

              <div className="relative z-10 flex flex-col md:flex-row items-center md:items-end justify-between gap-8">
                {/* User information */}
                <div className="text-center md:text-left">
                  <motion.p
                    className="text-2xl md:text-3xl lg:text-4xl font-medium text-white mb-3 drop-shadow-md"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 1.4 }}
                  >
                    Hello, <span className="font-bold text-indigo-dye-700">{name}</span>
                  </motion.p>
                  <motion.p
                    className="text-xl md:text-2xl text-white/80 drop-shadow-sm max-w-full truncate"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 1.6 }}
                  >
                    {address}
                  </motion.p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>

      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-dye-400/0 via-indigo-dye-400 to-indigo-dye-400/0" />
    </motion.section>
  )
}

