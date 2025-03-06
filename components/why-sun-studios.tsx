"use client"

import { motion, useInView, AnimatePresence, useScroll, useTransform } from "framer-motion"
import { useRef, useState } from "react"
import dynamic from "next/dynamic"
import { Card } from "@/components/ui/card"
import { ThemeToggle } from "./theme-toggle"
import { ReasonItem } from "./ui/reason-item"

const MetalicPaint = dynamic(() => import("@/components/ui/metallic"), {
  ssr: false,
})

// Improved text reveal component with better animation
const ImprovedTextReveal = ({ text, className = "", delay = 0, staggerChildren = 0.02 }: { text: string, className?: string, delay?: number, staggerChildren?: number }) => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.5 })

  const words = text.split(" ")

  const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren, delayChildren: delay },
    }),
  }

  const child = {
    hidden: {
      opacity: 0,
      y: 20,
      filter: "blur(4px)",
    },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
      },
    },
  }

  return (
    <motion.div
      ref={ref}
      className={`inline-block ${className}`}
      variants={container}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
    >
      {words.map((word, index) => (
        <motion.span key={index} className="inline-block mr-[0.25em] whitespace-nowrap" variants={child}>
          {word}
        </motion.span>
      ))}
    </motion.div>
  )
}

// Data for reasons to choose Sun Studios
const reasons = [
  {
    text: "5 star rating on Google",
    description: "Join thousands of satisfied customers who have rated us 5 stars on Google.",
  },
  {
    text: "Accredited by Better Business Bureau",
    description: "Our commitment to excellence has earned us accreditation from the Better Business Bureau.",
  },
 
  {
    text: "5 star rating on Consumer Affairs",
    description: "Consistently rated 5 stars by Consumer Affairs for our exceptional service.",
  },
  {
    text: "The best solar in 36 states",
    description: "Providing top-quality solar solutions across 36 states nationwide.",
  },
  {
    text: "Only solar company that offers customer satisfaction guarantee",
    description: "We stand behind our work with an industry-leading customer satisfaction guarantee.",
  },
]

export default function WhySunStudiosImproved() {
  const [completedAnimations, setCompletedAnimations] = useState(new Set())
  const containerRef = useRef(null)
  const titleRef = useRef(null)
  const isInView = useInView(containerRef, { once: true, margin: "-100px" })
  const isTitleInView = useInView(titleRef, { once: true, amount: 0.5 })

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  })

  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.95, 1, 1, 0.95])

  const handleStarComplete = (index: number) => {
    setCompletedAnimations((prev) => {
      const newSet = new Set(prev)
      newSet.add(index)
      return newSet
    })
  }

  return (
    <section className="relative min-h-screen py-32 overflow-hidden bg-gradient-to-b from-background to-background/80">
      {/* Theme toggle in the top right corner */}
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.8),rgba(255,255,255,0))] dark:bg-[radial-gradient(circle_at_50%_50%,rgba(25,25,25,0.8),rgba(25,25,25,0))]" />

      <motion.div className="container mx-auto px-4 relative z-10" style={{ opacity, scale }}>
        <Card className="p-8 md:p-12 mb-12 bg-card/50 backdrop-blur-sm border-primary/10 shadow-xl">
          <div className="flex flex-col md:flex-row items-start justify-between max-w-full mx-auto">
            {/* Left column with heading and description */}
            <div className="md:w-1/2 lg:w-full mb-16 md:mb-0 pr-0 md:pr-10">
              <div className="mb-12 max-w-4xl sticky top-32" ref={titleRef}>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}>
                  <div className="mb-4">
                    <motion.h2
                      className="text-4xl md:text-6xl font-medium tracking-tight text-foreground leading-[1.1]"
                      initial={{ opacity: 0, y: 20 }}
                      animate={isTitleInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                      transition={{ duration: 0.6, delay: 0.2 }}
                    >
                      <span className="block text-gray-800 dark:text-gray-200">
                        <ImprovedTextReveal text="Why Choose" delay={0.3} staggerChildren={0.03} />
                      </span>
                      <div className="mt-2">
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
                    <div className="text-xl md:text-2xl leading-relaxed text-muted-foreground font-light tracking-wide mt-8">
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

            {/* Right column with reasons list */}
            <div className="lg:w-full pl-0 md:pl-2" ref={containerRef}>
              <ul className="space-y-6">
                <AnimatePresence>
                  {reasons.map((reason, index) => {
                    const previousCompleted = index === 0 || completedAnimations.has(index - 1)
                    const shouldAnimate = isInView && previousCompleted
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
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Enhanced subtle background gradient */}
      <div className="absolute top-0 right-0 w-full h-full overflow-hidden -z-10 opacity-40 pointer-events-none">
        <motion.div
          className="absolute top-[5%] right-[5%] w-[800px] h-[800px] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(255,184,0,0.08) 0%, rgba(255,184,0,0) 70%)",
            filter: "blur(100px)",
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

