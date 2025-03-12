"use client"

import { useEffect, useRef, type FC, type ReactNode } from "react"
import { gsap } from "gsap"
import { useMediaQuery } from "@/hooks/use-media-query"

interface GridMotionProps {
  items?: {
    image: string
    overlay?: ReactNode
  }[]
  gradientColor?: string
  opacity?: number
}

const GridMotion: FC<GridMotionProps> = ({
  items = [],
  gradientColor = "rgba(59, 130, 246, 0.5)", // Default blue color matching solar theme
  opacity = 0.7,
}) => {
  const gridRef = useRef<HTMLDivElement>(null)
  const rowRefs = useRef<(HTMLDivElement | null)[]>([])
  const animationsRef = useRef<gsap.core.Timeline[]>([])

  // Responsive breakpoints
  const isMobile = useMediaQuery("(max-width: 640px)")
  const isSmallMobile = useMediaQuery("(max-width: 380px)") // iPhone SE and similar
  const isTablet = useMediaQuery("(min-width: 641px) and (max-width: 1024px)")

  useEffect(() => {
    // Clear any existing animations
    animationsRef.current.forEach((timeline) => timeline.kill())
    animationsRef.current = []

    // Create continuous animations for each row
    rowRefs.current.forEach((row, index) => {
      if (row) {
        const direction = index % 2 === 0 ? 1 : -1

        // Adjust animation parameters based on device size
        let duration, distance

        if (isMobile) {
          duration = 12 + index * 1.5 // Slightly faster on mobile
          distance = 100 // Smaller movement range on mobile
        } else if (isTablet) {
          duration = 14 + index * 1.8 // Medium speed on tablets
          distance = 220 // Medium movement range on tablets
        } else {
          duration = 15 + index * 2 // Original speed on desktop
          distance = 300 // Original movement range on desktop
        }

        const delay = index * 0.5 // Stagger the start times

        // Create a timeline for continuous back-and-forth motion
        const timeline = gsap.timeline({
          repeat: -1, // Infinite repetition
          yoyo: true, // Go back and forth
          ease: "sine.inOut", // Smooth sine wave motion
          delay: delay,
        })

        // Move from center to one side, then the timeline will yoyo back
        timeline.fromTo(
          row,
          { x: 0 },
          {
            x: distance * direction,
            duration: duration,
            ease: "sine.inOut",
          },
        )

        // Store the timeline for cleanup
        animationsRef.current.push(timeline)
      }
    })

    // Cleanup function
    return () => {
      animationsRef.current.forEach((timeline) => timeline.kill())
    }
  }, [isMobile, isTablet]) // Re-run when screen size changes

  // Determine number of rows and columns based on screen size
  const getGridConfig = () => {
    if (isSmallMobile) {
      return {
        rows: 10,
        cols: 10,
        rotation: -10,
        width: "250vw",
        height: "250vh",
        gap: 3,
      }
    } else if (isMobile) {
      return {
        rows: 8,
        cols: 8,
        rotation: -10, // Less rotation on mobile
        width: "220vw",
        height: "220vh",
        gap: 3,
      }
    } else if (isTablet) {
      return {
        rows: 4,
        cols: 5,
        rotation: -12, // Medium rotation on tablet
        width: "160vw",
        height: "160vh",
        gap: 4,
      }
    }
    return {
      rows: 4,
      cols: 7,
      rotation: -15, // Full rotation on desktop
      width: "150vw",
      height: "150vh",
      gap: 4,
    }
  }

  const config = getGridConfig()

  return (
    <div ref={gridRef} className="h-full w-full overflow-hidden absolute inset-0 z-0">
      <section
        className="w-full h-full overflow-hidden relative flex items-center justify-center"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${gradientColor} 0%, transparent 70%)`,
        }}
      >
        {/* Noise overlay */}
        <div className="absolute inset-0 pointer-events-none z-[4] bg-[url('/placeholder.svg?height=250&width=250')] opacity-20 bg-[length:250px]"></div>
        <div
          className="flex-none relative grid grid-cols-1 z-[2]"
          style={{
            width: config.width,
            height: config.height,
            gridTemplateRows: `repeat(${config.rows}, 1fr)`,
            transform: `rotate(${config.rotation}deg)`,
            transformOrigin: "center",
            opacity,
            gap: `${config.gap}px`,
          }}
        >
          {Array.from({ length: config.rows }, (_, rowIndex) => (
            <div
              key={rowIndex}
              style={{
                display: "grid",
                gridTemplateColumns: `repeat(${config.cols}, 1fr)`,
                gap: `${config.gap}px`,
                willChange: "transform",
              }}
              ref={(el) => (rowRefs.current[rowIndex] = el)}
            >
              {Array.from({ length: config.cols }, (_, itemIndex) => {
                const itemIdx = rowIndex * config.cols + itemIndex
                // Get the item from the items array, or use a default if not enough items
                const item = itemIdx < items.length ? items[itemIdx] : items[itemIdx % items.length] // Repeat items if needed

                return (
                  <div key={itemIndex} className="relative aspect-square">
                    <div className="absolute inset-0 overflow-hidden rounded-[4px] sm:rounded-[6px] md:rounded-[8px] bg-blue-900/20 backdrop-blur-sm border border-blue-500/20 flex items-center justify-center text-white">
                      {/* Image background */}
                      <div
                        className="w-full h-full bg-cover bg-center absolute top-0 left-0"
                        style={{ backgroundImage: `url(${item.image})` }}
                      ></div>

                      {/* Optional text overlay - hide text on mobile */}
                      {item.overlay && !isMobile && (
                        <div className="absolute inset-0 flex items-center justify-center bg-blue-900/40 backdrop-blur-[2px] p-1 sm:p-2">
                          <div className="text-center z-10 font-medium text-white text-shadow text-xs sm:text-sm md:text-base">
                            {item.overlay}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export default GridMotion

