"use client"

import { useRef, useState, useEffect } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Sun } from "lucide-react"
import { useMediaQuery } from "@/hooks/use-media-query"
import Image from "next/image"
import { useStableCallback } from "@/hooks/use-stable-callback"

interface HeroSectionProps {
  name: string
  address: string
  onReady?: () => void
  onProgress?: (progress: number) => void
}

// Global video cache with browser detection
const videoCache = {
  url: null as string | null,
  blob: null as Blob | null,
  isSafari: false,
  isLoading: false,
  loadPromise: null as Promise<string> | null,
  init: false,
}

// Initialize browser detection once
if (typeof window !== "undefined" && !videoCache.init) {
  videoCache.isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
  console.log(`Browser detected as ${videoCache.isSafari ? "Safari" : "not Safari"}`)
  videoCache.init = true
}

export default function HeroSection({ name, address, onReady, onProgress }: HeroSectionProps) {
  // Core state
  const [loadingState, setLoadingState] = useState<"initial" | "loading" | "ready" | "error">("initial")
  const [loadProgress, setLoadProgress] = useState(0)
  const [videoReady, setVideoReady] = useState(false)

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null)
  const mountedRef = useRef(true)
  const visibilityObserverRef = useRef<IntersectionObserver | null>(null)
  const isVisibleRef = useRef(true)
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const videoUrlRef = useRef<string | null>(null)

  // Media queries for responsive design
  const isMobile = useMediaQuery("(max-width: 640px)")
  const isTablet = useMediaQuery("(min-width: 641px) and (max-width: 1024px)")

  // Preload video once and cache it
  const preloadVideo = useStableCallback(async (): Promise<string> => {
    // If we already have a cached URL, return it immediately
    if (videoCache.url && !videoCache.isSafari) {
      console.log("Using cached video URL (non-Safari)")
      return videoCache.url
    }

    // For Safari, we need to recreate the blob URL each time
    if (videoCache.blob && videoCache.isSafari) {
      console.log("Recreating blob URL for Safari")
      // Revoke previous URL if it exists to prevent memory leaks
      if (videoUrlRef.current) {
        URL.revokeObjectURL(videoUrlRef.current)
      }
      const newUrl = URL.createObjectURL(videoCache.blob)
      videoUrlRef.current = newUrl
      return newUrl
    }

    // If preloading is in progress, return the existing promise
    if (videoCache.isLoading && videoCache.loadPromise) {
      console.log("Video preloading already in progress, waiting...")
      return videoCache.loadPromise
    }

    console.log("Starting video preload")
    // Start preloading
    videoCache.isLoading = true

    videoCache.loadPromise = new Promise<string>(async (resolve, reject) => {
      try {
        // Report initial progress
        setLoadProgress(10)
        if (onProgress) onProgress(10)

        // Fetch the video
        console.log("Fetching video file")
        const response = await fetch("/video3.webm")

        if (!response.ok) {
          throw new Error(`Failed to fetch video: ${response.status} ${response.statusText}`)
        }

        // Handle progress reporting if possible
        if (response.body && response.headers.get("content-length")) {
          const contentLength = Number(response.headers.get("content-length"))
          let receivedLength = 0
          const chunks: Uint8Array[] = []
          const reader = response.body.getReader()

          while (true) {
            const { done, value } = await reader.read()

            if (done) {
              break
            }

            chunks.push(value)
            receivedLength += value.length

            // Calculate progress (10-90% range)
            const progress = Math.round(10 + (receivedLength / contentLength) * 80)

            if (mountedRef.current) {
              setLoadProgress(progress)
              if (onProgress) onProgress(progress)
            }
          }

          // Create blob from chunks
          const chunksAll = new Uint8Array(receivedLength)
          let position = 0
          for (const chunk of chunks) {
            chunksAll.set(chunk, position)
            position += chunk.length
          }

          console.log("Video download complete, creating blob URL")
          const blob = new Blob([chunksAll], { type: "video/webm" })

          // Store the blob in cache
          videoCache.blob = blob

          // Create and store URL
          // Revoke previous URL if it exists
          if (videoUrlRef.current) {
            URL.revokeObjectURL(videoUrlRef.current)
          }

          const url = URL.createObjectURL(blob)
          videoUrlRef.current = url

          // Only store in global cache for non-Safari browsers
          if (!videoCache.isSafari) {
            videoCache.url = url
          }

          resolve(url)
        } else {
          // Fallback for browsers without ReadableStream support
          console.log("Using fallback download method")
          const blob = await response.blob()

          // Store the blob in cache
          videoCache.blob = blob

          // Create and store URL
          // Revoke previous URL if it exists
          if (videoUrlRef.current) {
            URL.revokeObjectURL(videoUrlRef.current)
          }

          const url = URL.createObjectURL(blob)
          videoUrlRef.current = url

          // Only store in global cache for non-Safari browsers
          if (!videoCache.isSafari) {
            videoCache.url = url
          }

          resolve(url)
        }
      } catch (error) {
        console.error("Error preloading video:", error)
        reject(error)
      } finally {
        videoCache.isLoading = false
      }
    })

    return videoCache.loadPromise
  })

  // Initialize component
  useEffect(() => {
    console.log("HeroSection mounted")
    mountedRef.current = true
    setLoadingState("loading")

    return () => {
      mountedRef.current = false

      // Clear any pending timeouts
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current)
      }

      // Clean up visibility observer
      if (visibilityObserverRef.current) {
        visibilityObserverRef.current.disconnect()
        visibilityObserverRef.current = null
      }

      // Don't revoke the URL on unmount for non-Safari browsers to maintain the cache
      // For Safari, we'll recreate it each time anyway
      if (videoCache.isSafari && videoUrlRef.current) {
        URL.revokeObjectURL(videoUrlRef.current)
        videoUrlRef.current = null
      }
    }
  }, [])

  // Set up force completion timeout - longer timeout for production
  useEffect(() => {
    if (loadingState !== "loading") return

    console.log("Setting up force completion timeout")
    loadingTimeoutRef.current = setTimeout(() => {
      if (loadingState === "loading" && mountedRef.current) {
        console.log("Force completing video load due to timeout")
        setLoadingState("ready")
        setLoadProgress(100)
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
  }, [loadingState, onProgress, onReady])

  // Load and set up video
  useEffect(() => {
    const video = videoRef.current
    if (!video || loadingState !== "loading") return

    console.log("Setting up video element")

    // Function to handle video loaded and ready to play
    const handleCanPlay = () => {
      console.log("Video can play now")
      if (!mountedRef.current) return

      setVideoReady(true)
      setLoadProgress(100)
      if (onProgress) onProgress(100)

      // Only mark as ready if we're still in loading state
      if (loadingState === "loading") {
        console.log("Transitioning to ready state")
        setLoadingState("ready")
        if (onReady) onReady()
      }

      // Play video if it's visible
      if (isVisibleRef.current) {
        console.log("Attempting to play video")
        // Add a small delay to ensure smooth transition
        setTimeout(() => {
          if (mountedRef.current && isVisibleRef.current && video.paused) {
            video.play().catch((err) => {
              console.warn("Could not autoplay video:", err)
            })
          }
        }, 100)
      }
    }

    // Function to handle video loading error
    const handleError = (e: Event) => {
      console.error("Video loading error:", e)
      if (!mountedRef.current) return

      // Try one more time with a direct src if using blob URL failed
      if (videoUrlRef.current && videoUrlRef.current.startsWith("blob:")) {
        console.log("Blob URL failed, trying direct file URL")
        video.src = "/video3.webm"
        video.load()
        return
      }

      setLoadingState("error")
      setLoadProgress(100)
      if (onProgress) onProgress(100)
      if (onReady) onReady()
    }

    // Add event listeners
    video.addEventListener("canplay", handleCanPlay, { once: true })
    video.addEventListener("error", handleError, { once: true })

    // Start loading the video
    const loadVideo = async () => {
      try {
        console.log("Starting video loading process")

        // For Safari, we'll try the direct file first if we haven't cached the blob yet
        if (videoCache.isSafari && !videoCache.blob) {
          console.log("Safari detected, trying direct file first")
          video.src = "/video3.webm"
          video.load()

          // Set a timeout to try blob URL if direct loading takes too long
          const safariTimeout = setTimeout(() => {
            if (!videoReady && mountedRef.current) {
              console.log("Direct loading taking too long, trying blob approach")
              loadWithBlob()
            }
          }, 3000)

          return () => clearTimeout(safariTimeout)
        } else {
          return loadWithBlob()
        }

        function loadWithBlob() {
          // Get video URL (either from cache or by downloading)
          preloadVideo()
            .then((videoUrl) => {
              if (!mountedRef.current) return

              console.log("Setting video source to:", videoUrl)
              // Set video source
              video.src = videoUrl

              // Update progress
              setLoadProgress(90)
              if (onProgress) onProgress(90)

              // Preload video data
              video.load()
            })
            .catch((error) => {
              console.error("Error in blob video loading:", error)

              if (!mountedRef.current) return

              // Fallback to direct file URL
              console.log("Falling back to direct file URL")
              video.src = "/video3.webm"
              video.load()
            })
        }
      } catch (error) {
        console.error("Error in video loading process:", error)

        if (!mountedRef.current) return

        // Handle error state
        setLoadingState("error")
        setLoadProgress(100)
        if (onProgress) onProgress(100)
        if (onReady) onReady()
      }
    }

    // Start loading
    loadVideo()

    // Clean up function
    return () => {
      // Remove event listeners
      video.removeEventListener("canplay", handleCanPlay)
      video.removeEventListener("error", handleError)
    }
  }, [loadingState, preloadVideo, onProgress, onReady, videoReady])

  // Set up visibility observer to handle scroll behavior
  useEffect(() => {
    const video = videoRef.current
    if (!video || !videoReady) return

    console.log("Setting up visibility observer")

    // Handle scroll events efficiently with IntersectionObserver
    const handleVisibilityChange = (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries
      const wasVisible = isVisibleRef.current
      isVisibleRef.current = entry.isIntersecting

      console.log("Visibility changed:", isVisibleRef.current)

      if (entry.isIntersecting && !wasVisible) {
        // Element is visible, play video if it's loaded
        if (videoReady && video.paused) {
          console.log("Playing video on visibility change")
          // Add a small delay to prevent rapid play/pause during scroll bounces
          setTimeout(() => {
            if (mountedRef.current && isVisibleRef.current && video.paused) {
              video.play().catch((err) => {
                console.warn("Could not play video on visibility change:", err)
              })
            }
          }, 150)
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
      rootMargin: "100px", // Increased margin to start loading earlier
      threshold: [0.1, 0.3], // Multiple thresholds for smoother transitions
    })

    // Start observing the container rather than the video itself
    const observeTarget = video.parentElement || video
    visibilityObserverRef.current.observe(observeTarget)

    return () => {
      // Clean up observer
      if (visibilityObserverRef.current) {
        visibilityObserverRef.current.disconnect()
        visibilityObserverRef.current = null
      }
    }
  }, [videoReady])

  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Loading placeholder */}
      <AnimatePresence>
        {loadingState === "loading" && (
          <motion.div
            className="absolute inset-0 z-10 bg-black"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.5 } }}
          >
            <Image src="/night3.png" alt="Solar background" fill priority className="object-cover" sizes="100vw" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/30" />

            {/* Loading indicator */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-black/50 px-4 py-2 rounded-full text-white text-sm">
              Loading... {loadProgress}%
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
          <video
            ref={videoRef}
            className="absolute h-full w-full object-cover will-change-transform"
            style={{ transform: "translateZ(0)" }}
            muted
            loop
            playsInline
            preload="auto"
          >
            {/* Source set via JavaScript */}
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

