"use client"

import { useRef, useState, useEffect } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Sun } from "lucide-react"
import { useMediaQuery } from "@/hooks/use-media-query"
import Image from "next/image"
import { getPreloadedVideo, areVideosLoaded } from "@/utils/video-preloader"

interface HeroSectionProps {
  name: string
  address: string
  onReady?: () => void
}

export default function HeroSection({ name, address, onReady }: HeroSectionProps) {
  // Generate a unique ID for this component instance
  const instanceIdRef = useRef<string>(`hero-section-${Math.random().toString(36).substr(2, 9)}`)
  const hasInitializedRef = useRef(false)
  const readyNotifiedRef = useRef(false)

  // Core state
  const [loadingState, setLoadingState] = useState<"initial" | "loading" | "ready" | "error">("initial")
  const [fallbackImageVisible, setFallbackImageVisible] = useState(false)
  const [videoAttached, setVideoAttached] = useState(false)

  // Refs
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const videoContainerRef = useRef<HTMLDivElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const visibilityObserverRef = useRef<IntersectionObserver | null>(null)
  const isVisibleRef = useRef(true)

  // Update the media queries section to match the original approach while adding landscape detection
  const isMobileView = useMediaQuery("(max-width: 640px)")
  const isTablet = useMediaQuery("(min-width: 641px) and (max-width: 1024px)")
  const isLandscape = useMediaQuery("(orientation: landscape) and (max-height: 500px)")

  // Initialize component - only run once per instance
  useEffect(() => {
    const instanceId = instanceIdRef.current

    // Check if this specific instance has been initialized
    if (!hasInitializedRef.current) {
      console.log(`HeroSection mounted: ${instanceId}`)
      hasInitializedRef.current = true
      setLoadingState("loading")
    }

    return () => {
      // Clean up visibility observer
      if (visibilityObserverRef.current) {
        visibilityObserverRef.current.disconnect()
        visibilityObserverRef.current = null
      }
    }
  }, [])

  // Attach preloaded video
  useEffect(() => {
    // Skip if we've already attached the video
    if (videoAttached || loadingState !== "loading") {
      return
    }

    // Check if videos are preloaded
    if (!areVideosLoaded()) {
      console.log("HeroSection: Videos not yet preloaded, waiting...")
      return
    }

    console.log("HeroSection: Attaching preloaded video")

    try {
      // Get the preloaded video
      const preloadedVideo = getPreloadedVideo("hero")

      if (preloadedVideo) {
        console.log("HeroSection: Got preloaded hero video")

        // Get the video container
        const videoContainer = videoContainerRef.current

        if (videoContainer) {
          // Clone the video to avoid conflicts with other components
          const videoElement = preloadedVideo.cloneNode(true) as HTMLVideoElement

          // Ensure video has proper attributes
          videoElement.muted = true
          videoElement.playsInline = true
          videoElement.loop = true
          videoElement.crossOrigin = "anonymous"

          // If we have a video ref already, replace it
          if (videoRef.current && videoRef.current.parentNode) {
            console.log("HeroSection: Replacing existing video element")
            videoContainer.replaceChild(videoElement, videoRef.current)
            videoRef.current = videoElement
          }
          // Otherwise, append the new video element
          else {
            console.log("HeroSection: Appending new video element")
            videoContainer.appendChild(videoElement)
            videoRef.current = videoElement
          }

          // Mark as attached
          setVideoAttached(true)

          // Try to play the video
          videoElement.play().catch((err) => {
            console.warn("HeroSection: Could not autoplay video:", err)
            setFallbackImageVisible(true)
          })
        } else {
          console.warn("HeroSection: No video container found")
          setFallbackImageVisible(true)
        }
      } else {
        console.warn("HeroSection: Preloaded hero video not available")
        setFallbackImageVisible(true)
      }

      // Mark as ready
      setLoadingState("ready")

      // Notify parent component only once
      if (onReady && !readyNotifiedRef.current) {
        readyNotifiedRef.current = true
        onReady()
      }
    } catch (error) {
      console.error("HeroSection: Error setting up video:", error)
      setFallbackImageVisible(true)
      setLoadingState("ready")

      // Notify parent component only once, even on error
      if (onReady && !readyNotifiedRef.current) {
        readyNotifiedRef.current = true
        onReady()
      }
    }
  }, [loadingState, onReady, videoAttached])

  // Handle video errors
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleError = () => {
      console.error("HeroSection: Video error:", video.error)
      setFallbackImageVisible(true)
    }

    video.addEventListener("error", handleError)
    return () => video.removeEventListener("error", handleError)
  }, [])

  // Set up visibility observer to handle play/pause
  useEffect(() => {
    const video = videoRef.current
    const container = containerRef.current
    if (!video || !container) return

    console.log("HeroSection: Setting up visibility observer")

    // Handle scroll events efficiently with IntersectionObserver
    const handleVisibilityChange = (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries
      const wasVisible = isVisibleRef.current
      isVisibleRef.current = entry.isIntersecting

      if (entry.isIntersecting && !wasVisible) {
        // Element is visible, play video if it's loaded and in ready state
        if (loadingState === "ready" && video.paused && video.src && !fallbackImageVisible) {
          console.log("HeroSection: Playing video on visibility change")
          video.play().catch((err) => {
            console.warn("HeroSection: Could not play video on visibility change:", err)
            setFallbackImageVisible(true)
          })
        }
      } else if (!entry.isIntersecting && wasVisible) {
        // Element is not visible, pause video to save resources
        if (!video.paused) {
          console.log("HeroSection: Pausing video on visibility change")
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
  }, [loadingState, fallbackImageVisible])

  // Force ready state after timeout
  useEffect(() => {
    if (loadingState === "loading") {
      const timeout = setTimeout(() => {
        console.log("HeroSection: Force setting ready state after timeout")
        setLoadingState("ready")

        // Notify parent component only once
        if (onReady && !readyNotifiedRef.current) {
          readyNotifiedRef.current = true
          onReady()
        }
      }, 5000)

      return () => clearTimeout(timeout)
    }
  }, [loadingState, onReady])

  return (
    <section ref={containerRef} className="relative h-screen w-full overflow-hidden">
      {/* Loading placeholder - only show during initial loading */}
      <AnimatePresence>
        {loadingState === "loading" && (
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
      <div className="absolute inset-0 z-0 overflow-hidden">
        {/* Fallback image - shown when video fails */}
        {fallbackImageVisible && (
          <div className="absolute inset-0">
            <Image src="/night3.png" alt="Solar background" fill priority className="object-cover" sizes="100vw" />
          </div>
        )}

        <div
          className="absolute inset-0 will-change-opacity"
          style={{
            opacity: loadingState === "ready" && !fallbackImageVisible ? 1 : 0,
            transition: "opacity 1000ms cubic-bezier(0.4, 0.0, 0.2, 1)",
          }}
        >
          {/* Video container - we'll insert the video here */}
          <div ref={videoContainerRef} className="absolute inset-0 h-full w-full overflow-hidden">
            {/* Video element will be inserted here dynamically */}
          </div>
        </div>

        {/* Gradient overlay for better text contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/10 to-black/10" />
      </div>

      {/* Content Container - Adjusted for better mobile layout */}
      <div className="relative z-5 h-full flex flex-col">
        {/* Top section with main heading - Adjusted for better spacing on small screens */}
        <div className="flex-1 flex items-center justify-center px-3 sm:px-6 md:px-12">
          <div className="w-full max-w-6xl mx-auto">
            <div className="text-center relative">
              {/* Sun icon - Adjusted position for small screens */}
              <div className="absolute -top-8 sm:-top-12 md:-top-16 text-yellow-400/90 flex justify-center w-full">
                <Sun size={isMobileView ? 36 : isTablet ? 44 : 52} strokeWidth={isMobileView ? 2 : 1.5} />
              </div>

              {/* Text content - Responsive text sizes */}
              <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white drop-shadow-md">
                Welcome to
                <span className="block mt-1 sm:mt-2 text-indigo-dye-700 text-4xl sm:text-5xl md:text-7xl lg:text-8xl">
                  Solar Future
                </span>
              </h1>

              {/* Underline - Adjusted size for mobile */}
              <div
                className={`h-0.5 bg-indigo-dye-500 mt-3 ${isMobileView ? "mt-2 w-[80px]" : "mt-4 w-[120px]"} sm:mt-6 sm:w-[160px] md:w-[200px] mx-auto`}
              />
            </div>
          </div>
        </div>

        {/* User information section - Improved mobile layout */}
        {isMobileView || isLandscape ? (
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

