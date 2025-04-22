"use client"

import { motion, useInView } from "framer-motion"
import { useRef, useState, useEffect, useMemo, useCallback, memo } from "react"
import dynamic from "next/dynamic"

import { Card } from "@/components/ui/card"
import { ReasonItem } from "./ui/reason-item"
import { useMediaQuery } from "@/hooks/use-media-query"
import { useReducedMotion } from "framer-motion"
const MetalicPaint = dynamic(() => import("@/components/ui/metallic"), {
  ssr: false,
})

// Update the reasons array with more premium descriptions
const reasons = [
  {
    text: "5 Stars Rating Google",
    description: "Join the ever-growing list of satisfied customers who have rated us 5 Stars on Google.",
  },
  {
    text: "5 Stars Rating Trust Pilot",
    description: "Providing top-quality solar solutions across 36 states nationwide.",
  },
 

  {
    text: "5 Stars Rating Consumer Affairs",
    description: "Consistently rated 5 Stars by Consumer Affairs for our exceptional service.",
  },
  {
    text: "5 Stars Rating Yelp",
    description: "Accredited by the Better Business Bureau from our care and quality for our customers.",
  },
  {
    text: "Only solar company that offers customer satisfaction guarantee",
    description: "If you are not happy with our customer service or solar results we guarantee to pay your first 6 months.",
  },
]


// Refined animation variants for smoother transitions
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5, ease: "easeOut" } },
}

const titleVariants = {
  hidden: { opacity: 0, transform: "translate3d(0, 20px, 0)" },
  visible: {
    opacity: 1,
    transform: "translate3d(0, 0, 0)",
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1], // Custom cubic-bezier for Apple-like smooth animation
    },
  },
}

const staggerContainerVariants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
}

// Keep the memoized components

// Update the TextContent component for more premium typography
const TextContent = memo(({ variants }: { variants: any }) => (
  <motion.div
    className="overflow-hidden"
    variants={variants}
    style={{
      willChange: "opacity, transform",
      transform: "translateZ(0)",
    }}
  >
    <div className="text-base sm:text-lg md:text-xl lg:text-2xl leading-relaxed text-foreground/90 font-light tracking-wide mt-0 sm:mt-0 md:mt-2">
     The leading provider of   Solar Energy Solutions, committed to powering a sustainable future. With our innovative technology and expert team, we're transforming how homes and businesses harness the sun's energy.

    </div>
  </motion.div>
))

// Update the background gradient for a more premium look
const BackgroundGradient = memo(() => <div className="absolute inset-0 premium-radial" />)

// Update the animated background for more dramatic lighting
const AnimatedBackground = memo(({ animation, transition }: { animation: any; transition: any }) => (
  <div className="absolute top-0 right-0 w-full h-full overflow-hidden -z-10 opacity-70 pointer-events-none">
    <motion.div
      className="absolute top-[5%] right-[5%] w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] md:w-[800px] md:h-[800px] rounded-full"
      style={{
        background: "radial-gradient(circle, hsl(var(--primary)/0.3) 0%, hsl(var(--primary)/0) 70%)",
        willChange: "transform, opacity",
        transform: "translateZ(0)",
        filter: "blur(40px)",
      }}
      animate={animation}
      transition={transition}
      layout={false}
    />
  </div>
))

// Update the main component with premium styling
export default function WhySunStudios() {
  const [completedAnimations, setCompletedAnimations] = useState(new Set<number>())
  const sectionRef = useRef(null)
  const titleRef = useRef(null)
  const [isClient, setIsClient] = useState(false)
  const prefersReducedMotion = useReducedMotion()

  // Use media queries for responsive design
  const isMobile = useMediaQuery("(max-width: 640px)")

  // Ensure hydration issues don't cause problems
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Use InView with higher threshold and lazy loading approach
  const isSectionInView = useInView(sectionRef, {
    once: false,
    amount: 0.05,
    margin: "300px 0px",
  })

  const isTitleInView = useInView(titleRef, {
    once: true,
    amount: 0.3,
    margin: "50px 0px",
  })

  // Immediate visibility on first render
  const [initialRender] = useState(true)

  // Handle star animation completion - memoized to prevent recreating on each render
  const handleStarComplete = useCallback((index: number) => {
    setCompletedAnimations((prev) => {
      // Use functional update pattern for better performance
      const newSet = new Set(prev)
      newSet.add(index)
      return newSet
    })
  }, [])

  // Memoize the reasons list to prevent unnecessary re-renders
  const reasonsList = useMemo(() => {
    if (!isClient) return null

    const allReasons = (
      <ul className="space-y-6 sm:space-y-8">
        {reasons.map((reason, index) => (
          <ReasonItem
            key={index}
            reason={reason}
            index={index}
            previousCompleted={prefersReducedMotion || index === 0 || completedAnimations.has(index - 1)}
            onStarComplete={() => handleStarComplete(index)}
          />
        ))}
      </ul>
    )

    return allReasons
  }, [isClient, completedAnimations, handleStarComplete, prefersReducedMotion])

  // Memoize animations for better performance
  const backgroundAnimation = useMemo(
    () => (prefersReducedMotion ? { scale: 1, opacity: 0.3 } : { scale: [1, 1.1, 1], opacity: [0.3, 0.4, 0.3] }),
    [prefersReducedMotion],
  )

  const backgroundTransition = useMemo(
    () => ({
      duration: prefersReducedMotion ? 0 : 12,
      repeat: prefersReducedMotion ? 0 : Number.POSITIVE_INFINITY,
      repeatType: "reverse" as const,
      ease: "easeInOut",
    }),
    [prefersReducedMotion],
  )

  // Include initialRender to ensure content is always visible during first load
  const shouldRenderContent = isClient && (initialRender || isSectionInView || isTitleInView)

  // If reduced motion is preferred, use simpler animations
  const animationVariants = useMemo(() => {
    if (prefersReducedMotion) {
      return {
        container: {
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { duration: 0.2 } },
        },
        title: {
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { duration: 0.2 } },
        },
        staggerContainer: {
          hidden: { opacity: 1 },
          visible: { opacity: 1 },
        },
      }
    }

    return {
      container: containerVariants,
      title: titleVariants,
      staggerContainer: staggerContainerVariants,
    }
  }, [prefersReducedMotion])

  // Performance optimization - skip animation if not in view
  if (!shouldRenderContent) {
    return <section ref={sectionRef} className="relative min-h-screen pearlescent-bg" />
  }

  return (
    <section ref={sectionRef} className="relative min-h-screen py-16 sm:py-20 md:py-32 overflow-hidden ">
      <BackgroundGradient />

      <motion.div
        className="container mx-auto px-4 relative z-10"
        variants={animationVariants.container}
        initial="hidden"
        animate="visible"
        layout={false}
      >
        <Card className="p-6 sm:p-10 md:p-14 mb-8 md:mb-12 pearlescent-card premium-blur border border-primary/10 premium-shadow rounded-2xl">
          <div className="flex flex-col lg:flex-row items-start justify-between max-w-full mx-auto">
            <div className="w-full lg:w-1/2 mb-10 sm:mb-12 lg:mb-0 pr-0 lg:pr-10">
              <div
                className={`mb-6 sm:mb-8 md:mb-12 max-w-4xl ${!isMobile && isClient ? "sticky top-32" : ""}`}
                ref={titleRef}
              >
                <motion.div
                  variants={animationVariants.staggerContainer}
                  initial="hidden"
                  animate="visible"
                  className="relative"
                  style={{ willChange: "transform" }}
                  layout={false}
                >
                  <div className="mb-2 sm:mb-4">
                    <motion.h2
                      className="premium-heading"
                      variants={animationVariants.title}
                      style={{
                        willChange: "opacity, transform",
                        transform: "translateZ(0)",
                      }}
                      layout={false}
                    >
                      <div className="-mt-5 mx-auto sm:mt-4 flex justify-center">
                        <motion.div
                          variants={animationVariants.title}
                          className="w-full max-w-[400px] h-auto "
                          style={{ willChange: "opacity, transform" }}
                          layout={false}
                        >
                          <MetalicPaint />
                        </motion.div>
                      </div>
                    </motion.h2>
                  </div>

                  <TextContent variants={animationVariants.title} />
                </motion.div>
              </div>
            </div>

            <div className="w-full lg:w-1/2 pl-0 lg:pl-6">{reasonsList}</div>
          </div>
        </Card>
      </motion.div>

      <AnimatedBackground animation={backgroundAnimation} transition={backgroundTransition} />
    </section>
  )
}
