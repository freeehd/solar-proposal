"use client"

import { motion, useInView, AnimatePresence } from "framer-motion"
import { StarAnimation } from "./star-animation"
import { useRef, useState, useEffect } from "react"
import { ChevronRight } from 'lucide-react'

interface ReasonItemProps {
  reason: {
    text: string
    description: string
  }
  index: number
  previousCompleted: boolean
  hasCompleted: boolean
  onStarComplete: () => void
  prefersReducedMotion?: boolean
}

export function ReasonItem({
  reason,
  index,
  previousCompleted,
  hasCompleted,
  onStarComplete,
  prefersReducedMotion = false,
}: ReasonItemProps) {
  const itemRef = useRef(null)
  const isInView = useInView(itemRef, { once: true, amount: 0.3 })
  const [shouldAnimate, setShouldAnimate] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const animationStartedRef = useRef(false)

  // Start animation ONLY when previousCompleted becomes true AND item is in view
  useEffect(() => {
    if (previousCompleted && isInView && !shouldAnimate) {
      animationStartedRef.current = true
      
      // Short delay before starting animation
      const timer = setTimeout(() => {
        setShouldAnimate(true)
      }, 300)

      return () => clearTimeout(timer)
    }
  }, [previousCompleted, shouldAnimate, isInView])

  // Determine if content should be visible
  const isContentVisible = prefersReducedMotion || hasCompleted

  return (
    <motion.li
      ref={itemRef}
      className="flex items-start gap-4 md:gap-6 group relative"
      initial={{ opacity: 0, y: 40 }}
      animate={{
        opacity: shouldAnimate && previousCompleted ? 1 : 0,
        y: shouldAnimate && previousCompleted ? 0 : 40,
      }}
      transition={{
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Smaller star container */}
      <div className="relative flex-shrink-0 w-[70px] h-[70px] flex items-center justify-center premium-icon-wrapper">
        {/* Background glow effect */}
        <AnimatePresence>
          {isHovered && isContentVisible && (
            <motion.div
              className="absolute inset-0 rounded-full bg-gradient-to-r from-sky-600/10 to-blue-600/10 dark:from-sky-400/10 dark:to-blue-400/10"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
            />
          )}
        </AnimatePresence>

        {/* Star animation - only render when shouldAnimate is true */}
        {shouldAnimate && previousCompleted && (
          <StarAnimation
            delay={0}
            onAnimationComplete={onStarComplete}
            key={`star-${index}-${previousCompleted}`}
            inView={true} // Always consider it in view once animation starts
          />
        )}
      </div>

      {/* Enhanced content container */}
      <div className="flex-grow overflow-hidden">
        <motion.div
          className="relative py-4"
          initial={{ opacity: 0 }}
          animate={{
            opacity: isContentVisible ? 1 : 0,
          }}
          transition={{
            duration: 0.4,
            ease: "easeOut",
          }}
        >
          {/* Enhanced title with icon */}
          <div className="overflow-hidden">
            <motion.div
              className="flex items-center gap-2 mb-2 text-lg md:text-xl font-medium text-foreground"
              initial={{ y: 15, opacity: 0 }}
              animate={{
                y: hasCompleted ? 0 : 15,
                opacity: hasCompleted ? 1 : 0,
              }}
              transition={{
                duration: 0.4,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <motion.span
                animate={{
                  x: isHovered && isContentVisible ? 4 : 0,
                  color: isHovered && isContentVisible ? "var(--sky-600)" : "currentColor",
                }}
                transition={{ duration: 0.2 }}
                className="dark:text-sky-400"
              >
                <ChevronRight size={18} className="text-sky-600/70 dark:text-sky-400/70" aria-hidden="true" />
              </motion.span>
              <span>{reason.text}</span>
            </motion.div>
          </div>

          {/* Enhanced description with better typography */}
          <div className="overflow-hidden pl-6">
            <motion.p
              className="text-sm md:text-base text-muted-foreground font-light tracking-wide leading-relaxed"
              initial={{ y: 15, opacity: 0 }}
              animate={{
                y: hasCompleted ? 0 : 15,
                opacity: hasCompleted ? 1 : 0,
              }}
              transition={{
                duration: 0.4,
                delay: 0.05,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              {reason.description}
            </motion.p>
          </div>

          {/* Enhanced divider with gradient and animation */}
          <motion.div
            className="absolute bottom-0 left-0 h-[1px] w-full origin-left"
            initial={{ scaleX: 0 }}
            animate={{
              scaleX: isContentVisible ? 1 : 0,
            }}
            transition={{
              duration: 0.8,
              delay: 0.2,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <div className="h-full bg-gradient-to-r from-sky-600/40 via-blue-600/30 to-transparent dark:from-sky-400/40 dark:via-blue-400/30 dark:to-transparent" />
          </motion.div>

          {/* Hover indicator */}
          <AnimatePresence>
            {isHovered && isContentVisible && (
              <motion.div
                className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-sky-600/40 to-blue-600/40 dark:from-sky-400/40 dark:to-blue-400/40 rounded-full"
                initial={{ scaleY: 0, opacity: 0 }}
                animate={{ scaleY: 1, opacity: 1 }}
                exit={{ scaleY: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
              />
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.li>
  )
}

