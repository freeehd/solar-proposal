"use client"

import type React from "react"

import { type RefObject, useEffect, useId, useState, useCallback, useMemo, useRef } from "react"
import { motion } from "framer-motion"

export interface AnimatedBeamProps {
  className?: string
  containerRef: RefObject<HTMLElement>
  fromRef: RefObject<HTMLElement>
  toRef: RefObject<HTMLElement>
  circleRef?: RefObject<HTMLElement>
  pattern?: "straight" | "wave"
  patternCount?: number
  patternIntensity?: number
  pathColor?: string
  pathWidth?: number
  pathOpacity?: number
  glowColor?: string
  glowWidth?: number
  delay?: number
  duration?: number
  onProgress?: (progress: number) => void
  onComplete?: () => void
}

export const AnimatedBeam: React.FC<AnimatedBeamProps> = ({
  className,
  containerRef,
  fromRef,
  toRef,
  circleRef,
  pattern = "straight",
  patternCount = 3,
  patternIntensity = 0.05,
  pathColor = "rgba(136, 182, 95, 0.6)",
  pathWidth = 2,
  pathOpacity = 1,
  glowColor = "rgba(65, 220, 120, 0.3)",
  glowWidth = 16,
  delay = 0,
  duration = 2.5,
  onProgress,
  onComplete,
}) => {
  const id = useId()
  const [pathData, setPathData] = useState({ 
    d: "", 
    width: 0, 
    height: 0,
    isVisible: false 
  })
  const [progress, setProgress] = useState(0)
  const rafRef = useRef<number>()
  const resizeObserverRef = useRef<ResizeObserver | null>(null)
  const prevDimensionsRef = useRef({ width: 0, height: 0 })
  
  // Calculate responsive beam width based on screen size - memoized to avoid recalculations
  const responsiveWidth = useMemo(() => {
    const width = typeof window !== 'undefined' ? window.innerWidth : 1024
    
    if (width < 375) return { path: pathWidth * 0.4, glow: glowWidth * 0.4 } // Small iPhone
    if (width < 640) return { path: pathWidth * 0.5, glow: glowWidth * 0.5 } // Mobile
    if (width < 768) return { path: pathWidth * 0.7, glow: glowWidth * 0.7 } // Small tablets
    if (width < 1024) return { path: pathWidth * 0.85, glow: glowWidth * 0.85 } // Tablets
    return { path: pathWidth, glow: glowWidth } // Desktop
  }, [pathWidth, glowWidth])

  // Optimized center point calculation
  const calculateCenter = useCallback((element: HTMLElement, containerRect: DOMRect, isCircle = false, isCard = false) => {
    if (!element) return { x: 0, y: 0 }
    
    try {
      const rect = element.getBoundingClientRect()
      const width = typeof window !== 'undefined' ? window.innerWidth : 1024
      
      // Size calculations - simplified and optimized
      const size = isCircle 
        ? width < 375 ? 90 : width < 640 ? 120 : width < 768 ? 140 : width < 1024 ? 180 : 208
        : width < 375 ? 48 : width < 640 ? 56 : width < 768 ? 56 : width < 1024 ? 96 : 112
      
      // For cards or mobile, use direct center
      if (isCard || width < 640) {
        return {
          x: rect.left - containerRect.left + rect.width / 2,
          y: rect.top - containerRect.top + rect.height / 2,
        }
      }
      
      // For larger screens and icons
      return {
        x: rect.left - containerRect.left + size / 2,
        y: rect.top - containerRect.top + size / 2,
      }
    } catch (error) {
      console.error("Error calculating center:", error)
      return { x: 0, y: 0 }
    }
  }, [])

  // Optimized path generation
  const generatePath = useCallback((start: {x: number, y: number}, end: {x: number, y: number}) => {
    const dx = end.x - start.x
    const dy = end.y - start.y
    const distance = Math.hypot(dx, dy) // More efficient than Math.sqrt(dx*dx + dy*dy)
    
    if (distance < 1) return `M ${start.x},${start.y} L ${end.x},${end.y}`
    
    let d = `M ${start.x},${start.y} `
    
    if (pattern === "straight") {
      d += `L ${end.x},${end.y}`
    } else if (pattern === "wave") {
      const waveFrequency = Math.PI * 2 * patternCount
      // Limit steps based on distance and screen size to improve performance
      const steps = Math.min(
        50, 
        Math.max(5, Math.floor(distance / 10))
      )
      
      if (steps < 2) {
        d += `L ${end.x},${end.y}`
      } else {
        // Pre-calculate constants outside the loop
        const invSteps = 1 / steps
        const waveIntensity = distance * patternIntensity
        const normDx = dx / distance
        const normDy = dy / distance
        
        for (let i = 0; i <= steps; i++) {
          const t = i * invSteps
          const baseX = start.x + dx * t
          const baseY = start.y + dy * t
          
          // Optimized wave calculation
          const waveOffset = Math.sin(t * waveFrequency) * waveIntensity
          const perpX = -normDy * waveOffset
          const perpY = normDx * waveOffset
          
          d += `${i === 0 ? "M" : "L"} ${baseX + perpX},${baseY + perpY} `
        }
      }
    }
    
    return d
  }, [pattern, patternCount, patternIntensity])

  // Update path handling with debounce and optimized calculations
  const updatePath = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
    }
    
    rafRef.current = requestAnimationFrame(() => {
      try {
        if (!containerRef?.current || !fromRef?.current || !toRef?.current) {
          return
        }

        const containerRect = containerRef.current.getBoundingClientRect()
        const newWidth = containerRect.width
        const newHeight = containerRect.height
        
        // Skip update if dimensions haven't changed significantly (within 1px)
        const dimensionsChanged = 
          Math.abs(newWidth - prevDimensionsRef.current.width) > 1 || 
          Math.abs(newHeight - prevDimensionsRef.current.height) > 1
        
        if (!dimensionsChanged && pathData.d) {
          return
        }
        
        prevDimensionsRef.current = { width: newWidth, height: newHeight }
        
        // Check for card elements - optimized with single DOM access
        const isFromCard = fromRef.current.classList.contains("rounded-xl")
        const isToCard = toRef.current.classList.contains("rounded-xl")
        const isTargetCircle = circleRef?.current && toRef.current === circleRef.current
        
        // Calculate centers
        const start = calculateCenter(fromRef.current, containerRect, false, isFromCard)
        const end = calculateCenter(toRef.current, containerRect, isToCard)
        
        // Generate path
        const d = generatePath(start, end)
        
        // Update state only if something changed
        setPathData(prev => {
          if (prev.d === d && prev.width === newWidth && prev.height === newHeight && prev.isVisible) {
            return prev
          }
          return {
            d,
            width: newWidth,
            height: newHeight,
            isVisible: true
          }
        })
      } catch (error) {
        console.error("Error updating beam path:", error)
      }
    })
  }, [containerRef, fromRef, toRef, circleRef, calculateCenter, generatePath, pathData.d])

  // Setup initial render and resize handling
  useEffect(() => {
    // First update with a slight delay to ensure DOM is ready
    const timer = setTimeout(updatePath, 100)
    
    // Throttled resize handler
    let resizeTimeout: NodeJS.Timeout
    const handleResize = () => {
      clearTimeout(resizeTimeout)
      resizeTimeout = setTimeout(() => {
        updatePath()
      }, 100) // Throttle to avoid excessive updates
    }
    
    window.addEventListener("resize", handleResize, { passive: true })
    
    // Setup optimized ResizeObserver
    try {
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect()
      }
      
      resizeObserverRef.current = new ResizeObserver((entries) => {
        if (entries.length) {
          handleResize()
        }
      })
      
      if (containerRef?.current) {
        resizeObserverRef.current.observe(containerRef.current)
      }
    } catch (error) {
      console.error("ResizeObserver setup failed:", error)
    }
    
    return () => {
      clearTimeout(timer)
      clearTimeout(resizeTimeout)
      window.removeEventListener("resize", handleResize)
      
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect()
      }
      
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [containerRef, updatePath])

  // Don't render anything if path not ready
  if (!pathData.isVisible || !pathData.d || pathData.width <= 0 || pathData.height <= 0) {
    return null
  }

  return (
    <svg
      fill="none"
      width={pathData.width}
      height={pathData.height}
      xmlns="http://www.w3.org/2000/svg"
      className={`pointer-events-none absolute left-0 top-0 ${className || ""}`}
      style={{ 
        zIndex: 25,
        // Safari-specific optimizations
        transform: 'translateZ(0)',
        backfaceVisibility: 'hidden'
      }}
      viewBox={`0 0 ${pathData.width} ${pathData.height}`}
    >
      <defs>
        <filter id={`glow-${id}`} filterUnits="userSpaceOnUse">
          {/* Simplified filter for better performance */}
          <feGaussianBlur in="SourceGraphic" stdDeviation="4" />
        </filter>
      </defs>

      <g style={{ isolation: "isolate" }}>
        {/* Base path - simplified */}
        <path
          d={pathData.d}
          stroke={pathColor}
          strokeWidth={responsiveWidth.path * 2}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={0.3}
        />

        {/* Main glow path - optimized animation */}
        <motion.path
          key={`glow-${id}`}
          d={pathData.d}
          stroke={glowColor}
          strokeWidth={responsiveWidth.glow}
          strokeLinecap="round"
          strokeLinejoin="round"
          filter={`url(#glow-${id})`}
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{
            pathLength: 1,
            opacity: pathOpacity * 0.8,
          }}
          transition={{
            delay,
            duration,
            ease: "easeInOut",
            opacity: { duration: duration * 0.5 },
          }}
          onUpdate={(latest) => {
            if ('pathLength' in latest) {
              const numericPathLength = Number(latest.pathLength) || 0
              if (Math.abs(numericPathLength - progress) > 0.01) {
                setProgress(numericPathLength)
                onProgress?.(numericPathLength)
              }
            }
          }}
          onAnimationComplete={() => onComplete?.()}
        />

        {/* Main path - simplified */}
        <motion.path
          key={`path-${id}`}
          d={pathData.d}
          stroke={pathColor}
          strokeWidth={responsiveWidth.path}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{
            pathLength: 1,
            opacity: 1,
          }}
          transition={{
            delay,
            duration,
            ease: "easeInOut",
          }}
        />
      </g>
    </svg>
  )
}