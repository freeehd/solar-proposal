"use client"

import type React from "react"
import { useState, useRef, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Sun, Moon } from "lucide-react"

type ScenarioType = "day" | "night"

interface ScenarioContent {
  title: string
  description: string
  video: string
  icon: React.ElementType
  bgColor: string
  textColor: string
  accentColor: string
}

const scenarios: Record<ScenarioType, ScenarioContent> = {
  day: {
    title: "Daytime",
    description:
        "Solar panels efficiently convert sunlight into clean electricity, powering your home and storing excess energy.",
    video: "/day.mp4",
    icon: Sun,
    bgColor: "from-gray-50 to-white",
    textColor: "text-gray-800",
    accentColor: "bg-gray-200",
  },
  night: {
    title: "Nighttime",
    description: "Your home seamlessly switches to stored energy or the grid, ensuring continuous power.",
    video: "/night.mp4",
    icon: Moon,
    bgColor: "from-gray-100 to-gray-200",
    textColor: "text-gray-100",
    accentColor: "bg-gray-700",
  },
}

export default function HowSolarWorks() {
  const [activeScenario, setActiveScenario] = useState<ScenarioType>("day")
  const [isVideoLoaded, setIsVideoLoaded] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [currentVideo, setCurrentVideo] = useState<ScenarioType>("day")
  const videoRef = useRef<HTMLVideoElement>(null)
  const nextVideoRef = useRef<HTMLVideoElement>(null)

  const switchScenario = useCallback(
      (newScenario: ScenarioType) => {
        if (!isTransitioning && newScenario !== activeScenario) {
          setActiveScenario(newScenario)
        }
      },
      [isTransitioning, activeScenario],
  )

  useEffect(() => {
    const video = videoRef.current
    const nextVideo = nextVideoRef.current
    if (video && nextVideo) {
      const handleVideoEnd = () => {
        switchScenario(activeScenario === "day" ? "night" : "day")
      }

      video.addEventListener("loadeddata", () => setIsVideoLoaded(true))
      video.addEventListener("ended", handleVideoEnd)

      return () => {
        video.removeEventListener("loadeddata", () => setIsVideoLoaded(true))
        video.removeEventListener("ended", handleVideoEnd)
      }
    }
  }, [switchScenario, activeScenario])

  useEffect(() => {
    const video = videoRef.current
    const nextVideo = nextVideoRef.current
    if (video && nextVideo) {
      setIsTransitioning(true)
      nextVideo.src = scenarios[activeScenario].video
      nextVideo.load()

      const handleNextVideoLoaded = () => {
        nextVideo.play().then(() => {
          video.style.opacity = "0"
          nextVideo.style.opacity = "1"
          setTimeout(() => {
            setCurrentVideo(activeScenario)
            setIsTransitioning(false)
          }, 500) // Duration of the fade transition
        })
      }

      nextVideo.addEventListener("canplaythrough", handleNextVideoLoaded, { once: true })

      return () => {
        nextVideo.removeEventListener("canplaythrough", handleNextVideoLoaded)
      }
    }
  }, [activeScenario])

  return (
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <motion.div
            className="absolute inset-0 bg-[url('/day.png')] bg-cover bg-center"
            initial={{ opacity: 1 }}
            animate={{ opacity: activeScenario === "day" ? 1 : 0 }}
            transition={{ duration: 3 }}
        />
        <motion.div
            className="absolute inset-0 bg-[url('/night.png')] bg-cover bg-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: activeScenario === "night" ? 1 : 0 }}
            transition={{ duration: 3 }}
        />
        <div className="relative z-10 w-full h-full flex flex-col justify-between py-10 px-6 md:px-12">
          <div className="container mx-auto flex-grow flex flex-col md:flex-row items-center justify-center gap-8">
            {/* Left Text */}
            <div className="md:w-1/4 text-center md:text-left">
              <motion.h2
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className={`text-5xl md:text-6xl font-light leading-tight mb-6 transition-colors duration-1000 ${
                      activeScenario === "day" ? "text-black" : "text-white"
                  }`}
              >
                How Solar Works
              </motion.h2>
              <motion.h3
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className={`text-3xl md:text-4xl font-medium transition-colors duration-1000 ${
                      activeScenario === "day" ? "text-black" : "text-white"
                  }`}
              >
                {scenarios[activeScenario].title}
              </motion.h3>
            </div>

            {/* Center Video */}
            <div className="md:w-full h-[40vh] md:h-[60vh]">
              <motion.div
                  className="w-full h-full relative rounded-3xl overflow-hidden shadow-2xl"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: isVideoLoaded ? 1 : 0, y: 0 }}
                  transition={{ duration: 0.5 }}
              >
                <video
                    ref={videoRef}
                    className="w-full h-full object-cover absolute inset-0 transition-opacity duration-500"
                    autoPlay
                    muted
                    playsInline
                    onLoadedData={() => setIsVideoLoaded(true)}
                >
                  <source src={scenarios[currentVideo].video} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
                <video
                    ref={nextVideoRef}
                    className="w-full h-full object-cover absolute inset-0 opacity-0 transition-opacity duration-500"
                    muted
                    playsInline
                />
              </motion.div>
            </div>

            {/* Right Text */}
            <div className="md:w-1/4 text-center md:text-left">
              <AnimatePresence mode="wait">
                <motion.p
                    key={activeScenario}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                    className={`text-xl md:text-2xl transition-colors duration-1000 ${
                        activeScenario === "day" ? "text-black text-opacity-80" : "text-white text-opacity-80"
                    }`}
                >
                  {scenarios[activeScenario].description}
                </motion.p>
              </AnimatePresence>
            </div>
          </div>

          {/* Scenario Indicator */}
          <div className="flex justify-center gap-6 mt-8">
            {(Object.entries(scenarios) as [ScenarioType, ScenarioContent][]).map(([key, scenario]) => (
                <button
                    key={key}
                    onClick={() => switchScenario(key)}
                    className={`
                flex items-center gap-3 px-6 py-3 rounded-full transition-all duration-500
                ${
                        activeScenario === key
                            ? activeScenario === "day"
                                ? "bg-gray-200 text-black"
                                : "bg-white text-gray-800"
                            : "bg-gray-800 bg-opacity-50 text-white"
                    }
              `}
                >
                  <scenario.icon
                      className={`w-6 h-6 ${
                          activeScenario === key
                              ? activeScenario === "day"
                                  ? "text-black"
                                  : "text-gray-800"
                              : "text-white opacity-60"
                      }`}
                  />
                  <span
                      className={`text-lg font-medium ${
                          activeScenario === key
                              ? activeScenario === "day"
                                  ? "text-black"
                                  : "text-gray-800"
                              : "text-white opacity-60"
                      }`}
                  >
                {scenario.title}
              </span>
                </button>
            ))}
          </div>
        </div>
      </section>
  )
}

