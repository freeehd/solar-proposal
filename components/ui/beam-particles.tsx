"use client"

import type React from "react"
import { useEffect, useState, useRef } from "react"
import { motion } from "framer-motion"

interface BeamParticlesProps {
  progress: number
  pathD: string
  count?: number
  minSize?: number
  maxSize?: number
  color?: string
}

export const BeamParticles: React.FC<BeamParticlesProps> = ({
  progress,
  pathD,
  count = 8,
  minSize = 2,
  maxSize = 6,
  color = "rgba(59, 130, 246, 0.8)",
}) => {
  const [particles, setParticles] = useState<
    Array<{
      id: number
      size: number
      offset: number
      delay: number
      duration: number
      opacity: number
    }>
  >([])

  const pathRef = useRef<SVGPathElement | null>(null)

  // Adjust particle sizes for mobile
  const [responsiveSize, setResponsiveSize] = useState({ min: minSize, max: maxSize })

  useEffect(() => {
    const updateParticleSizes = () => {
      const width = window.innerWidth
      if (width < 640) {
        // Mobile
        setResponsiveSize({
          min: minSize * 0.5,
          max: maxSize * 0.5,
        })
      } else if (width < 768) {
        // Small tablets
        setResponsiveSize({
          min: minSize * 0.7,
          max: maxSize * 0.7,
        })
      } else {
        setResponsiveSize({
          min: minSize,
          max: maxSize,
        })
      }
    }

    updateParticleSizes()
    window.addEventListener("resize", updateParticleSizes)

    return () => window.removeEventListener("resize", updateParticleSizes)
  }, [minSize, maxSize])

  // Initialize particles
  useEffect(() => {
    const newParticles = Array.from({ length: count }, (_, i) => ({
      id: i,
      size: responsiveSize.min + Math.random() * (responsiveSize.max - responsiveSize.min),
      offset: Math.random() * 0.2 + 0.1, // Offset from the path (0.1 to 0.3)
      delay: Math.random() * 0.5, // Random delay for each particle
      duration: 0.5 + Math.random() * 1, // Random duration
      opacity: 0.5 + Math.random() * 0.5, // Random opacity
    }))
    setParticles(newParticles)
  }, [count, responsiveSize.min, responsiveSize.max])

  // Create a hidden path element to use for calculations
  useEffect(() => {
    if (pathD && typeof document !== "undefined") {
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path")
      path.setAttribute("d", pathD)
      path.style.visibility = "hidden"
      pathRef.current = path

      // Append to document temporarily for calculations
      document.body.appendChild(path)

      return () => {
        if (path.parentNode) {
          path.parentNode.removeChild(path)
        }
      }
    }
  }, [pathD])

  // Function to get point at a specific percentage along the path
  const getPointAtPercentage = (percentage: number) => {
    try {
      if (!pathRef.current || !pathD) {
        return { x: 0, y: 0 }
      }

      // Get the total length of the path
      const pathLength = pathRef.current.getTotalLength()

      // Get the point at the specified percentage
      const point = pathRef.current.getPointAtLength(pathLength * percentage)

      return { x: point.x, y: point.y }
    } catch (error) {
      console.error("Error getting point on path:", error)
      return { x: 0, y: 0 }
    }
  }

  // Only render particles if progress is greater than 0
  if (progress <= 0 || !pathD) {
    return null
  }

  return (
    <>
      {particles.map((particle) => {
        // Calculate position based on progress and particle offset
        const particleProgress = Math.max(0, Math.min(1, progress - particle.delay))

        if (particleProgress <= 0) {
          return null
        }

        const point = getPointAtPercentage(particleProgress)

        return (
          <motion.circle
            key={particle.id}
            cx={point.x}
            cy={point.y}
            r={particle.size}
            fill={color}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: [0, particle.opacity, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: particle.duration,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "loop",
              ease: "easeInOut",
              delay: particle.delay,
            }}
          />
        )
      })}
    </>
  )
}

