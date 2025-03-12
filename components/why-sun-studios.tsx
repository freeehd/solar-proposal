"use client"

import { motion, useInView, AnimatePresence, useScroll, useTransform } from "framer-motion"
import { useRef, useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { Card } from "@/components/ui/card"
import { ReasonItem } from "./ui/reason-item"
import { ImprovedTextReveal } from "./ui/text-reveal"
import { useMediaQuery } from "@/hooks/use-media-query"

const MetalicPaint = dynamic(() => import("@/components/ui/metallic"), {
  ssr: false,
})

// Data for reasons to choose Sun Studios
const reasons = [
  {
    text: "5 stars rating Better Business Bureau",
    description: " Accredited by the Better Business Bureau from our care and quality for our customers.",
  },
  {
    text: "5 stars rating Google",
    description: "Join thousands of satisfied customers who have rated us 5 stars on Google.",
  },
  {
    text: "5 stars rating Consumer Affairs",
    description: "Consistently rated 5 stars by Consumer Affairs for our exceptional service.",
  },
  {
    text: "5 stars rating Trust Pilot",
    description: "Providing top-quality solar solutions across 36 states nationwide.",
  },
  {
    text: "Only solar company that offers customer satisfaction guarantee",
    description: "We stand behind our work with an industry-leading customer satisfaction guarantee.",
  },
]

export default function WhySunStudiosImproved() {
  const [completedAnimations, setCompletedAnimations] = useState(new Set<number>())
  const containerRef = useRef(null)
  const sectionRef = useRef(null) // Separate ref for the entire section
  const titleRef = useRef(null)

  // Media queries for responsive design
  const isMobile = useMediaQuery("(max-width: 640px)")
  const isTablet = useMediaQuery("(min-width: 641px) and (max-width: 1024px)")

  // Use a more conservative threshold to ensure section is actually visible
  const isSectionInView = useInView(sectionRef, {
    once: true, // Only trigger once
    amount: 0.3, // Require 30% of the section to be visible
  })

  const isTitleInView = useInView(titleRef, { once: true, amount: 0.5 })
  const timersRef = useRef<NodeJS.Timeout[]>([])
  const hasStartedAnimations = useRef(false)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  })

  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.95, 1, 1, 0.95])

  // Simple timer-based animation sequence - only starts when section is in view
  useEffect(() => {
    // Only start animations if section is in view and we haven't started them yet
    if (isSectionInView && !hasStartedAnimations.current) {
      hasStartedAnimations.current = true

      // Clear any existing timers
      timersRef.current.forEach((timer) => clearTimeout(timer))
      timersRef.current = []

      // Set up a timer for each animation with fixed delays
      reasons.forEach((_, index) => {
        // First item starts at 500ms, then each subsequent item at 1.5s intervals
        const delay = 500 + index * 1500

        const timer = setTimeout(() => {
          setCompletedAnimations((prev) => {
            const newSet = new Set(prev)
            newSet.add(index)
            return newSet
          })
        }, delay)

        timersRef.current.push(timer)
      })
    }

    return () => {
      // Clean up timers on unmount
      timersRef.current.forEach((timer) => clearTimeout(timer))
    }
  }, [isSectionInView]) // Only depend on isSectionInView

  // This is just a callback for the star animation, but we don't rely on it for sequence progression
  const handleStarComplete = (index: number) => {
    setCompletedAnimations((prev) => {
      const newSet = new Set(prev)
      newSet.add(index)
      return newSet
    })
  }

  return (
    <section ref={sectionRef} className="relative min-h-screen py-16 sm:py-20 md:py-32 overflow-hidden bg-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(194,202,220,0.3),rgba(255,255,255,0))]" />

      <motion.div className="container mx-auto px-4 relative z-10" style={{ opacity, scale }}>
        <Card className="p-5 sm:p-8 md:p-12 mb-8 md:mb-12 bg-white/90 backdrop-blur-sm border-[#125170]/10 shadow-xl">
          <div className="flex flex-col lg:flex-row items-start justify-between max-w-full mx-auto">
            {/* Left column with heading and description - full width on mobile, half on desktop */}
            <div className="w-full lg:w-1/2 mb-10 sm:mb-12 lg:mb-0 pr-0 lg:pr-10">
              <div className={`mb-6 sm:mb-8 md:mb-12 max-w-4xl ${!isMobile ? "sticky top-32" : ""}`} ref={titleRef}>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}>
                  <div className="mb-2 sm:mb-4">
                    <motion.h2
                      className="text-3xl sm:text-4xl md:text-5xl lg:text-[82px] font-medium tracking-normal text-[#0b0a08] leading-tight md:leading-loose"
                      initial={{ opacity: 0, y: 20 }}
                      animate={isTitleInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                      transition={{ duration: 0.6, delay: 0.2 }}
                    >
                      <span className="block text-[#0b0a08]">
                        <ImprovedTextReveal text="Why Choose" delay={0.3} staggerChildren={0.03} />
                      </span>
                      <div className="-mt-0 sm:mt-4 md:-mt-6 lg:-mt-8 ml-0 sm:ml-1 md:ml-2">
                        <MetalicPaint />
                      </div>
                    </motion.h2>
                  </div>

                  <motion.div
                    className="overflow-hidden rounded-lg"
                    initial={{ opacity: 0, y: 30 }}
                    animate={isTitleInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                    transition={{ duration: 0.7, delay: 0.6 }}
                  >
                    <div className="text-base sm:text-lg md:text-xl lg:text-2xl leading-relaxed text-[#0b0a08]/80 font-light tracking-wide mt-4 sm:mt-6 md:mt-8">
                      <ImprovedTextReveal
                        text="Sun Studios is a leading provider of solar energy solutions, committed to powering a sustainable future. With our innovative technology and expert team, we're transforming how homes and businesses harness the sun's energy."
                        delay={0.8}
                        staggerChildren={0.01}
                      />
                    </div>
                  </motion.div>
                </motion.div>
              </div>
            </div>

            {/* Right column with reasons list - full width on mobile, half on desktop */}
            <div className="w-full lg:w-1/2 pl-0 lg:pl-2" ref={containerRef}>
              {/* Only render the list when section is in view */}
              {isSectionInView && (
                <ul className="space-y-4 sm:space-y-6">
                  <AnimatePresence>
                    {reasons.map((reason, index) => {
                      // Simple logic: an item can animate if it's the first one or the previous one is completed
                      const previousCompleted = index === 0 || completedAnimations.has(index - 1)
                      const hasCompleted = completedAnimations.has(index)

                      return (
                        <ReasonItem
                          key={index}
                          reason={reason}
                          index={index}
                          previousCompleted={previousCompleted}
                          hasCompleted={hasCompleted}
                          onStarComplete={() => handleStarComplete(index)}
                        />
                      )
                    })}
                  </AnimatePresence>
                </ul>
              )}
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Enhanced subtle background gradient - responsive size */}
      <div className="absolute top-0 right-0 w-full h-full overflow-hidden -z-10 opacity-40 pointer-events-none">
        <motion.div
          className="absolute top-[5%] right-[5%] w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] md:w-[800px] md:h-[800px] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(107,114,34,0.15) 0%, rgba(107,114,34,0) 70%)",
            filter: "blur(50px) sm:blur(75px) md:blur(100px)",
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{
            duration: 8,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
          }}
        />
      </div>
    </section>
  )
}

