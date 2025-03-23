"use client"

import { useState, useEffect, useRef } from "react"
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

export function ReasonItem({ reason, index, previousCompleted = true, onStarComplete }: ReasonItemProps) {
  const [hasAnimated, setHasAnimated] = useState(false)
  const [hasBeenInView, setHasBeenInView] = useState(false)
  const itemRef = useRef<HTMLLIElement>(null)
  const completionTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Use Framer Motion's useInView with once:true to only trigger once
  const isInView = useInView(itemRef, {
    once: true, // Changed to true so it only triggers once
    amount: 0.3,
    margin: "100px 0px",
  })

  // When it comes into view, mark it
  useEffect(() => {
    if (isInView && !hasBeenInView) {
      console.log(`ReasonItem ${index}: Has entered view for the first time`)
      setHasBeenInView(true)
    }
  }, [isInView, hasBeenInView, index])

  // Handle animation completion - ensure it only fires once
  const handleStarComplete = () => {
    if (!hasAnimated) {
      console.log(`ReasonItem ${index}: Star animation completed`)
      setHasAnimated(true)

      // Clear any pending timeout
      if (completionTimeoutRef.current) {
        clearTimeout(completionTimeoutRef.current)
        completionTimeoutRef.current = null
      }

      // Notify parent only once
      onStarComplete?.()
    }
  }

  // Force completion after a timeout if needed
  useEffect(() => {
    if (hasBeenInView && previousCompleted && !hasAnimated) {
      console.log(`ReasonItem ${index}: Setting up force completion timeout`)

      // Clear any existing timeout
      if (completionTimeoutRef.current) {
        clearTimeout(completionTimeoutRef.current)
      }

      // Set new timeout - reduced to 500ms for faster fallback
      completionTimeoutRef.current = setTimeout(() => {
        console.log(`ReasonItem ${index}: Force completing animation after timeout`)
        handleStarComplete()
      }, 500) // Force complete after 500ms if animation doesn't trigger
    }

    return () => {
      if (completionTimeoutRef.current) {
        clearTimeout(completionTimeoutRef.current)
        completionTimeoutRef.current = null
      }
    }
  }, [hasBeenInView, previousCompleted, hasAnimated, index])

  return (
    <li ref={itemRef} className="flex items-start gap-4 md:gap-6">
      <div className="flex-shrink-0 w-[100px] h-[100px]">
        <StarAnimation
          delay={index * 0.2} // Reduced delay for faster appearance
          onAnimationComplete={handleStarComplete}
          // Always show animation once it's been in view, regardless of current visibility
          inView={hasBeenInView && previousCompleted}
        />
      </div>

      <div className="flex-1">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          // Always show content once it's been in view
          animate={hasBeenInView && previousCompleted ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5, delay: index * 0.2 + 0.1 }} // Reduced delay for faster appearance
        >
          <h3 className="text-lg md:text-xl font-medium mb-2">{reason.text}</h3>
          <p className="text-gray-600 text-sm md:text-base">{reason.description}</p>
        </motion.div>
      </div>
    </li>
  )
}

