"use client"

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { motion, useInView } from "framer-motion"
import { StarAnimation } from "@/components/ui/star-animation"

interface ReasonItemProps {
  reason: {
    text: string
    description: string
  }
  index: number
  previousCompleted?: boolean
  onStarComplete?: () => void
}

export const ReasonItem = React.memo(function ReasonItem({
  reason,
  index,
  previousCompleted = true,
  onStarComplete,
}: ReasonItemProps) {
  const [hasAnimated, setHasAnimated] = useState(false)
  const [hasBeenInView, setHasBeenInView] = useState(false)
  const itemRef = useRef<HTMLLIElement>(null)
  const completionTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const hasCalledCompletionRef = useRef(false)

  // Use Framer Motion's useInView with once:true to only trigger once
  const isInView = useInView(itemRef, {
    once: true,
    amount: 0.3,
    margin: "100px 0px",
  })

  // When it comes into view, mark it - only once
  useEffect(() => {
    if (isInView && !hasBeenInView) {
      console.log(`ReasonItem ${index}: Has entered view for the first time`)
      setHasBeenInView(true)
    }
  }, [isInView, hasBeenInView, index])

  // Memoize the handler to prevent recreation on each render
  const handleStarComplete = useCallback(() => {
    if (!hasAnimated && !hasCalledCompletionRef.current) {
      console.log(`ReasonItem ${index}: Star animation completed`)
      setHasAnimated(true)
      hasCalledCompletionRef.current = true

      // Clear any pending timeout
      if (completionTimeoutRef.current) {
        clearTimeout(completionTimeoutRef.current)
        completionTimeoutRef.current = null
      }

      // Notify parent only once
      onStarComplete?.()
    }
  }, [hasAnimated, index, onStarComplete])

  // Force completion after a timeout if needed - with proper cleanup
  useEffect(() => {
    if (hasBeenInView && previousCompleted && !hasAnimated && !hasCalledCompletionRef.current) {
      console.log(`ReasonItem ${index}: Setting up force completion timeout`)

      // Clear any existing timeout
      if (completionTimeoutRef.current) {
        clearTimeout(completionTimeoutRef.current)
      }

      // Set new timeout - reduced to 500ms for faster fallback
      completionTimeoutRef.current = setTimeout(() => {
        if (!hasAnimated && !hasCalledCompletionRef.current) {
          console.log(`ReasonItem ${index}: Force completing animation after timeout`)
          handleStarComplete()
        }
      }, 500) // Force complete after 500ms if animation doesn't trigger
    }

    return () => {
      if (completionTimeoutRef.current) {
        clearTimeout(completionTimeoutRef.current)
        completionTimeoutRef.current = null
      }
    }
  }, [hasBeenInView, previousCompleted, hasAnimated, index, handleStarComplete])

  // Memoize animation props to prevent unnecessary prop changes
  const starAnimationProps = useMemo(
    () => ({
      delay: index * 0.2,
      onAnimationComplete: handleStarComplete,
      inView: hasBeenInView && previousCompleted,
    }),
    [index, handleStarComplete, hasBeenInView, previousCompleted],
  )

  // Memoize text animation props
  const textAnimationProps = useMemo(
    () => ({
      initial: { opacity: 0, y: 20 },
      animate: hasBeenInView && previousCompleted ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 },
      transition: { duration: 0.5, delay: index * 0.2 + 0.1 },
    }),
    [hasBeenInView, previousCompleted, index],
  )

  return (
    <li ref={itemRef} className="flex items-start gap-3 md:gap-4 group">
      <div className="relative flex-shrink-0 w-[80px] h-[120px] flex items-center justify-center">
        <div className="w-full h-full">
          <StarAnimation {...starAnimationProps} />
        </div>
      </div>

      <div className="my-auto">
        <motion.div {...textAnimationProps}>
          <h3 className="text-lg md:text-xl pt-3 font-medium text-foreground mb-2 tracking-tight group-hover:text-primary transition-colors duration-300">
            {reason.text}
          </h3>
          <p className="text-muted-foreground text-sm md:text-base leading-relaxed">{reason.description}</p>
        </motion.div>
      </div>
    </li>
  )
})
