"use client"

import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useMediaQuery } from "@/hooks/use-media-query"

const slides = [
  {
    id: 1,
    image: "/app/1.png",
    description: "Use analyze features to better understand the home's consumption trends.",
  },
  {
    id: 2,
    image: "/app/2.png",
    description: "Tap to see more details about the home's consumption trends.",
  },
  {
    id: 3,
    image: "/app/3.png",
    description:
      "Monitor your home solar, storage and electricity use from virtually anywhere with the Tesla Monitoring app.",
  },
]

export default function AppSection() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [direction, setDirection] = useState(0) // -1 for left, 1 for right

  // Responsive breakpoints
  const isMobile = useMediaQuery("(max-width: 640px)")
  const isTablet = useMediaQuery("(min-width: 641px) and (max-width: 1024px)")
  const isLandscape = useMediaQuery("(orientation: landscape) and (max-height: 500px)")

  const nextSlide = () => {
    setDirection(1)
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  const prevSlide = () => {
    setDirection(-1)
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  // Calculate positions for all three phones - adjusted for different screen sizes
  const getPhonePosition = (index: number) => {
    // Calculate the relative index (position relative to current slide)
    const relativeIndex = (index - currentSlide + slides.length) % slides.length

    // Different positioning for mobile vs tablet/desktop
    if (isMobile) {
      // Simplified positioning for mobile - more flat, less 3D
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
            x: "55%", // Move further off-screen on mobile
            scale: 0.7,
            opacity: 0.7,
            rotateY: 10, // Less rotation on mobile
          }
        default: // Previous slide (left back)
          return {
            zIndex: 20,
            x: "-55%", // Move further off-screen on mobile
            scale: 0.7,
            opacity: 0.7,
            rotateY: -10, // Less rotation on mobile
          }
      }
    } else if (isTablet) {
      // Tablet positioning - moderate 3D effect
      switch (relativeIndex) {
        case 0:
          return {
            zIndex: 30,
            x: 0,
            scale: 1,
            opacity: 1,
            rotateY: 0,
          }
        case 1:
          return {
            zIndex: 20,
            x: "50%",
            scale: 0.8,
            opacity: 0.8,
            rotateY: 12,
          }
        default:
          return {
            zIndex: 20,
            x: "-50%",
            scale: 0.8,
            opacity: 0.8,
            rotateY: -12,
          }
      }
    } else {
      // Desktop positioning - full 3D effect
      switch (relativeIndex) {
        case 0:
          return {
            zIndex: 30,
            x: 0,
            scale: 1,
            opacity: 1,
            rotateY: 0,
          }
        case 1:
          return {
            zIndex: 20,
            x: "40%",
            scale: 0.85,
            opacity: 0.9,
            rotateY: 15,
          }
        default:
          return {
            zIndex: 20,
            x: "-40%",
            scale: 0.85,
            opacity: 0.8,
            rotateY: -15,
          }
      }
    }
  }

  // Calculate phone dimensions based on screen size
  const getPhoneDimensions = () => {
    if (isMobile) {
      return isLandscape
        ? "w-[140px] h-[280px]" // Landscape mobile
        : "w-[180px] h-[360px]" // Portrait mobile
    } else if (isTablet) {
      return isLandscape
        ? "w-[200px] h-[400px]" // Landscape tablet
        : "w-[240px] h-[480px]" // Portrait tablet
    } else {
      return "w-[280px] h-[560px] lg:w-[350px] lg:h-[700px]" // Desktop
    }
  }

  // Calculate carousel height based on screen size
  const getCarouselHeight = () => {
    if (isMobile) {
      return isLandscape ? "h-[320px]" : "h-[450px]"
    } else if (isTablet) {
      return isLandscape ? "h-[450px]" : "h-[600px]"
    } else {
      return "h-[700px] lg:h-[900px]"
    }
  }

  return (
    <section className="relative py-16 md:py-24 lg:py-32 overflow-hidden bg-white">
      {/* Animated background shapes - scaled appropriately for mobile */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]">
          <motion.div
            className={`absolute top-1/4 left-1/4 ${
              isMobile ? "w-48 h-48" : isTablet ? "w-64 h-64" : "w-96 h-96"
            } rounded-full bg-olive-500`}
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
            className={`absolute bottom-1/4 right-1/4 ${
              isMobile ? "w-48 h-48" : isTablet ? "w-64 h-64" : "w-96 h-96"
            } rounded-full bg-indigo-dye-300`}
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
        {/* Responsive layout - stack on mobile, side-by-side on larger screens */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 md:gap-8 lg:gap-12">
          {/* Left Text - Full width on mobile, 1/4 on desktop */}
          <motion.div
            className="w-full lg:w-1/4 text-center lg:text-left mb-6 lg:mb-0"
            initial={{ opacity: 0, x: isMobile ? 0 : -50, y: isMobile ? -30 : 0 }}
            whileInView={{ opacity: 1, x: 0, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2
              className={`${
                isMobile ? "text-3xl" : isTablet ? "text-4xl" : "text-4xl lg:text-5xl"
              } font-normal leading-tight text-smoky-black mb-4 md:mb-6`}
            >
              Power at Your Control
            </h2>

            {/* Show description on mobile under the heading */}
            {isMobile && (
              <AnimatePresence mode="wait">
                <motion.p
                  key={currentSlide}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.5 }}
                  className="text-base md:text-lg text-smoky-black/70 leading-relaxed"
                >
                  {slides[currentSlide].description}
                </motion.p>
              </AnimatePresence>
            )}
          </motion.div>

          {/* 3D Phone Carousel - Responsive height and width */}
          <motion.div
            className={`relative w-full lg:w-1/2 ${getCarouselHeight()} perspective-[1200px]`}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <div className="relative w-full h-full flex items-center justify-center preserve-3d">
              {/* Render all three phones with responsive sizing */}
              {slides.map((slide, index) => (
                <motion.div
                  key={slide.id}
                  className={`absolute ${getPhoneDimensions()} transform-style-3d`}
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

            {/* Navigation Controls - Smaller on mobile */}
            <div className="absolute bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 md:gap-6 z-50">
              {/* Dot indicators */}
              <div className="flex gap-3 md:gap-4 mb-3 md:mb-4">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setDirection(index > currentSlide ? 1 : -1)
                      setCurrentSlide(index)
                    }}
                    className={`${
                      isMobile ? "w-2 h-2" : "w-3 h-3"
                    } rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-olive-500 focus:ring-offset-2`}
                    aria-label={`Go to slide ${index + 1}`}
                  >
                    <motion.div
                      className="w-full h-full rounded-full"
                      initial={false}
                      animate={{
                        backgroundColor: currentSlide === index ? "#6b7222" : "#c2cadc",
                      }}
                      transition={{ duration: 0.3 }}
                    />
                  </button>
                ))}
              </div>

              {/* Arrow buttons - Smaller on mobile */}
              <div className="flex gap-3 md:gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={prevSlide}
                  className={`${
                    isMobile ? "w-8 h-8" : isTablet ? "w-10 h-10" : "w-12 h-12"
                  } rounded-full bg-white hover:bg-french-gray-100 border-2 border-indigo-dye-500 text-indigo-dye-500 hover:text-indigo-dye-600 transition-colors duration-300`}
                  aria-label="Previous slide"
                >
                  <ChevronLeft className={isMobile ? "h-4 w-4" : "h-6 w-6"} />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={nextSlide}
                  className={`${
                    isMobile ? "w-8 h-8" : isTablet ? "w-10 h-10" : "w-12 h-12"
                  } rounded-full bg-white hover:bg-french-gray-100 border-2 border-indigo-dye-500 text-indigo-dye-500 hover:text-indigo-dye-600 transition-colors duration-300`}
                  aria-label="Next slide"
                >
                  <ChevronRight className={isMobile ? "h-4 w-4" : "h-6 w-6"} />
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Right Text - Only show on tablet and desktop */}
          {!isMobile && (
            <motion.div
              className="w-full lg:w-1/4 text-center lg:text-left"
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
                  className="text-lg md:text-xl lg:text-2xl text-smoky-black/70 leading-relaxed"
                >
                  {slides[currentSlide].description}
                </motion.p>
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  )
}

