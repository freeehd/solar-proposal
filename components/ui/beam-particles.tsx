"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

interface BeamParticlesProps {
  pathD: string
  progress: number
  count?: number
  color?: string
  minSize?: number
  maxSize?: number
  minOpacity?: number
  maxOpacity?: number
  minSpeed?: number
  maxSpeed?: number
}

export const BeamParticles: React.FC<BeamParticlesProps> = ({
  pathD,
  progress,
  count = 8,
  color = "#60a5fa",
  minSize = 2,
  maxSize = 6,
  minOpacity = 0.4,
  maxOpacity = 0.8,
  minSpeed = 0.5,
  maxSpeed = 1.5,
}) => {
  const [particles, setParticles] = useState<
    Array<{
      id: number
      size: number
      opacity: number
      speed: number
      offset: number
      visible: boolean
    }>
  >([])

  // Initialize particles
  useEffect(() => {
    const newParticles = Array.from({ length: count }).map((_, index) => {
      const size = Math.random() * (maxSize - minSize) + minSize
      const opacity = Math.random() * (maxOpacity - minOpacity) + minOpacity
      const speed = Math.random() * (maxSpeed - minSpeed) + minSpeed
      // Distribute particles along the path
      const offset = index / count

      return {
        id: index,
        size,
        opacity,
        speed,
        offset,
        visible: false,
      }
    })

    setParticles(newParticles)
  }, [count, minSize, maxSize, minOpacity, maxOpacity, minSpeed, maxSpeed])

  // Update particle visibility based on progress
  useEffect(() => {
    if (progress > 0) {
      setParticles((prev) =>
        prev.map((particle) => ({
          ...particle,
          visible: progress >= particle.offset,
        })),
      )
    }
  }, [progress])

  // Get point along SVG path
  const getPointAtLength = (path: SVGPathElement, length: number) => {
    try {
      const point = path.getPointAtLength(length)
      return { x: point.x, y: point.y }
    } catch (error) {
      console.error("Error getting point at length:", error)
      return { x: 0, y: 0 }
    }
  }

  // Add responsive sizing for particles
  useEffect(() => {
    const handleResize = () => {
      // Re-initialize particles on resize to adjust sizes
      const newParticles = Array.from({ length: count }).map((_, index) => {
        const size = Math.random() * (maxSize - minSize) + minSize
        const opacity = Math.random() * (maxOpacity - minOpacity) + minOpacity
        const speed = Math.random() * (maxSpeed - minSpeed) + minSpeed
        // Distribute particles along the path
        const offset = index / count

        return {
          id: index,
          size,
          opacity,
          speed,
          offset,
          visible: progress >= offset,
        }
      })

      setParticles(newParticles)
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [count, minSize, maxSize, minOpacity, maxOpacity, minSpeed, maxSpeed, progress])

  if (!pathD || particles.length === 0) {
    return null
  }

  return (
    <>
      {particles.map((particle) => (
        <motion.circle
          key={particle.id}
          cx={0}
          cy={0}
          r={particle.size}
          fill={color}
          opacity={0}
          initial={{ opacity: 0 }}
          animate={particle.visible ? { opacity: particle.opacity } : { opacity: 0 }}
          transition={{ duration: 0.3 }}
          style={{
            offsetPath: `path('${pathD}')`,
            offsetDistance: `${particle.offset * 100}%`,
          }}
        />
      ))}
    </>
  )
}

