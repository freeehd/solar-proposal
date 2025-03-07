"use client"

import React from "react"

import { motion, useReducedMotion, AnimatePresence } from "framer-motion"
import { useState, useEffect, useRef, useMemo, useCallback } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { Center, Float, useDetectGPU, Environment, MeshTransmissionMaterial } from "@react-three/drei"
import * as THREE from "three"
import type { Mesh } from "three"

interface StarMeshProps {
  isHovered: boolean
  hasCompletedEntrance: boolean
  onAnimationComplete?: () => void
  delay?: number
  prefersReducedMotion: boolean
  quality: "high" | "low"
  inView?: boolean
}

interface StarAnimationProps {
  delay?: number
  onAnimationComplete?: () => void
  inView?: boolean
}

// Add custom type for the material that includes MeshTransmissionMaterial properties
type CustomMaterial = THREE.MeshPhysicalMaterial & {
  distortion?: number
  transmission?: number
  distortionScale?: number
  temporalDistortion?: number
}

// Memoized star geometry creation - moved outside component to prevent recreation
const starGeometry = (() => {
  const shape = new THREE.Shape()
  const numPoints = 5 // Number of star points
  const outerRadius = 0.6 // Outer radius of the star
  const innerRadius = 0.22 // Inner radius between points

  // Create star points using polar coordinates
  const points = []
  for (let i = 0; i <= numPoints * 2; i++) {
    const angle = (i * Math.PI) / numPoints
    const radius = i % 2 === 0 ? outerRadius : innerRadius
    const x = Math.sin(angle) * radius
    const y = Math.cos(angle) * radius
    points.push([x, y])
  }

  // Create shape
  shape.moveTo(points[0][0], points[0][1])
  for (let i = 1; i < points.length; i++) {
    shape.lineTo(points[i][0], points[i][1])
  }
  shape.closePath()

  return new THREE.ExtrudeGeometry(shape, {
    depth: 0.1,
    bevelEnabled: true,
    bevelThickness: 0.05,
    bevelSize: 0.05,
    bevelSegments: 10,
  })
})()

// Memoized color objects to prevent recreation on each frame
const hoverColor = new THREE.Color("#ffd700")
const defaultColor = new THREE.Color("#daa520")
const accentColor = new THREE.Color("#f8f0e3")

// Separated component for better performance isolation
const StarMesh = React.memo(
  ({
    isHovered,
    hasCompletedEntrance,
    onAnimationComplete,
    delay = 0,
    prefersReducedMotion,
    quality,
    inView = true,
  }: StarMeshProps) => {
    const meshRef = useRef<Mesh>(null)
    const materialRef = useRef<CustomMaterial>(null)
    const targetRotation = useRef({ x: 0, y: 0 })
    const currentRotation = useRef({ x: 0, y: 0 })
    const startTime = useRef<number | null>(null)
    const animationCompleted = useRef(false)
    const hasStartedRef = useRef(false)

    // Fixed final scale to ensure consistency
    const FINAL_SCALE = 1.0

    // Ensure animation completes even if tab loses focus
    useEffect(() => {
      if (inView && !animationCompleted.current) {
        hasStartedRef.current = true
        
        // Force animation completion after a reasonable time
        const timer = setTimeout(() => {
          if (!animationCompleted.current) {
            animationCompleted.current = true
            onAnimationComplete?.()
          }
        }, 1500) // Reasonable time for animation to complete
        
        return () => clearTimeout(timer)
      }
    }, [inView, onAnimationComplete])

    // Refined frame handler with elegant animation and spin-up effect
    useFrame((state, delta) => {
      if (!meshRef.current || !materialRef.current) return

      // Skip if not in view and animation hasn't started yet
      if (!inView && !hasStartedRef.current) return

      const mesh = meshRef.current
      const material = materialRef.current

      // Skip animations for users who prefer reduced motion
      if (prefersReducedMotion) {
        if (!animationCompleted.current) {
          mesh.scale.setScalar(FINAL_SCALE)
          mesh.position.y = 0
          mesh.rotation.set(0, 0, 0)
          if (!hasCompletedEntrance) {
            animationCompleted.current = true
            onAnimationComplete?.()
          }
        }
        return
      }

      if (startTime.current === null) {
        startTime.current = state.clock.elapsedTime + delay
        // Explicitly set scale to 0 at the start
        mesh.scale.set(0, 0, 0)
        return
      }

      const timeSinceStart = state.clock.elapsedTime - startTime.current
      const entryDuration = 1.5 // Slower, more elegant animation

      if (timeSinceStart < 0) {
        mesh.scale.set(0, 0, 0)
        mesh.position.y = 0
        return
      }

      // Elegant entrance animation with spin-up effect
      if (timeSinceStart < entryDuration) {
        const progress = timeSinceStart / entryDuration

        // Smooth entrance with subtle easing
        const easeOutCubic = 1 - Math.pow(1 - progress, 3)
        const easeOutQuint = 1 - Math.pow(1 - progress, 5)

        // Gradual scale up with NO overshoot to ensure consistent final size
        let scaleProgress = 0

        if (progress < 0.95) {
          // Normal scale up to 95% of the animation
          scaleProgress = easeOutCubic * FINAL_SCALE
        } else {
          // Final 5% of animation - ensure we reach exactly the final scale
          const finalProgress = (progress - 0.95) / 0.05
          scaleProgress = THREE.MathUtils.lerp(easeOutCubic * FINAL_SCALE, FINAL_SCALE, finalProgress)
        }

        // Apply consistent scale
        mesh.scale.setScalar(scaleProgress)

        // Enhanced spin-up effect during reveal
        // More rotation at the beginning that gradually slows down
        const spinRotations = 2 // Number of full rotations during entrance
        const spinEasing = 1 - Math.pow(1 - progress, 4) // Accelerated easing for spin

        // Y-axis spin (horizontal rotation)
        mesh.rotation.y = (1 - spinEasing) * Math.PI * 2 * spinRotations

        // Subtle X-axis tilt that settles
        mesh.rotation.x = (1 - easeOutQuint) * Math.PI * 0.25

        // Subtle color transition
        if ((material as THREE.MeshStandardMaterial).color instanceof THREE.Color) {
          const currentColor = (material as THREE.MeshStandardMaterial).color

          // Start with accent color and transition to default
          if (progress < 0.7) {
            const colorProgress = progress / 0.7
            currentColor.copy(accentColor).lerp(defaultColor, easeOutCubic)
          } else {
            currentColor.copy(defaultColor)
          }

          // Subtle emission during entrance
          if (material.emissiveIntensity !== undefined) {
            material.emissiveIntensity = Math.max(0, 0.5 - progress * 0.5)
          }
        }

        // Subtle material transitions
        if (material.transmission !== undefined) {
          material.transmission = THREE.MathUtils.lerp(0.7, 1, easeOutCubic)
        }

        if (material.distortion !== undefined) {
          material.distortion = THREE.MathUtils.lerp(0.6, 0.4, easeOutCubic)
        }

        if (progress > 0.95 && !hasCompletedEntrance && !animationCompleted.current) {
          // Explicitly set final scale to ensure consistency
          mesh.scale.setScalar(FINAL_SCALE)
          animationCompleted.current = true
          onAnimationComplete?.()
        }
      } else {
        // Ensure the scale is exactly at the final value after animation
        if (Math.abs(mesh.scale.x - FINAL_SCALE) > 0.001) {
          mesh.scale.setScalar(FINAL_SCALE)
        }

        // Refined idle animation after entrance
        const time = state.clock.getElapsedTime()

        // Only update target rotation every few frames for better performance
        if (state.clock.elapsedTime % 0.1 < delta) {
          if (isHovered) {
            targetRotation.current.y = Math.sin(time * 1.2) * 0.15
            targetRotation.current.x = Math.cos(time * 1.0) * 0.1
          } else {
            targetRotation.current.y = Math.sin(time * 0.3) * 0.03
            targetRotation.current.x = Math.cos(time * 0.4) * 0.02
          }
        }

        // Optimize material updates by checking if they need to change
        if (isHovered) {
          if (material.transmission !== undefined && Math.abs(material.transmission - 0.85) > 0.01) {
            material.transmission = THREE.MathUtils.lerp(material.transmission, 0.85, 0.05)
          }
          if (material.distortion !== undefined && Math.abs(material.distortion - 0.5) > 0.01) {
            material.distortion = THREE.MathUtils.lerp(material.distortion, 0.5, 0.05)
          }
        } else {
          if (material.transmission !== undefined && Math.abs(material.transmission - 1) > 0.01) {
            material.transmission = THREE.MathUtils.lerp(material.transmission, 1, 0.05)
          }
          if (material.distortion !== undefined && Math.abs(material.distortion - 0.4) > 0.01) {
            material.distortion = THREE.MathUtils.lerp(material.distortion, 0.4, 0.05)
          }
        }

        // Optimize rotation updates with threshold check and smoother damping
        const rotXDiff = Math.abs(currentRotation.current.x - targetRotation.current.x)
        const rotYDiff = Math.abs(currentRotation.current.y - targetRotation.current.y)

        if (rotXDiff > 0.0005) {
          currentRotation.current.x = THREE.MathUtils.lerp(
            currentRotation.current.x,
            targetRotation.current.x,
            delta * 2.5, // Slower, more elegant movement
          )
          mesh.rotation.x = currentRotation.current.x
        }

        if (rotYDiff > 0.0005) {
          currentRotation.current.y = THREE.MathUtils.lerp(
            currentRotation.current.y,
            targetRotation.current.y,
            delta * 2.5, // Slower, more elegant movement
          )
          mesh.rotation.y = currentRotation.current.y
        }

        // Optimize color updates with threshold check
        if ((material as THREE.MeshStandardMaterial).color instanceof THREE.Color) {
          const targetColor = isHovered ? hoverColor : defaultColor
          const currentColor = (material as THREE.MeshStandardMaterial).color

          if (!currentColor.equals(targetColor)) {
            // Smoother color transition
            currentColor.lerp(targetColor, delta * 2)
          }
        }
      }
    })

    // Enhanced material properties for premium look
    const materialProps = useMemo(
      () => ({
        samples: quality === "high" ? 6 : 3,
        thickness: 0.4,
        roughness: 0.03, // Smoother surface
        transmission: 1,
        ior: 1.6, // Higher index of refraction for more premium look
        chromaticAberration: quality === "high" ? 0.04 : 0.03,
        distortion: 0.4,
        distortionScale: 0.5,
        temporalDistortion: 0.2,
        metalness: 0.8,
        clearcoat: 1.2, // Enhanced clearcoat for premium shine
        attenuationDistance: 0.6,
        attenuationColor: "#ffd700",
        color: "#daa520",
        emissive: "#ffd000",
        emissiveIntensity: 0,
        transparent: true,
        toneMapped: false,
      }),
      [quality],
    )

    return (
      <mesh ref={meshRef} geometry={starGeometry}>
        <MeshTransmissionMaterial ref={materialRef} {...materialProps} />
      </mesh>
    )
  },
)

StarMesh.displayName = "StarMesh"

// Optimized main component with debounced hover state
export const StarAnimation = React.memo(({ delay = 0, onAnimationComplete, inView = true }: StarAnimationProps) => {
  const [dpr, setDpr] = useState(1)
  const [isHovered, setIsHovered] = useState(false)
  const [hasCompletedEntrance, setHasCompletedEntrance] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const prefersReducedMotion = useReducedMotion()
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const completionTimerRef = useRef<NodeJS.Timeout | null>(null)

  // GPU detection with memoized quality setting
  const gpu = useDetectGPU()
  const quality = useMemo(() => {
    return gpu.tier >= 2 ? "high" : "low"
  }, [gpu.tier])

  // Debounced hover handlers to prevent rapid state changes
  const handleMouseEnter = useCallback(() => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current)
    hoverTimeoutRef.current = setTimeout(() => setIsHovered(true), 50)
  }, [])

  const handleMouseLeave = useCallback(() => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current)
    hoverTimeoutRef.current = setTimeout(() => setIsHovered(false), 50)
  }, [])

  // Ensure animation completes even if tab loses focus
  useEffect(() => {
    if (inView && !hasCompletedEntrance) {
      // Force completion after a reasonable time
      completionTimerRef.current = setTimeout(() => {
        if (!hasCompletedEntrance) {
          setHasCompletedEntrance(true)
          onAnimationComplete?.()
        }
      }, 2000) // Reasonable time for the entire animation
    }
    
    return () => {
      if (completionTimerRef.current) {
        clearTimeout(completionTimerRef.current)
      }
    }
  }, [inView, hasCompletedEntrance, onAnimationComplete])

  const handleComplete = useCallback(() => {
    setHasCompletedEntrance(true)
    onAnimationComplete?.()
  }, [onAnimationComplete])

  // Set DPR once on mount
  useEffect(() => {
    setDpr(Math.min(2, window.devicePixelRatio))

    // Clean up hover timeout on unmount
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current)
      }
    }
  }, [])

  // Enhanced canvas settings for premium quality
  const canvasProps = useMemo(
    () => ({
      dpr,
      camera: { position: [0, 0, 2] as [number, number, number], fov: 40 }, // Narrower FOV for more premium look
      className: "w-full h-full",
      style: { background: "transparent" },
      gl: {
        antialias: true,
        alpha: true,
        powerPreference: "high-performance" as WebGLPowerPreference,
        depth: true, // Enable depth for better visual quality
        stencil: false,
      },
    }),
    [dpr],
  )

  // Don't render anything if not in view and animation hasn't started
  if (!inView && !hasCompletedEntrance) {
    return null
  }

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0 }}
      animate={{
        opacity: inView || hasCompletedEntrance ? 1 : 0,
      }}
      transition={{
        duration: 0.3,
        delay: inView ? delay : 0,
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="w-full h-full relative cursor-pointer"
      aria-hidden="true"
    >
      <Canvas {...canvasProps}>
        <Float
          speed={1.5}
          floatIntensity={0.5}
          rotationIntensity={0.5} // Subtle floating effect
        >
          <Center>
            <StarMesh
              isHovered={isHovered}
              hasCompletedEntrance={hasCompletedEntrance}
              onAnimationComplete={handleComplete}
              delay={delay}
              prefersReducedMotion={!!prefersReducedMotion}
              quality={quality}
              inView={inView}
            />
          </Center>
        </Float>

        <ambientLight intensity={0.6} />
        <pointLight position={[5, 5, 5]} intensity={0.7} />
        <pointLight position={[-5, -5, 5]} intensity={0.3} color="#ffd700" />
        <Environment preset="apartment" background={false} />
      </Canvas>

      {/* Subtle glow effect */}
      <AnimatePresence>
        {isHovered && (inView || hasCompletedEntrance) && (
          <motion.div
            className="absolute inset-0 rounded-full pointer-events-none"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{
              scale: 1,
              opacity: 0.4,
            }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 100,
              damping: 20,
            }}
            style={{
              background: "radial-gradient(circle, rgba(255,215,0,0.3) 0%, transparent 70%)",
            }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
})

StarAnimation.displayName = "StarAnimation"

