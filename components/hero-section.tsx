"use client"

import { useRef, useState, useEffect } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Sun } from "lucide-react"
import { useMediaQuery } from "@/hooks/use-media-query"
import Image from "next/image"
import { usePreloadedAssets } from "@/hooks/use-preloaded-assets"

interface HeroSectionProps {
  name: string
  address: string
  onReady?: () => void
}

export default function HeroSection({ name, address, onReady }: HeroSectionProps) {
  // Core state
  const [loadingState, setLoadingState] = useState<"initial" | "loading" | "ready" | "error">("initial")
  const [initialLoadComplete, setInitialLoadComplete] = useState(false)

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const visibilityObserverRef = useRef<IntersectionObserver | null>(null)
  const isVisibleRef = useRef(true)

  // Get preloaded video
  const { video: preloadedVideo, isLoaded: assetsLoaded } = usePreloadedAssets()

  // Media queries for responsive design
  const isMobileView = useMediaQuery("(max-width: 640px)")
  const isTablet = useMediaQuery("(min-width: 641px) and (max-width: 1024px)")

  // Initialize component
  useEffect(() => {
    console.log("HeroSection mounted")

    // Set loading state
    if (!initialLoadComplete) {
      setLoadingState("loading")
    }

    return () => {
      // Clean up visibility observer
      if (visibilityObserverRef.current) {
        visibilityObserverRef.current.disconnect()
        visibilityObserverRef.current = null
      }
    }
  }, [initialLoadComplete])

  // Use preloaded video
  useEffect(() => {
    const video = videoRef.current
    if (!video || !preloadedVideo || loadingState !== "loading") return

    console.log("Using preloaded video")

    // Clone the preloaded video's properties to our video element
    video.src = preloadedVideo.src

    // Mark as ready
    setLoadingState("ready")
    setInitialLoadComplete(true)

    // Notify parent component
    if (onReady) onReady()

    // Start playing if visible
    if (isVisibleRef.current) {
      video.play().catch((err) => {
        console.warn("Could not autoplay video:", err)
      })
    }
  }, [preloadedVideo, loadingState, onReady])

  // Set up visibility observer to handle play/pause
  useEffect(() => {
    const video = videoRef.current
    const container = containerRef.current
    if (!video || !container) return

    console.log("Setting up visibility observer")

    // Handle scroll events efficiently with IntersectionObserver
    const handleVisibilityChange = (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries
      const wasVisible = isVisibleRef.current
      isVisibleRef.current = entry.isIntersecting

      if (entry.isIntersecting && !wasVisible) {
        // Element is visible, play video if it's loaded and in ready state
        if (loadingState === "ready" && video.paused) {
          console.log("Playing video on visibility change")
          video.play().catch((err) => {
            console.warn("Could not play video on visibility change:", err)
          })
        }
      } else if (!entry.isIntersecting && wasVisible) {
        // Element is not visible, pause video to save resources
        if (!video.paused) {
          console.log("Pausing video on visibility change")
          video.pause()
        }
      }
    }

    // Create and setup IntersectionObserver
    visibilityObserverRef.current = new IntersectionObserver(handleVisibilityChange, {
      root: null,
      rootMargin: "0px",
      threshold: 0.1,
    })

    // Start observing the container
    visibilityObserverRef.current.observe(container)

    return () => {
      // Clean up observer
      if (visibilityObserverRef.current) {
        visibilityObserverRef.current.disconnect()
        visibilityObserverRef.current = null
      }
    }
  }, [loadingState])

  return (
    <section ref={containerRef} className="relative h-screen w-full overflow-hidden">
      {/* Loading placeholder - only show during initial loading */}
      <AnimatePresence>
        {loadingState === "loading" && !initialLoadComplete && (
          <motion.div
            className="absolute inset-0 z-10 bg-black"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.5 } }}
          >
            <div className="absolute inset-0">
              <Image src="/night3.png" alt="Solar background" fill priority className="object-cover" sizes="100vw" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/30" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Video Background - Always present but opacity controlled */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 will-change-opacity"
          style={{
            opacity: loadingState === "ready" ? 1 : 0,
            transition: "opacity 1000ms cubic-bezier(0.4, 0.0, 0.2, 1)",
          }}
        >
          <video
            ref={videoRef}
            className="absolute h-full w-full object-cover will-change-transform"
            style={{ transform: "translateZ(0)" }}
            muted
            loop
            playsInline
            preload="auto"
            disablePictureInPicture
            poster="/night3.png"
          >
            Your browser does not support the video tag.
          </video>
        </div>

        {/* Gradient overlay for better text contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/10 to-black/10" />
      </div>

      {/* Content Container */}
      <div className="relative z-5 h-full flex flex-col">
        {/* Top section with main heading */}
        <div className="flex-1 flex items-center justify-center px-4 sm:px-6 md:px-12">
          <div className="w-full max-w-6xl mx-auto">
            <div className="text-center relative">
              {/* Sun icon */}
              <div className="absolute -top-8 sm:-top-12 md:-top-16 text-yellow-400/90 flex justify-center w-full">
                <Sun size={isMobileView ? 36 : isTablet ? 44 : 52} strokeWidth={1.5} />
              </div>

              {/* Text content */}
              <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white drop-shadow-md">
                Welcome to
                <span className="block mt-1 sm:mt-2 text-indigo-dye-700 text-4xl sm:text-5xl md:text-7xl lg:text-8xl">
                  Solar Future
                </span>
              </h1>

              {/* Underline */}
              <div className="h-0.5 bg-indigo-dye-500 mt-4 sm:mt-6 mx-auto w-[120px] sm:w-[160px] md:w-[200px]" />
            </div>
          </div>
        </div>

        {/* User information section */}
        {isMobileView ? (
          <div className="w-full flex-grow flex flex-col">
            <div className="relative flex items-center justify-center mb-6">
              <div className="relative inline-block px-5 py-3 rounded-xl">
                <div className="absolute inset-0 bg-white/15 backdrop-blur-md rounded-xl border border-white/20" />
                <div className="relative z-10 text-center">
                  <p className="text-xl font-medium text-white mb-1 drop-shadow-md">
                    Hello, <span className="font-bold text-indigo-dye-700">{name}</span>
                  </p>
                  <p className="text-base text-white/80 drop-shadow-sm max-w-full truncate">{address}</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full">
            <div className="relative mx-auto max-w-5xl px-6 md:px-12 pb-12 pt-12">
              <div className="absolute inset-0 bg-white/15 backdrop-blur-md rounded-t-3xl border-t border-white/20" />
              <div className="relative z-10 flex flex-col md:flex-row items-center md:items-end justify-between gap-8">
                <div className="text-center md:text-left">
                  <p className="text-2xl md:text-3xl lg:text-4xl font-medium text-white mb-3 drop-shadow-md">
                    Hello, <span className="font-bold text-indigo-dye-700">{name}</span>
                  </p>
                  <p className="text-xl md:text-2xl text-white/80 drop-shadow-sm max-w-full truncate">{address}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-dye-400/0 via-indigo-dye-400 to-indigo-dye-400/0" />
    </section>
  )
}

