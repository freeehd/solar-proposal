"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
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
    bgColor: "from-gray-900 to-gray-800",
    textColor: "text-gray-100",
    accentColor: "bg-gray-700",
  },
}

export default function HowSolarWorks() {
  const [activeScenario, setActiveScenario] = useState<ScenarioType>("day")
  const [isVideoLoaded, setIsVideoLoaded] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  const switchScenario = () => {
    setActiveScenario((prev) => (prev === "day" ? "night" : "day"))
  }

  useEffect(() => {
    const video = videoRef.current
    if (video) {
      const handleVideoEnd = () => {
        switchScenario()
        video.play()
      }

      video.addEventListener("loadeddata", () => setIsVideoLoaded(true))
      video.addEventListener("ended", handleVideoEnd)

      return () => {
        video.removeEventListener("loadeddata", () => setIsVideoLoaded(true))
        video.removeEventListener("ended", handleVideoEnd)
      }
    }
  }, [])

  useEffect(() => {
    const video = videoRef.current
    if (video) {
      video.src = scenarios[activeScenario].video
      video.load()
      video.play()
    }
  }, [activeScenario]) // Removed switchScenario from dependencies

  return (
      <section className="relative py-32">
        <motion.div
            className="absolute inset-0 bg-[url('/day1.png')] bg-cover bg-center"
            initial={{ opacity: 1 }}
            animate={{ opacity: activeScenario === "day" ? 1 : 0 }}
            transition={{ duration: 3 }}
        />
        <motion.div
            className="absolute inset-0 bg-[url('/night2.png')] bg-cover bg-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: activeScenario === "night" ? 1 : 0 }}
            transition={{ duration: 3 }}
        />
        <div className="relative z-10">
          <div className="container mx-auto px-4">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col md:flex-row items-center gap-8 mb-12">
                {/* Left Text */}
                <div className="md:w-1/4 text-center md:text-left">
                  <motion.h2
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      className={`text-4xl font-light leading-tight mb-4 transition-colors duration-1000 ${
                          activeScenario === "day" ? "text-black" : "text-white"
                      }`}
                  >
                    How Solar Works
                  </motion.h2>
                  <motion.h3
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                      className={`text-2xl font-medium transition-colors duration-1000 ${
                          activeScenario === "day" ? "text-black" : "text-white"
                      }`}
                  >
                    {scenarios[activeScenario].title}
                  </motion.h3>
                </div>

                {/* Center Video */}
                <div className="md:w-full">
                  <motion.div
                      className="w-full aspect-video relative rounded-2xl overflow-hidden shadow-2xl"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: isVideoLoaded ? 1 : 0, y: 0 }}
                      transition={{ duration: 0.5 }}
                  >
                    <video
                        ref={videoRef}
                        className="w-full h-full object-cover"
                        autoPlay
                        muted
                        playsInline
                        onLoadedData={() => setIsVideoLoaded(true)}
                    >
                      <source src={scenarios[activeScenario].video} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
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
                        className={`text-lg transition-colors duration-1000 ${
                            activeScenario === "day" ? "text-black text-opacity-80" : "text-white text-opacity-80"
                        }`}
                    >
                      {scenarios[activeScenario].description}
                    </motion.p>
                  </AnimatePresence>
                </div>
              </div>

              {/* Scenario Indicator */}
              <div className="flex justify-center gap-4 mt-8">
                {(Object.entries(scenarios) as [ScenarioType, ScenarioContent][]).map(([key, scenario]) => (
                    <div
                        key={key}
                        className={`
                    flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-500
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
                          className={`w-5 h-5 ${
                              activeScenario === key
                                  ? activeScenario === "day"
                                      ? "text-black"
                                      : "text-gray-800"
                                  : "text-white opacity-60"
                          }`}
                      />
                      <span
                          className={`text-sm font-medium ${
                              activeScenario === key
                                  ? activeScenario === "day"
                                      ? "text-black"
                                      : "text-gray-800"
                                  : "text-white opacity-60"
                          }`}
                      >
                    {scenario.title}
                  </span>
                    </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
  )
}

