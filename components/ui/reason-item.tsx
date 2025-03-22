"use client"

import { memo, useRef, useState, useEffect, useMemo, useCallback } from "react"
import { motion, useInView, AnimatePresence } from "framer-motion"
import { ChevronRight } from "lucide-react"
import dynamic from "next/dynamic"
import { useReducedMotion } from "framer-motion"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"
import type * as THREE from "three" // Import THREE

// Global star model cache
const starModelCache = {
  isLoaded: false,
  isLoading: false,
  loadPromise: null as Promise<void> | null,
  model: null as THREE.Group | null,
  error: false,
}

// Preload the star model as early as possible
if (typeof window !== "undefined") {
  // Only run in browser environment
  const preloadStarModel = () => {
    if (starModelCache.isLoaded || starModelCache.isLoading) return

    console.log("Preloading star model globally")
    starModelCache.isLoading = true

    const loader = new GLTFLoader()

    starModelCache.loadPromise = new Promise<void>((resolve, reject) => {
      loader.load(
        "/models/star.glb",
        (gltf) => {
          console.log("Star model preloaded globally")
          starModelCache.model = gltf.scene.clone()
          starModelCache.isLoaded = true
          starModelCache.isLoading = false
          resolve()
        },
        (xhr) => {
          if (xhr.lengthComputable) {
            const percentComplete = (xhr.loaded / xhr.total) * 100
            console.log(`Star model loading: ${Math.round(percentComplete)}%`)
          }
        },
        (error) => {
          console.error("Error preloading star model globally:", error)
          starModelCache.error = true
          starModelCache.isLoading = false
          reject(error)
        },
      )
    })

    // Set a timeout to prevent indefinite loading
    setTimeout(() => {
      if (!starModelCache.isLoaded && starModelCache.isLoading) {
        console.warn("Star model loading timed out globally")
        starModelCache.isLoaded = true
        starModelCache.isLoading = false
        starModelCache.error = true
      }
    }, 10000) // 10 second timeout
  }

  // Start preloading immediately
  preloadStarModel()
}

// Dynamically import StarAnimation with an invisible placeholder
const StarAnimation = dynamic(() => import("./star-animation").then((mod) => mod.StarAnimation), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-transparent" />,
})

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

// New drop animation for the star wrapper - reduced vertical movement
const dropVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      opacity: { duration: 0.3 },
      duration: 0.3,
    },
  },
}

export const OptimizedReasonItem = memo(function OptimizedReasonItem({
  reason,
  index,
  previousCompleted,
  hasCompleted,
  onStarComplete,
  prefersReducedMotion = false,
}: ReasonItemProps) {
  const itemRef = useRef<HTMLLIElement>(null)
  const starRef = useRef<HTMLDivElement>(null)
  const animationAttempts = useRef(0)
  const prefersReducedMotionValue = useReducedMotion()
  const modelLoadingAttempted = useRef(false)

  // Use InView with higher threshold to reduce unnecessary renders
  const isInView = useInView(itemRef, {
    once: true,
    amount: 0.3,
    margin: "0px 0px 100px 0px",
  })

  const [isHovered, setIsHovered] = useState(false)
  const [shouldAnimate, setShouldAnimate] = useState(false)
  const [starLoaded, setStarLoaded] = useState(false)
  const [animationFailed, setAnimationFailed] = useState(false)
  const [modelLoaded, setModelLoaded] = useState(starModelCache.isLoaded)

  // Apply reduced motion preference
  const shouldReduceMotion = prefersReducedMotion || !!prefersReducedMotionValue

  // Check if the star model is loaded from the global cache
  useEffect(() => {
    if (modelLoaded || modelLoadingAttempted.current) return

    modelLoadingAttempted.current = true

    if (starModelCache.isLoaded) {
      console.log("Star model already loaded in global cache")
      setModelLoaded(true)
      return
    }

    if (starModelCache.isLoading && starModelCache.loadPromise) {
      console.log("Star model loading in progress, waiting...")
      starModelCache.loadPromise
        .then(() => {
          console.log("Star model loaded from global promise")
          setModelLoaded(true)
        })
        .catch(() => {
          console.error("Error loading star model from global promise")
          setModelLoaded(true) // Continue anyway
          setAnimationFailed(true)
        })
      return
    }

    // If not loading or loaded, start loading now
    console.log("Starting star model loading in ReasonItem")
    const loader = new GLTFLoader()
    loader.load(
      "/models/star.glb",
      () => {
        console.log("Star model loaded in ReasonItem")
        starModelCache.isLoaded = true
        setModelLoaded(true)
      },
      undefined,
      (error) => {
        console.error("Error loading star model in ReasonItem:", error)
        // Even if there's an error, we should still allow the component to render
        setModelLoaded(true)
        setAnimationFailed(true)
      },
    )

    // Set a timeout to prevent indefinite loading
    const timeout = setTimeout(() => {
      if (!modelLoaded) {
        console.warn("Star model loading timed out in ReasonItem, continuing anyway")
        setModelLoaded(true)
        setAnimationFailed(true)
      }
    }, 8000) // 8 second timeout

    return () => clearTimeout(timeout)
  }, [modelLoaded])

  // Memoize event handlers
  const handleMouseEnter = useCallback(() => setIsHovered(true), [])
  const handleMouseLeave = useCallback(() => setIsHovered(false), [])

  // Optimize effect to run only when dependencies change
  useEffect(() => {
    if (!previousCompleted || !isInView || shouldAnimate || !modelLoaded) return

    const timer = setTimeout(() => {
      setShouldAnimate(true)
    }, 150)

    return () => clearTimeout(timer)
  }, [previousCompleted, isInView, shouldAnimate, modelLoaded])

  // Fallback mechanism for animation failures
  useEffect(() => {
    if (!shouldAnimate || hasCompleted || !isInView || animationAttempts.current > 2) return

    // Set a fallback timer to ensure the animation completes even if the star fails to load
    const fallbackTimer = setTimeout(() => {
      if (!hasCompleted) {
        animationAttempts.current += 1

        if (animationAttempts.current > 2) {
          // After multiple attempts, force completion
          setAnimationFailed(true)
          onStarComplete()
        } else {
          // Try reloading the star
          setStarLoaded(false)
          setTimeout(() => setStarLoaded(true), 100)
        }
      }
    }, 3000)

    return () => clearTimeout(fallbackTimer)
  }, [shouldAnimate, hasCompleted, isInView, onStarComplete])

  // Force completion for all items after a timeout
  useEffect(() => {
    if (shouldReduceMotion && !hasCompleted) {
      onStarComplete()
    }
  }, [shouldReduceMotion, hasCompleted, onStarComplete])

  // Compute derived state once per render
  const shouldShowAnimation = shouldAnimate && previousCompleted && modelLoaded
  const isContentVisible = shouldReduceMotion || hasCompleted || animationFailed

  // Memoize animation state to prevent recalculation
  const animationState = useMemo(
    () => ({
      container: shouldShowAnimation ? "visible" : "hidden",
      content: isContentVisible ? "visible" : "hidden",
    }),
    [shouldShowAnimation, isContentVisible],
  )

  // Memoize star animation completion handler
  const handleStarComplete = useCallback(() => {
    // Small delay before triggering the completion callback
    setTimeout(() => {
      setStarLoaded(true)
      onStarComplete()
    }, 100)
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
        ref={starRef}
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
            {/* Only render StarAnimation when it should be visible */}
            <StarAnimation
              onAnimationComplete={() => {}}
              inView={isInView}
              prefersReducedMotion={shouldReduceMotion}
              usePreloadedModel={true}
            />
          </motion.div>
        )}

        {/* Fallback for failed star animations */}
        {animationFailed && (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-amber-400 flex items-center justify-center text-white text-2xl">
              ★
            </div>
          </div>
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

