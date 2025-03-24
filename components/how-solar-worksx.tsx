"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Sun, Moon } from "lucide-react"
import Particles, { initParticlesEngine } from "@tsparticles/react"
import { loadSlim } from "@tsparticles/slim"
import type { ISourceOptions } from "@tsparticles/engine"

// Define scenario types and content
type ScenarioType = "day" | "night"

interface ScenarioContent {
  title: string
  description: string
  video: string
  icon: React.ElementType
}

const scenarios: Record<ScenarioType, ScenarioContent> = {
  day: {
    title: "Daytime",
    description:
      "Excess energy produced gets sent back to the grid providing potential credits to offset future electric bills.",
    video: "/day.mp4",
    icon: Sun,
  },
  night: {
    title: "Nighttime",
    description: "At night, simply use grid energy to power your home.",
    video: "/night.mp4",
    icon: Moon,
  },
}

export default function HowSolarWorks() {
  // State management
  const [scenario, setScenario] = useState<ScenarioType>("day")
  const [isLoaded, setIsLoaded] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [init, setInit] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)
  const [isLandscape, setIsLandscape] = useState(false)

  // Refs
  const sectionRef = useRef<HTMLElement>(null)
  const videoContainerRef = useRef<HTMLDivElement>(null)
  const dayVideoRef = useRef<HTMLVideoElement>(null)
  const nightVideoRef = useRef<HTMLVideoElement>(null)

  // Cache for video elements
  const videoCache = useRef<Map<string, HTMLVideoElement>>(new Map())

  // Initialize media queries
  useEffect(() => {
    const checkMediaQueries = () => {
      setIsMobile(window.matchMedia("(max-width: 640px)").matches)
      setIsTablet(window.matchMedia("(min-width: 641px) and (max-width: 1024px)").matches)
      setIsLandscape(window.matchMedia("(orientation: landscape) and (max-height: 500px)").matches)
    }

    // Initial check
    checkMediaQueries()

    // Add listener for window resize
    window.addEventListener("resize", checkMediaQueries)

    return () => {
      window.removeEventListener("resize", checkMediaQueries)
    }
  }, [])

  // Initialize particles
  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine)
      setInit(true)
    })
  }, [])

  // Preload and cache videos
  useEffect(() => {
    const preloadVideos = async () => {
      const videoUrls = Object.values(scenarios).map((s) => s.video)

      for (const url of videoUrls) {
        try {
          // Create a new video element for each scenario
          const video = document.createElement("video")
          video.muted = true
          video.playsInline = true
          video.preload = "auto"

          // Set crossOrigin to avoid CORS issues on some platforms
          video.crossOrigin = "anonymous"

          // Create a new object URL from the video to ensure it's cached properly
          const response = await fetch(url, {
            method: "GET",
            cache: "force-cache",
            mode: "cors",
            credentials: "same-origin",
          })

          if (!response.ok) {
            throw new Error(`Failed to fetch video: ${url}`)
          }

          const blob = await response.blob()
          const objectUrl = URL.createObjectURL(blob)

          // Set the source and load the video
          video.src = objectUrl

          // Store the video element in our cache
          videoCache.current.set(url, video)

          // Add event listener to know when it's loaded
          const loadPromise = new Promise<void>((resolve) => {
            video.addEventListener("loadeddata", () => resolve(), { once: true })
          })

          // Start loading
          video.load()
          await loadPromise

          console.log(`Video preloaded: ${url}`)
        } catch (error) {
          console.error(`Error preloading video ${url}:`, error)
        }
      }

      // Initialize the video elements with the cached videos
      initializeVideoElements()
    }

    preloadVideos()

    // Cleanup function to revoke object URLs
    return () => {
      videoCache.current.forEach((video) => {
        if (video.src.startsWith("blob:")) {
          URL.revokeObjectURL(video.src)
        }
      })
    }
  }, [])

  // Initialize video elements with cached videos
  const initializeVideoElements = useCallback(() => {
    if (dayVideoRef.current && nightVideoRef.current) {
      const dayVideo = videoCache.current.get(scenarios.day.video)
      const nightVideo = videoCache.current.get(scenarios.night.video)

      if (dayVideo && nightVideo) {
        // Clone the cached videos to use in our component
        dayVideoRef.current.src = dayVideo.src
        nightVideoRef.current.load()

        nightVideoRef.current.src = nightVideo.src
        nightVideoRef.current.load()

        // Start with day video
        dayVideoRef.current.play().catch(console.error)
        setIsLoaded(true)
      }
    }
  }, [])

  // Handle scenario switching
  const switchScenario = useCallback(
    async (targetScenario?: ScenarioType) => {
      if (isTransitioning) return

      const nextScenario = targetScenario || (scenario === "day" ? "night" : "day")

      // Don't switch if it's the same scenario
      if (nextScenario === scenario) return

      setIsTransitioning(true)

      // Get the appropriate video elements
      const currentVideo = scenario === "day" ? dayVideoRef.current : nightVideoRef.current
      const nextVideo = nextScenario === "day" ? dayVideoRef.current : nightVideoRef.current

      if (currentVideo && nextVideo) {
        try {
          // Reset the next video to the beginning
          nextVideo.currentTime = 0

          // Fade out current video, fade in next video
          if (currentVideo) {
            currentVideo.style.opacity = "0"
          }

          nextVideo.style.opacity = "1"

          // Play the next video
          await nextVideo.play()

          // Update the scenario state
          setScenario(nextScenario)

          // Reset transition state after animation completes
          setTimeout(() => {
            setIsTransitioning(false)
          }, 1000)
        } catch (error) {
          console.error("Error during video transition:", error)
          setIsTransitioning(false)
        }
      }
    },
    [isTransitioning, scenario],
  )

  // Handle video end event
  useEffect(() => {
    const dayVideo = dayVideoRef.current
    const nightVideo = nightVideoRef.current

    if (!dayVideo || !nightVideo) return

    const handleVideoEnd = () => {
      if (!isTransitioning) {
        switchScenario()
      }
    }

    dayVideo.addEventListener("ended", handleVideoEnd)
    nightVideo.addEventListener("ended", handleVideoEnd)

    return () => {
      dayVideo.removeEventListener("ended", handleVideoEnd)
      nightVideo.removeEventListener("ended", handleVideoEnd)
    }
  }, [isTransitioning, switchScenario])

  // Particles configuration
  const particlesOptions: ISourceOptions = {
    particles: {
      number: {
        value: isMobile ? 50 : isTablet ? 75 : 100,
        density: { enable: true, value_area: 800 },
      },
      color: { value: "#ffffff" },
      shape: { type: "circle" },
      opacity: {
        value: 0.5,
        random: true,
        anim: { enable: false },
      },
      size: {
        value: isMobile ? 0.8 : 1,
        random: true,
      },
      move: {
        enable: true,
        speed: 0.1,
        direction: "none",
        random: false,
        straight: false,
        out_mode: "out",
        bounce: false,
      },
    },
    interactivity: {
      detect_on: "canvas",
      events: {
        onhover: { enable: false },
        onclick: { enable: false },
        resize: true,
      },
    },
    retina_detect: true,
    background: {
      color: { value: "transparent" },
    },
    fullScreen: { enable: false },
  }

  // Determine video container size based on device
  const getVideoContainerClasses = () => {
    if (isMobile) {
      return isLandscape ? "w-full h-[40vh] my-2" : "w-full h-[40vh] my-4"
    } else if (isTablet) {
      return isLandscape ? "md:w-[60vh] md:h-[40vh]" : "md:w-[70vh] md:h-[50vh]"
    } else {
      return "md:w-[180vh] md:h-[70vh]"
    }
  }

  return (
    <section ref={sectionRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background transitions */}
      <motion.div
        className="absolute inset-0 bg-[url('/day1.png')] bg-cover bg-center"
        initial={{ opacity: 1 }}
        animate={{ opacity: scenario === "day" ? 1 : 0 }}
        transition={{ duration: 3 }}
      />
      <motion.div
        className="absolute inset-0 bg-[url('/night3.png')] bg-cover bg-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: scenario === "night" ? 1 : 0 }}
        transition={{ duration: 3 }}
      />

      {/* Night particles */}
      <AnimatePresence>
        {scenario === "night" && init && (
          <motion.div
            className="absolute inset-0 z-10 h-full w-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2 }}
            style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
          >
            <Particles
              id="tsparticles-solar"
              className="h-full w-full"
              options={particlesOptions}
              container={sectionRef}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content - Responsive layout */}
      <div className="relative z-20 w-full h-full flex flex-col justify-between py-6 md:py-10 px-4 md:px-6">
        <div className="w-full mx-auto flex-grow flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
          {/* Responsive layout - stack on mobile, side-by-side on larger screens */}
          {isMobile ? (
            // Mobile layout - stacked
            <>
              {/* Title and description at top */}
              <div className="w-full text-center mb-2">
                <motion.h2
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className={`text-3xl sm:text-4xl font-medium mb-2 transition-colors duration-1000
                    ${scenario === "day" ? "text-black" : "text-white"}`}
                >
                  How Solar Works
                </motion.h2>

                {/* Scenario description */}
                <AnimatePresence mode="wait">
                  <motion.p
                    key={scenario}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.5 }}
                    className={`text-base sm:text-lg px-4 transition-colors duration-1000
                      ${scenario === "day" ? "text-black text-opacity-80" : "text-white text-opacity-80"}`}
                  >
                    {scenarios[scenario].description}
                  </motion.p>
                </AnimatePresence>
              </div>

              {/* Video in the middle */}
              <div className={getVideoContainerClasses()}>
                <motion.div
                  ref={videoContainerRef}
                  className="w-full h-full relative rounded-xl md:rounded-3xl overflow-hidden shadow-lg md:shadow-2xl"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: isLoaded ? 1 : 0, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  {/* Video container with both videos always present */}
                  <div className="relative w-full h-full">
                    {/* Day video */}
                    <video
                      ref={dayVideoRef}
                      className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000"
                      style={{ opacity: scenario === "day" ? 1 : 0 }}
                      muted
                      playsInline
                      crossOrigin="anonymous"
                    />

                    {/* Night video */}
                    <video
                      ref={nightVideoRef}
                      className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000"
                      style={{ opacity: scenario === "night" ? 1 : 0 }}
                      muted
                      playsInline
                      crossOrigin="anonymous"
                    />
                  </div>
                </motion.div>
              </div>
            </>
          ) : (
            // Tablet and desktop layout - side by side
            <>
              {/* Left text */}
              <div className="md:w-1/4 text-center md:text-left">
                <motion.h2
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className={`text-4xl md:text-5xl lg:text-6xl font-medium mb-6 transition-colors duration-1000
                    ${scenario === "day" ? "text-black" : "text-white"}`}
                >
                  How Solar Works
                </motion.h2>
              </div>

              {/* Center video */}
              <div className={getVideoContainerClasses()}>
                <motion.div
                  ref={videoContainerRef}
                  className="w-full h-full relative rounded-3xl overflow-hidden shadow-2xl"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: isLoaded ? 1 : 0, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  {/* Video container with both videos always present */}
                  <div className="relative w-full h-full">
                    {/* Day video */}
                    <video
                      ref={dayVideoRef}
                      className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000"
                      style={{ opacity: scenario === "day" ? 1 : 0 }}
                      muted
                      playsInline
                      crossOrigin="anonymous"
                    />

                    {/* Night video */}
                    <video
                      ref={nightVideoRef}
                      className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000"
                      style={{ opacity: scenario === "night" ? 1 : 0 }}
                      muted
                      playsInline
                      crossOrigin="anonymous"
                    />
                  </div>
                </motion.div>
              </div>

              {/* Right text */}
              <div className="md:w-1/4 text-center md:text-left">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={scenario}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                    className={`text-lg md:text-xl lg:text-2xl transition-colors duration-1000
                      ${scenario === "day" ? "text-black text-opacity-80" : "text-white text-opacity-80"}`}
                  >
                    {scenarios[scenario].description}
                  </motion.p>
                </AnimatePresence>
              </div>
            </>
          )}
        </div>

        {/* Scenario indicators - Responsive sizing */}
        <div className="flex justify-center gap-2 md:gap-6 mt-4 md:mt-8">
          {(Object.entries(scenarios) as [ScenarioType, ScenarioContent][]).map(([key, { title, icon: Icon }]) => (
            <button
              key={key}
              onClick={() => {
                if (!isTransitioning && scenario !== key) {
                  switchScenario(key)
                }
              }}
              disabled={isTransitioning}
              aria-label={`Switch to ${title} scenario`}
              aria-pressed={scenario === key}
              className={`
                flex items-center gap-2 md:gap-3 px-3 md:px-6 py-2 md:py-3 rounded-full transition-all duration-500
                text-sm md:text-base
                disabled:opacity-50 disabled:cursor-not-allowed
                ${
                  scenario === key
                    ? scenario === "day"
                      ? "bg-amber-200 text-black"
                      : "bg-violet-200 text-black"
                    : "bg-gray-800 bg-opacity-50 text-white hover:bg-opacity-70"
                }
              `}
            >
              <Icon
                className={`w-4 h-4 md:w-6 md:h-6 ${
                  scenario === key ? (scenario === "day" ? "text-black" : "text-gray-800") : "text-white opacity-60"
                }`}
              />
              <span
                className={`font-normal leading-tight ${
                  scenario === key ? (scenario === "day" ? "text-black" : "text-gray-800") : "text-white opacity-60"
                }`}
              >
                {title}
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}

