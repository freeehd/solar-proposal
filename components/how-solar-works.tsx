"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Sun, Moon } from "lucide-react"

type ScenarioType = "day" | "night"

interface ScenarioContent {
  title: string
  description: string
  video: string
  icon: React.ElementType
}

const scenarios: Record<ScenarioType, ScenarioContent> = {
  day: {
    title: "Sunny Day",
    description:
        "Solar panels capture sunlight and convert it to electricity, powering your home directly and storing excess energy.",
    video: "/day.mp4",
    icon: Sun,
  },
  night: {
    title: "Night Time",
    description: "At night, simply use grid energy to power your home.",
    video: "/night.mp4",
    icon: Moon,
  },
}

export default function HowSolarWorks() {
  const [activeScenario, setActiveScenario] = useState<ScenarioType>("day")
  const [isVideoLoaded, setIsVideoLoaded] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const video = videoRef.current
    if (video) {
      video.addEventListener("loadeddata", () => setIsVideoLoaded(true))
      return () => {
        video.removeEventListener("loadeddata", () => setIsVideoLoaded(true))
      }
    }
  }, [])

  useEffect(() => {
    startAutoSwitch()
    return () => stopAutoSwitch()
  }, [])

  const startAutoSwitch = () => {
    if (intervalRef.current) return
    intervalRef.current = setInterval(() => {
      if (!isHovering) {
        setActiveScenario((prev) => (prev === "day" ? "night" : "day"))
      }
    }, 5000)
  }

  const stopAutoSwitch = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  const handleMouseEnter = () => {
    setIsHovering(true)
    stopAutoSwitch()
  }

  const handleMouseLeave = () => {
    setIsHovering(false)
    startAutoSwitch()
  }

  return (
      <section className="relative py-24 bg-gradient-to-b from-white to-blue-50">
        <div className="container mx-auto px-4">
          <div className="max-w-full mx-auto">
            <div className="flex flex-col md:flex-row items-center gap-8 mb-12">
              {/* Title */}
              <div className="md:w-1/4">
                <motion.h2
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-4xl font-bold text-blue-600 leading-tight"
                >
                  How solar works
                </motion.h2>
              </div>

              {/* Video */}
              <div className="md:w-full">
                <motion.div
                    className="w-full aspect-video relative rounded-[40px] overflow-hidden bg-gray-50 shadow-xl"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: isVideoLoaded ? 1 : 0, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                  <AnimatePresence mode="wait">
                    <motion.div
                        key={activeScenario}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className="absolute inset-0"
                    >
                      <video
                          ref={videoRef}
                          className="w-full h-full object-cover"
                          autoPlay
                          muted
                          loop
                          playsInline
                          onLoadedData={() => setIsVideoLoaded(true)}
                      >
                        <source src={scenarios[activeScenario].video} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                    </motion.div>
                  </AnimatePresence>
                </motion.div>
              </div>

              {/* Description */}
              <div className="md:w-1/4">
                <AnimatePresence mode="wait">
                  <motion.p
                      key={activeScenario}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="text-lg text-gray-700"
                  >
                    {scenarios[activeScenario].description}
                  </motion.p>
                </AnimatePresence>
              </div>
            </div>

            {/* Controls */}
            <div className="flex justify-center gap-4 mt-16">
              {(Object.entries(scenarios) as [ScenarioType, ScenarioContent][]).map(([key, scenario]) => (
                  <Button
                      key={key}
                      variant="ghost"
                      className={`
                  min-w-[160px] px-6 py-4 rounded-full transition-all duration-300
                  ${
                          activeScenario === key
                              ? "bg-blue-500 text-white shadow-lg scale-105"
                              : "bg-white text-gray-700 hover:bg-blue-100 hover:text-blue-600"
                      }
                `}
                      onClick={() => setActiveScenario(key)}
                      onMouseEnter={handleMouseEnter}
                      onMouseLeave={handleMouseLeave}
                  >
                    <scenario.icon className={`w-5 h-5 mr-2 ${activeScenario === key ? "text-white" : "text-blue-500"}`} />
                    <span className="font-medium">{scenario.title}</span>
                  </Button>
              ))}
            </div>
          </div>
        </div>
      </section>
  )
}

