"use client"

import { useRef, useState, useEffect } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Sun } from "lucide-react"
import { useMediaQuery } from "@/hooks/use-media-query"
import Image from "next/image"
import { AuroraText } from "./ui/aurora-text"
import BreathingText from "./ui/breathing-text"
interface HeroSectionProps {
  name: string
  address: string
  onReady?: () => void
}

// Helper to detect Apple devices (Mac, iOS)
const isAppleDevice =
  typeof navigator !== "undefined" &&
  (/iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1) ||
    /Mac/.test(navigator.platform) ||
    /^((?!chrome|android).)*safari/i.test(navigator.userAgent))

export default function HeroSection({ name, address, onReady }: HeroSectionProps) {
  // Generate a unique ID for this component instance
  const instanceIdRef = useRef<string>(`hero-section-${Math.random().toString(36).substr(2, 9)}`)

  // Core state
  const [loadingState, setLoadingState] = useState<"initial" | "loading" | "ready" | "error">("initial")
  const [fallbackImageVisible, setFallbackImageVisible] = useState(false)

  // Refs
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const visibilityObserverRef = useRef<IntersectionObserver | null>(null)
  const isVisibleRef = useRef(true)
  const readyNotifiedRef = useRef(false)
  const loadTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Update the media queries section to match the original approach while adding landscape detection
  const isMobileView = useMediaQuery("(max-width: 640px)")
  const isTablet = useMediaQuery("(min-width: 641px) and (max-width: 1024px)")
  const isLandscape = useMediaQuery("(orientation: landscape) and (max-height: 500px)")

  // Initialize component - only run once per instance
  useEffect(() => {
    const instanceId = instanceIdRef.current
    console.log(`HeroSection [${instanceId}]: Component mounted`)

    setLoadingState("loading")

    // Determine the best video format based on device
    // Use MP4 for all devices for maximum compatibility
    const videoSrc = "/video3.mp4"

    // Create and set up video element with optimized attributes
    const video = document.createElement("video")
    video.muted = true
    video.playsInline = true
    video.loop = true
    video.crossOrigin = "anonymous" // Helps with CORS issues
    video.preload = "auto"
    video.poster = "/night3.png"

    // Add special attributes for Apple devices
    if (isAppleDevice) {
      video.setAttribute("playsinline", "")
      video.setAttribute("webkit-playsinline", "")
      video.setAttribute("x-webkit-airplay", "allow")
    }

    // Set up event listeners with better error handling
    const handleVideoLoaded = () => {
      console.log(`HeroSection [${instanceId}]: Video data loaded`)

      // Clear any pending timeout
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current)
        loadTimeoutRef.current = null
      }

      setLoadingState("ready")

      // Try to play the video immediately if visible
      if (isVisibleRef.current) {
        video.play().catch((error) => {
          console.warn(`HeroSection [${instanceId}]: Could not autoplay video:`, error)
          // Don't show fallback immediately on autoplay error - many browsers block autoplay
        })
      }

      // Notify parent component only once
      if (onReady && !readyNotifiedRef.current) {
        readyNotifiedRef.current = true
        onReady()
      }
    }

    // Listen for multiple events to ensure we catch when video is ready
    video.addEventListener("loadeddata", handleVideoLoaded)
    video.addEventListener("canplay", handleVideoLoaded)

    video.addEventListener("error", (e) => {
      console.error(`HeroSection [${instanceId}]: Video error:`, e, video.error)
      setFallbackImageVisible(true)
      setLoadingState("error")

      // Notify parent component only once, even on error
      if (onReady && !readyNotifiedRef.current) {
        readyNotifiedRef.current = true
        onReady()
      }
    })

    // Store the video reference
    videoRef.current = video

    // Add video to the DOM if container exists
    if (containerRef.current) {
      const videoContainer = containerRef.current.querySelector(".video-container")
      if (videoContainer) {
        // Set video styles directly for better performance
        video.style.width = "100%"
        video.style.height = "100%"
        video.style.objectFit = "cover"
        video.style.position = "absolute"
        video.style.top = "0"
        video.style.left = "0"

        videoContainer.appendChild(video)

        // Set the source and start loading after appending to DOM
        // This order can help with some browser quirks
        video.src = videoSrc
        video.load()
      }
    }

    // Force ready state after timeout (5 seconds)
    loadTimeoutRef.current = setTimeout(() => {
      if (loadingState !== "ready" && loadingState !== "error") {
        console.log(`HeroSection [${instanceId}]: Force setting ready state after timeout`)

        // If video has started loading but not finished, keep it
        if (video.readyState >= 1) {
          console.log(`HeroSection [${instanceId}]: Video partially loaded, continuing with it`)
          setLoadingState("ready")
        } else {
          console.log(`HeroSection [${instanceId}]: Video failed to load in time, showing fallback`)
          setFallbackImageVisible(true)
          setLoadingState("ready") // Still mark as ready to remove loading screen
        }

        // Notify parent component only once
        if (onReady && !readyNotifiedRef.current) {
          readyNotifiedRef.current = true
          onReady()
        }
      }
    }, 5000)

    return () => {
      // Clear timeout
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current)
        loadTimeoutRef.current = null
      }

      // Clean up event listeners
      video.removeEventListener("loadeddata", handleVideoLoaded)
      video.removeEventListener("canplay", handleVideoLoaded)

      // Clean up visibility observer
      if (visibilityObserverRef.current) {
        visibilityObserverRef.current.disconnect()
        visibilityObserverRef.current = null
      }

      // Clean up video element
      if (videoRef.current) {
        videoRef.current.pause()

        // Remove src to stop any ongoing network requests
        videoRef.current.removeAttribute("src")
        videoRef.current.load()

        videoRef.current.remove()
      }

      console.log(`HeroSection [${instanceId}]: Component unmounted`)
    }
  }, [onReady])

  // Set up visibility observer to handle play/pause
  useEffect(() => {
    const video = videoRef.current
    const container = containerRef.current
    if (!video || !container) return

    console.log(`HeroSection [${instanceIdRef.current}]: Setting up visibility observer`)

    // Handle scroll events efficiently with IntersectionObserver
    const handleVisibilityChange = (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries
      const wasVisible = isVisibleRef.current
      isVisibleRef.current = entry.isIntersecting

      if (entry.isIntersecting && !wasVisible) {
        // Element is visible, play video if it's loaded and in ready state
        if (loadingState === "ready" && video.paused && video.src && !fallbackImageVisible) {
          console.log(`HeroSection [${instanceIdRef.current}]: Playing video on visibility change`)

          // Use a short timeout to avoid immediate play issues on some browsers
          setTimeout(() => {
            video.play().catch((err) => {
              console.warn(`HeroSection [${instanceIdRef.current}]: Could not play video on visibility change:`, err)
              // Only show fallback if video has no data at all
              if (video.readyState === 0) {
                setFallbackImageVisible(true)
              }
            })
          }, 50)
        }
      } else if (!entry.isIntersecting && wasVisible) {
        // Element is not visible, pause video to save resources
        if (!video.paused) {
          console.log(`HeroSection [${instanceIdRef.current}]: Pausing video on visibility change`)
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
          className="absolute inset-0 will-change-opacity video-container"
          style={{
            opacity: loadingState === "ready" && !fallbackImageVisible ? 1 : 0,
            transition: "opacity 1000ms cubic-bezier(0.4, 0.0, 0.2, 1)",
          }}
        >
          {/* Video will be inserted here dynamically */}
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
                Hello <AuroraText speed={2}>{name.split(" ")[0]}</AuroraText>

                <span className="block mt-1 sm:mt-2 text-indigo-dye-700 text-4xl sm:text-5xl md:text-7xl lg:text-8xl">
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
                    {/* Hello, <span className="font-bold text-indigo-dye-700">{name}</span> */}
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

