"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Sun, Moon } from "lucide-react"
import Particles, { initParticlesEngine } from "@tsparticles/react"
import { loadSlim } from "@tsparticles/slim"
import type { ISourceOptions } from "@tsparticles/engine"
import { useMediaQuery } from "@/hooks/use-media-query"

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
  const [scenario, setScenario] = useState<ScenarioType>("day")
  const [isLoaded, setIsLoaded] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [init, setInit] = useState(false)
  const currentVideoRef = useRef<HTMLVideoElement>(null)
  const nextVideoRef = useRef<HTMLVideoElement>(null)
  const sectionRef = useRef<HTMLElement>(null)

  // Media queries for responsive design
  const isMobile = useMediaQuery("(max-width: 640px)")
  const isTablet = useMediaQuery("(min-width: 641px) and (max-width: 1024px)")
  const isLandscape = useMediaQuery("(orientation: landscape) and (max-height: 500px)")

  useEffect(() => {
    // Initialize particles
    initParticlesEngine(async (engine) => {
      await loadSlim(engine)
      setInit(true)
    })

    // Preload videos
    Object.values(scenarios).forEach(({ video }) => {
      const videoElement = document.createElement("video")
      videoElement.src = video
      videoElement.load()
    })
  }, [])

  const switchScenario = useCallback(
    async (targetScenario?: ScenarioType) => {
      if (isTransitioning) return
      setIsTransitioning(true)

      const nextScenario = targetScenario || (scenario === "day" ? "night" : "day")
      const nextVideo = nextVideoRef.current
      const currentVideo = currentVideoRef.current

      if (nextVideo && currentVideo) {
        // Prepare next video
        nextVideo.src = scenarios[nextScenario].video
        nextVideo.currentTime = 0

        try {
          // Load and play the next video
          await nextVideo.load()
          await nextVideo.play()

          // Update scenario after ensuring next video is playing
          setScenario(nextScenario)

          // Reset transition state after animation completes
          setTimeout(() => {
            setIsTransitioning(false)
            // Update current video source after transition
            currentVideo.src = scenarios[nextScenario].video
            currentVideo.load()
          }, 1000)
        } catch (error) {
          console.error("Error during video transition:", error)
          setIsTransitioning(false)
        }
      }
    },
    [isTransitioning, scenario],
  )

  useEffect(() => {
    const currentVideo = currentVideoRef.current
    const nextVideo = nextVideoRef.current

    if (!currentVideo || !nextVideo) return

    const handleVideoEnd = () => {
      if (!isTransitioning) {
        switchScenario()
      }
    }

    const handleCanPlay = () => {
      setIsLoaded(true)
      currentVideo.play().catch(console.error)
    }

    currentVideo.addEventListener("ended", handleVideoEnd)
    currentVideo.addEventListener("canplay", handleCanPlay)
    nextVideo.addEventListener("ended", handleVideoEnd)

    // Start playing when mounted
    if (currentVideo.readyState >= 3) {
      // HAVE_FUTURE_DATA or higher
      handleCanPlay()
    }

    return () => {
      currentVideo.removeEventListener("ended", handleVideoEnd)
      currentVideo.removeEventListener("canplay", handleCanPlay)
      nextVideo.removeEventListener("ended", handleVideoEnd)
    }
  }, [isTransitioning, switchScenario])

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
                  className="w-full h-full relative rounded-xl md:rounded-3xl overflow-hidden shadow-lg md:shadow-2xl"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: isLoaded ? 1 : 0, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="relative w-full h-full">
                    <video
                      ref={currentVideoRef}
                      className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000
                        ${isTransitioning ? "opacity-0" : "opacity-100"}`}
                      muted
                      playsInline
                    >
                      <source src={scenarios[scenario].video} type="video/mp4" />
                    </video>
                    <video
                      ref={nextVideoRef}
                      className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000
                        ${isTransitioning ? "opacity-100" : "opacity-0"}`}
                      muted
                      playsInline
                    >
                      <source src={scenarios[scenario === "day" ? "night" : "day"].video} type="video/mp4" />
                    </video>
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
                  className="w-full h-full relative rounded-3xl overflow-hidden shadow-2xl"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: isLoaded ? 1 : 0, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="relative w-full h-full">
                    <video
                      ref={currentVideoRef}
                      className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000
                        ${isTransitioning ? "opacity-0" : "opacity-100"}`}
                      muted
                      playsInline
                    >
                      <source src={scenarios[scenario].video} type="video/mp4" />
                    </video>
                    <video
                      ref={nextVideoRef}
                      className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000
                        ${isTransitioning ? "opacity-100" : "opacity-0"}`}
                      muted
                      playsInline
                    >
                      <source src={scenarios[scenario === "day" ? "night" : "day"].video} type="video/mp4" />
                    </video>
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

