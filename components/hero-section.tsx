"use client"

import { useRef, useState, useEffect } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Sun } from "lucide-react"
import { useMediaQuery } from "@/hooks/use-media-query"
import Image from "next/image"

interface HeroSectionProps {
  name: string
  address: string
  onReady?: () => void
  onProgress?: (progress: number) => void
}

// Vercel Blob URL for the video
const VIDEO_URL = "https://ufpsglq2mvejclds.public.blob.vercel-storage.com/video3-1qC3I0KH9sIPRy0jKZzLCzPt09d1Xx.webm"

export default function HeroSection({ name, address, onReady, onProgress }: HeroSectionProps) {
  // Core state
  const [loadingState, setLoadingState] = useState<"initial" | "loading" | "ready" | "error">("initial")
  const [loadProgress, setLoadProgress] = useState(0)
  const [initialLoadComplete, setInitialLoadComplete] = useState(false)

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const mountedRef = useRef(true)
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const visibilityObserverRef = useRef<IntersectionObserver | null>(null)
  const isVisibleRef = useRef(true)
  const hasStartedPlayingRef = useRef(false)
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Media queries for responsive design
  const isMobile = useMediaQuery("(max-width: 640px)")
  const isTablet = useMediaQuery("(min-width: 641px) and (max-width: 1024px)")

  // Initialize component
  useEffect(() => {
    console.log("HeroSection mounted")
    mountedRef.current = true

    // Only set loading state if initial load hasn't completed
    if (!initialLoadComplete) {
      setLoadingState("loading")

      // Start with initial progress
      setLoadProgress(10)
      if (onProgress) onProgress(10)
    }

    return () => {
      mountedRef.current = false

      // Clear any pending timeouts and intervals
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current)
      }

      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
      }

      // Clean up visibility observer
      if (visibilityObserverRef.current) {
        visibilityObserverRef.current.disconnect()
        visibilityObserverRef.current = null
      }
    }
  }, [initialLoadComplete, onProgress])

  // Set up force completion timeout
  useEffect(() => {
    if (loadingState !== "loading" || initialLoadComplete) return

    console.log("Setting up force completion timeout")
    loadingTimeoutRef.current = setTimeout(() => {
      if (loadingState === "loading" && mountedRef.current) {
        console.log("Force completing video load due to timeout")
        setLoadingState("ready")
        setLoadProgress(100)
        setInitialLoadComplete(true)
        if (onProgress) onProgress(100)
        if (onReady) onReady()
      }
    }, 15000) // 15 seconds timeout

    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current)
        loadingTimeoutRef.current = null
      }
    }
  }, [loadingState, onProgress, onReady, initialLoadComplete])

  // Load and set up video
  useEffect(() => {
    const video = videoRef.current
    if (!video || loadingState !== "loading" || initialLoadComplete) return

    console.log("Setting up video element")

    // Set up progress tracking
    let lastBuffered = 0
    const updateProgress = () => {
      if (!video || !mountedRef.current) return

      // Check if there are any buffered ranges
      if (video.buffered.length > 0) {
        // Get the end time of the last buffered range
        const bufferedEnd = video.buffered.end(video.buffered.length - 1)
        // Calculate how much of the video is buffered as a percentage
        const bufferedPercent = Math.min(100, Math.round((bufferedEnd / video.duration) * 100))

        // Only update if we have more buffered than before
        if (bufferedPercent > lastBuffered) {
          lastBuffered = bufferedPercent

          // Update progress - scale to 10-90% range (save 10% for initial setup, 10% for final ready state)
          const scaledProgress = 10 + Math.min(80, bufferedPercent * 0.8)
          setLoadProgress(scaledProgress)
          if (onProgress) onProgress(scaledProgress)

          // If we've buffered enough to start playing (e.g., 5%), mark as ready
          // This is a key change - we start playing much earlier now
          if (bufferedPercent >= 5 && loadingState === "loading") {
            console.log(`Video buffered ${bufferedPercent}%, starting playback`)
            setLoadingState("ready")

            // Start playing if visible
            if (isVisibleRef.current) {
              video.play().catch((err) => {
                console.warn("Could not autoplay video:", err)
              })
            }
          }

          // If we've buffered enough (e.g., 30%), consider it fully loaded
          // Reduced from 60% to 30% for faster completion
          if (bufferedPercent >= 30 && !initialLoadComplete) {
            console.log("Video sufficiently buffered, marking as complete")
            setInitialLoadComplete(true)
            setLoadProgress(100)
            if (onProgress) onProgress(100)
            if (onReady) onReady()
          }
        }
      }
    }

    // Start progress tracking interval
    progressIntervalRef.current = setInterval(updateProgress, 200)

    // Event handlers
    const handleCanPlay = () => {
      console.log("Video can play now")
      if (!mountedRef.current) return

      // We can play, but might not be fully loaded
      // Mark as ready to start playback
      if (loadingState === "loading") {
        console.log("Video can play, transitioning to ready state")
        setLoadingState("ready")

        // Play if visible
        if (isVisibleRef.current) {
          video.play().catch((err) => {
            console.warn("Could not autoplay video:", err)
          })
        }
      }
    }

    const handleCanPlayThrough = () => {
      console.log("Video can play through without buffering")
      if (!mountedRef.current) return

      // Video is fully loaded or has enough data to play through
      if (!initialLoadComplete) {
        console.log("Video can play through, marking as complete")
        setInitialLoadComplete(true)
        setLoadProgress(100)
        if (onProgress) onProgress(100)
        if (onReady) onReady()
      }
    }

    const handleError = (e: Event) => {
      console.error("Video loading error:", e)
      if (!mountedRef.current) return

      setLoadingState("error")
      setLoadProgress(100)
      setInitialLoadComplete(true)
      if (onProgress) onProgress(100)
      if (onReady) onReady()
    }

    // Add event listeners
    video.addEventListener("canplay", handleCanPlay)
    video.addEventListener("canplaythrough", handleCanPlayThrough)
    video.addEventListener("error", handleError)

    // Set video source and start loading
    console.log("Starting video loading with Vercel Blob URL")
    video.src = VIDEO_URL
    video.load()

    // Clean up function
    return () => {
      // Remove event listeners
      video.removeEventListener("canplay", handleCanPlay)
      video.removeEventListener("canplaythrough", handleCanPlayThrough)
      video.removeEventListener("error", handleError)

      // Clear progress interval
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
        progressIntervalRef.current = null
      }
    }
  }, [loadingState, onProgress, onReady, initialLoadComplete])

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

      // Only log visibility changes if they actually change
      if (wasVisible !== isVisibleRef.current) {
        console.log("Visibility changed:", isVisibleRef.current)
      }

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
            <Image src="/night3.png" alt="Solar background" fill priority className="object-cover" sizes="100vw" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/30" />

            {/* Loading indicator */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-black/50 px-4 py-2 rounded-full text-white text-sm">
              Loading... {Math.round(loadProgress)}%
            </div>
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
          {/* 
            Video element with optimized attributes:
            - playsinline: prevents fullscreen on mobile
            - preload="auto": start loading immediately
          */}
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
                <Sun size={isMobile ? 36 : isTablet ? 44 : 52} strokeWidth={1.5} />
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
        {isMobile ? (
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

