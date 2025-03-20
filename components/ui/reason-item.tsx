"use client"

import { memo, useRef, useState, useEffect, useMemo, useCallback } from "react"
import { motion, useInView, AnimatePresence } from "framer-motion"
import { ChevronRight } from "lucide-react"
import { StarAnimation } from "./star-animation"

interface Reason {
  text: string
  description: string
}

interface ReasonItemProps {
  reason: Reason
  index: number
  previousCompleted: boolean
  hasCompleted: boolean
  onStarComplete: () => void
  prefersReducedMotion?: boolean
}

// Define animation variants outside component to prevent recreation
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
}

const textVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
}

const chevronVariants = {
  hidden: { scale: 0.5 },
  visible: {
    scale: [0.5, 1.3, 1],
    transition: { duration: 0.4, times: [0, 0.6, 1] },
  },
}

// New drop animation for the star wrapper
const dropVariants = {
  hidden: { y: -50, opacity: 0 },
  visible: {
    y: [null, 5],
    opacity: 1,
    transition: {
      y: {
        type: "spring",
        stiffness: 300,
        damping: 15,
        mass: 1.2,
        times: [0, 0.7, 1],
      },
      opacity: { duration: 0.2 },
      duration: 0.6,
    },
  },
}

export const ReasonItem = memo(function ReasonItem({
  reason,
  index,
  previousCompleted,
  hasCompleted,
  onStarComplete,
  prefersReducedMotion = false,
}: ReasonItemProps) {
  const itemRef = useRef<HTMLLIElement>(null)

  // Use InView with higher threshold to reduce unnecessary renders
  const isInView = useInView(itemRef, {
    once: true,
    amount: 0.3,
    margin: "0px 0px 100px 0px",
  })

  const [isHovered, setIsHovered] = useState(false)
  const [shouldAnimate, setShouldAnimate] = useState(false)

  // Memoize event handlers
  const handleMouseEnter = useCallback(() => setIsHovered(true), [])
  const handleMouseLeave = useCallback(() => setIsHovered(false), [])

  // Optimize effect to run only when dependencies change
  useEffect(() => {
    if (!previousCompleted || !isInView || shouldAnimate) return

    const timer = setTimeout(() => {
      setShouldAnimate(true)
    }, 150)

    return () => clearTimeout(timer)
  }, [previousCompleted, isInView, shouldAnimate])

  // Compute derived state once per render
  const shouldShowAnimation = shouldAnimate && previousCompleted
  const isContentVisible = prefersReducedMotion || hasCompleted

  // Memoize animation state to prevent recalculation
  const animationState = useMemo(
    () => ({
      container: shouldShowAnimation ? "visible" : "hidden",
      content: hasCompleted ? "visible" : "hidden",
    }),
    [shouldShowAnimation, hasCompleted],
  )

  // Memoize star animation completion handler
  const handleStarComplete = useCallback(() => {
    // Small delay before triggering the completion callback
    setTimeout(onStarComplete, 100)
  }, [onStarComplete])

  return (
    <motion.li
      ref={itemRef}
      className="flex items-start gap-4 md:gap-6 group relative"
      style={{ willChange: "opacity, transform" }}
      variants={containerVariants}
      initial="hidden"
      animate={animationState.container}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      data-state={hasCompleted ? "completed" : "pending"}
      aria-busy={!hasCompleted}
    >
      <div
        className="relative flex-shrink-0 w-[100px] h-[100px] flex items-center justify-center premium-icon-wrapper overflow-hidden"
        style={{
          willChange: "transform",
          transform: "translateZ(0)",
          backfaceVisibility: "hidden",
        }}
      >
        {shouldShowAnimation && (
          <motion.div
            className="w-full h-full"
            variants={dropVariants}
            initial="hidden"
            animate="visible"
            onAnimationComplete={handleStarComplete}
          >
            <StarAnimation delay={0} onAnimationComplete={() => {}} inView={true} />
          </motion.div>
        )}
      </div>

      <div className="flex-grow overflow-hidden">
        <div className="relative py-2">
          <div className="overflow-hidden relative mb-1">
            <motion.div
              className="flex items-center gap-2 text-lg md:text-xl font-medium text-foreground relative z-0"
              variants={textVariants}
              initial="hidden"
              animate={animationState.content}
              transition={{
                delay: 0.1,
              }}
            >
              <motion.span
                variants={chevronVariants}
                initial="hidden"
                animate={animationState.content}
                transition={{
                  delay: 0.15,
                }}
                className="text-primary"
                style={{ willChange: "transform" }}
              >
                <ChevronRight size={18} className="text-black" aria-hidden="true" />
              </motion.span>
              <span className="text-foreground/90 font-semibold">{reason.text}</span>
            </motion.div>
          </div>

          <div className="overflow-hidden pl-6 relative">
            <motion.p
              className="text-sm md:text-base text-muted-foreground font-light tracking-wide leading-relaxed relative z-0"
              variants={textVariants}
              initial="hidden"
              animate={animationState.content}
              transition={{
                delay: 0.15,
              }}
            >
              {reason.description}
            </motion.p>
          </div>

          <AnimatePresence>
            {isHovered && isContentVisible && (
              <motion.div
                className="absolute bottom-0 left-0 h-[1px] w-full origin-left"
                style={{ willChange: "transform, opacity" }}
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: 1, opacity: 1 }}
                exit={{ scaleX: 0, opacity: 0, transition: { duration: 0.2 } }}
                transition={{
                  duration: 0.3,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <div className="h-full bg-gradient-to-r from-gray-500/80 via-gray-500/60 to-transparent dark:to-transparent" />
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {isHovered && isContentVisible && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-gray-500/5 to-transparent dark:from-sky-400/8 dark:to-transparent pointer-events-none rounded-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.li>
  )
})

