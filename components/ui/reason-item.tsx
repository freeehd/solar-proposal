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
  const itemRef = useRef<HTMLLIElement>(null)

  // Use Framer Motion's useInView for more reliable detection
  const isInView = useInView(itemRef, {
    once: false,
    amount: 0.3,
    margin: "100px 0px",
  })

  // Handle animation completion
  const handleStarComplete = () => {
    console.log(`ReasonItem ${index}: Star animation completed`)
    if (!hasAnimated) {
      setHasAnimated(true)
      onStarComplete?.()
    }
  }

  // Force completion after a timeout
  useEffect(() => {
    if (isInView && previousCompleted && !hasAnimated) {
      console.log(`ReasonItem ${index}: Setting up force completion timeout`)
      const timer = setTimeout(() => {
        console.log(`ReasonItem ${index}: Force completing animation after timeout`)
        handleStarComplete()
      }, 5000) // Force complete after 5 seconds if animation doesn't trigger

      return () => clearTimeout(timer)
    }
  }, [isInView, previousCompleted, hasAnimated, index])

  return (
    <li ref={itemRef} className="flex items-start gap-4 md:gap-6">
      <div className="flex-shrink-0 w-[100px] h-[100px]">
        <StarAnimation
          delay={index * 0.3}
          onAnimationComplete={handleStarComplete}
          inView={isInView && previousCompleted}
        />
      </div>

      <div className="flex-1">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView && previousCompleted ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5, delay: index * 0.3 + 0.2 }}
        >
          <h3 className="text-lg md:text-xl font-medium mb-2">{reason.text}</h3>
          <p className="text-gray-600 text-sm md:text-base">{reason.description}</p>
        </motion.div>
      </div>
    </li>
  )
}

