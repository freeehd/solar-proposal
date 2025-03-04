"use client"

import { useMemo } from "react"
import { motion } from "framer-motion"

interface ChargeParticlesProps {
  progress: number
  isComplete?: boolean
}

export function ChargeParticles({ progress, isComplete = false }: ChargeParticlesProps) {
  // Scale number of particles with progress for a more dynamic feel
  const baseParticles = 18
  const numParticles = Math.max(5, Math.floor(baseParticles * progress) + baseParticles)

  // Generate particles with more sophisticated positioning and animation
  const generateParticles = () => {
    const particles = []

    // Create a more natural, organic distribution
    for (let i = 0; i < numParticles; i++) {
      // Use golden ratio to create more natural distribution
      const goldenRatio = 1.618033988749895
      const angle = i * goldenRatio * Math.PI * 2

      // Distance varies with progress and has some randomness
      const randomFactor = 0.7 + Math.random() * 0.6 // 0.7-1.3 range for natural variation
      const distance = 30 * progress * randomFactor + Math.random() * 20

      // Position with slight randomness
      const x = 70 + distance * Math.cos(angle)
      const y = 70 + distance * Math.sin(angle)

      // Size varies with progress
      const size = (Math.random() * 2 + 1) * (0.5 + progress * 0.5)

      // Opacity increases with progress
      const opacity = (Math.random() * 0.5 + 0.3) * (0.5 + progress * 0.5)

      // Stagger animation timing
      const delay = Math.random() * 0.8

      // Duration varies for more organic movement
      const duration = 0.5 + Math.random() * 0.8

      // Movement direction
      const moveAngle = angle + (Math.random() * 0.4 - 0.2)

      // Movement distance
      const moveDistance = 8 + Math.random() * 20 * progress

      particles.push({
        x,
        y,
        size,
        opacity,
        delay,
        duration,
        moveAngle,
        moveDistance,
        initialX: x,
        initialY: y,
      })
    }
    return particles
  }

  // Memoize particles to prevent regeneration on every render
  const particles = useMemo(() => generateParticles(), [numParticles, isComplete, progress])

  return (
    <>
      {particles.map((particle, index) => (
        <motion.div
          key={index}
          style={{
            position: "absolute",
            left: `${particle.initialX}px`,
            top: `${particle.initialY}px`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: "white",
            borderRadius: "50%",
            filter: "blur(0.5px)",
            zIndex: 50,
          }}
          initial={{
            scale: 0,
            opacity: 0,
            x: 0,
            y: 0,
          }}
          animate={
            isComplete
              ? {
                scale: [0, 1.5, 0],
                opacity: [0, particle.opacity * 1.5, 0],
                x: [0, particle.moveDistance * 5 * Math.cos(particle.moveAngle)],
                y: [0, particle.moveDistance * 5 * Math.sin(particle.moveAngle)],
              }
              : {
                scale: 1,
                opacity: particle.opacity,
                x: [0, particle.moveDistance * Math.cos(particle.moveAngle), 0],
                y: [0, particle.moveDistance * Math.sin(particle.moveAngle), 0],
              }
          }
          transition={
            isComplete
              ? {
                duration: particle.duration * 1.2,
                ease: "easeOut",
              }
              : {
                duration: particle.duration * 1.5,
                delay: particle.delay * 0.5,
                ease: "easeInOut",
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "reverse",
                repeatDelay: Math.random() * 0.3,
              }
          }
        />
      ))}
    </>
  )
}

