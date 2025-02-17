"use client"

import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useState } from "react"
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

const variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 1000 : -1000,
    rotateY: direction > 0 ? 45 : -45,
    opacity: 0,
    scale: 0.8,
  }),
  center: {
    x: 0,
    rotateY: 0,
    opacity: 1,
    scale: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 1000 : -1000,
    rotateY: direction < 0 ? 45 : -45,
    opacity: 0,
    scale: 0.8,
  }),
}

export default function AppSection() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [direction, setDirection] = useState(0)

  const nextSlide = () => {
    setDirection(1)
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  const prevSlide = () => {
    setDirection(-1)
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  const goToSlide = (index: number) => {
    setDirection(index > currentSlide ? 1 : -1)
    setCurrentSlide(index)
  }

  return (
      <section className="relative py-32 overflow-hidden bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
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
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Text */}
            <motion.div
                className="lg:col-span-4"
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
            >
              <h2 className="text-5xl font-bold text-gray-900 dark:text-white leading-tight mb-6">
                Power at Your Control
              </h2>
            </motion.div>

            {/* Center Phones */}
            <motion.div
                className="lg:col-span-5 relative h-[600px] perspective"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
                style={{ perspective: "1000px" }}
            >
              <div className="relative w-full h-full">
                <AnimatePresence custom={direction} mode="popLayout">
                  <motion.div
                      key={currentSlide}
                      custom={direction}
                      variants={variants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 30,
                      }}
                      className="absolute inset-0"
                  >
                    {/* Phone Display */}
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[600px]">
                      <Image
                          src={slides[currentSlide].image || "/placeholder.svg"}
                          alt="Solar app screen"
                          fill
                          className="object-contain"
                          priority
                      />
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Navigation Controls */}
              <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 z-50">
                {/* Dot indicators */}
                <div className="flex gap-3 mb-4">
                  {slides.map((_, index) => (
                      <button
                          key={index}
                          onClick={() => goToSlide(index)}
                          className={`w-2 h-2 rounded-full transition-all duration-300 ${
                              currentSlide === index
                                  ? "w-8 bg-orange-500 shadow-lg shadow-orange-500/30"
                                  : "bg-gray-400 hover:bg-orange-300"
                          }`}
                      />
                  ))}
                </div>

                {/* Arrow buttons */}
                <div className="flex gap-4">
                  <Button
                      variant="outline"
                      size="icon"
                      onClick={prevSlide}
                      className="bg-white dark:bg-gray-800 shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-600"
                  >
                    <ChevronLeft className="h-4 w-4 text-gray-700 dark:text-gray-200" />
                  </Button>
                  <Button
                      variant="outline"
                      size="icon"
                      onClick={nextSlide}
                      className="bg-white dark:bg-gray-800 shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-600"
                  >
                    <ChevronRight className="h-4 w-4 text-gray-700 dark:text-gray-200" />
                  </Button>
                </div>
              </div>
            </motion.div>

            {/* Right Text */}
            <motion.div
                className="lg:col-span-3"
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
                    className="text-2xl text-gray-600 dark:text-gray-300 leading-relaxed"
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

