"use client"

import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"

const slides = [
  {
    id: 1,
    image: "/app/1.png",
    description: "Use analyze features to better understand the home's consumption trends.",
  },
  {
    id: 2,
    image: "/app/2.png",
    description: "Tap and hold on the analyze graph to see more details about the home's consumption trends.",
  },
  {
    id: 3,
    image: "/app/3.png",
    description:
      "Monitor your home solar, storage and electricity use from virtually anywhere with the mySunPower™ Monitoring app.",
  },
]

export default function AppSection() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [direction, setDirection] = useState(0) // -1 for left, 1 for right

  const nextSlide = () => {
    setDirection(1)
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  const prevSlide = () => {
    setDirection(-1)
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  useEffect(() => {
    const interval = setInterval(nextSlide, 5000) // Change slide every 5 seconds
    return () => clearInterval(interval)
  }, [])

  // Calculate positions for all three phones
  const getPhonePosition = (index: number) => {
    // Calculate the relative index (position relative to current slide)
    const relativeIndex = (index - currentSlide + slides.length) % slides.length

    // Map the relative index to a position in the carousel
    switch (relativeIndex) {
      case 0: // Current slide (front center)
        return {
          zIndex: 30,
          x: 0,
          scale: 1,
          opacity: 1,
          rotateY: 0,
        }
      case 1: // Next slide (right back)
        return {
          zIndex: 20,
          x: "40%",
          scale: 0.85,
          opacity: 0.9,
          rotateY: 15,
        }
      default: // Previous slide (left back)
        return {
          zIndex: 20,
          x: "-40%",
          scale: 0.85,
          opacity: 0.8,
          rotateY: -15,
        }
    }
  }

  return (
    <section className="relative py-32 overflow-hidden">
      {/* Animated background shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]">
          <motion.div
            className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-orange-500"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0.3, 0.5],
            }}
            transition={{
              duration: 8,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-yellow-500"
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          />
        </div>
        <div className="absolute inset-0 backdrop-blur-[100px]" />
      </div>

      <div className="container mx-auto px-4 relative">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
          {/* Left Text */}
          <motion.div
            className="lg:w-1/4 text-center lg:text-left"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl lg:text-5xl font-normal leading-tight text-gray-900 dark:text-white mb-6">
              Power at Your Control
            </h2>
          </motion.div>

          {/* 3D Phone Carousel */}
          <motion.div
            className="relative w-full lg:w-1/2 h-[700px] lg:h-[900px] perspective-[1200px]"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <div className="relative w-full h-full flex items-center justify-center preserve-3d">
              {/* Render all three phones */}
              {slides.map((slide, index) => (
                <motion.div
                  key={slide.id}
                  className="absolute w-[280px] h-[560px] lg:w-[350px] lg:h-[700px] transform-style-3d"
                  initial={getPhonePosition(index)}
                  animate={getPhonePosition(index)}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                    duration: 0.5,
                  }}
                  style={{
                    transformStyle: "preserve-3d",
                    transformOrigin: "center center",
                  }}
                >
                  <div className="relative w-full h-full drop-shadow-xl">
                    <Image
                      src={slide.image || "/placeholder.svg"}
                      alt={`Solar app screen ${slide.id}`}
                      fill
                      className="object-contain rounded-3xl"
                      priority
                    />
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Navigation Controls */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-6 z-50">
              {/* Dot indicators */}
              <div className="flex gap-4 mb-4">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setDirection(index > currentSlide ? 1 : -1)
                      setCurrentSlide(index)
                    }}
                    className="w-3 h-3 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                  >
                    <motion.div
                      className="w-full h-full rounded-full"
                      initial={false}
                      animate={{
                        backgroundColor: currentSlide === index ? "#f97316" : "#9ca3af",
                      }}
                      transition={{ duration: 0.3 }}
                    />
                  </button>
                ))}
              </div>

              {/* Arrow buttons */}
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={prevSlide}
                  className="w-12 h-12 rounded-full bg-white hover:bg-orange-100 dark:bg-gray-800 dark:hover:bg-gray-700 border-2 border-orange-500 text-orange-500 hover:text-orange-600 transition-colors duration-300"
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={nextSlide}
                  className="w-12 h-12 rounded-full bg-white hover:bg-orange-100 dark:bg-gray-800 dark:hover:bg-gray-700 border-2 border-orange-500 text-orange-500 hover:text-orange-600 transition-colors duration-300"
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Right Text */}
          <motion.div
            className="lg:w-1/4 text-center lg:text-left"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            viewport={{ once: true }}
          >
            <AnimatePresence mode="wait">
              <motion.p
                key={currentSlide}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="text-xl lg:text-2xl text-gray-600 dark:text-gray-300 leading-relaxed"
              >
                {slides[currentSlide].description}
              </motion.p>
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

