"use client"

import React from "react"
import { motion, useReducedMotion } from "framer-motion"
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

// Memoized star geometry creation - created once and reused
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

// Pre-created color objects to prevent garbage collection
const hoverColor = new THREE.Color("#ffd700")
const defaultColor = new THREE.Color("#daa520")
const accentColor = new THREE.Color("#f8f0e3")

// Optimized StarMesh component with better performance
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

    // Use refs for animation state to avoid re-renders
    const animationState = useRef({
      targetRotation: { x: 0, y: 0 },
      currentRotation: { x: 0, y: 0 },
      startTime: null as number | null,
      animationCompleted: false,
      hasStarted: false,
      lastUpdateTime: 0,
    })

    // Fixed final scale to ensure consistency
    const FINAL_SCALE = 1.0

    // Ensure animation completes even if tab loses focus
    useEffect(() => {
      if (!inView || animationState.current.animationCompleted) return

      animationState.current.hasStarted = true

      // Force animation completion after a reasonable time
      const timer = setTimeout(() => {
        if (!animationState.current.animationCompleted) {
          animationState.current.animationCompleted = true
          onAnimationComplete?.()
        }
      }, 1500)

      return () => clearTimeout(timer)
    }, [inView, onAnimationComplete])

    // Optimized frame handler with reduced calculations
    useFrame((state, delta) => {
      if (!meshRef.current || !materialRef.current) return

      // Skip if not in view and animation hasn't started yet
      if (!inView && !animationState.current.hasStarted) return

      const mesh = meshRef.current
      const material = materialRef.current
      const anim = animationState.current

      // Skip animations for users who prefer reduced motion
      if (prefersReducedMotion) {
        if (!anim.animationCompleted) {
          mesh.scale.setScalar(FINAL_SCALE)
          mesh.position.y = 0
          mesh.rotation.set(0, 0, 0)
          if (!hasCompletedEntrance) {
            anim.animationCompleted = true
            onAnimationComplete?.()
          }
        }
        return
      }

      if (anim.startTime === null) {
        anim.startTime = state.clock.elapsedTime + delay
        // Explicitly set scale to 0 at the start
        mesh.scale.set(0, 0, 0)
        return
      }

      const timeSinceStart = state.clock.elapsedTime - anim.startTime
      const entryDuration = 1.5 // Slower, more elegant animation

      if (timeSinceStart < 0) {
        mesh.scale.set(0, 0, 0)
        mesh.position.y = 0
        return
      }

      // Entrance animation
      if (timeSinceStart < entryDuration) {
        const progress = timeSinceStart / entryDuration

        // Smooth entrance with subtle easing
        const easeOutCubic = 1 - Math.pow(1 - progress, 3)
        const easeOutQuint = 1 - Math.pow(1 - progress, 5)

        // Gradual scale up with NO overshoot
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
        const spinRotations = 2 // Number of full rotations during entrance
        const spinEasing = 1 - Math.pow(1 - progress, 4) // Accelerated easing for spin

        // Y-axis spin (horizontal rotation)
        mesh.rotation.y = (1 - spinEasing) * Math.PI * 2 * spinRotations

        // Subtle X-axis tilt that settles
        mesh.rotation.x = (1 - easeOutQuint) * Math.PI * 0.25

        // Optimize material updates by batching them
        if ((material as THREE.MeshStandardMaterial).color instanceof THREE.Color) {
          const currentColor = (material as THREE.MeshStandardMaterial).color

          // Start with accent color and transition to default
          if (progress < 0.7) {
            currentColor.copy(accentColor).lerp(defaultColor, easeOutCubic)
          } else {
            currentColor.copy(defaultColor)
          }

          // Subtle emission during entrance
          if (material.emissiveIntensity !== undefined) {
            material.emissiveIntensity = Math.max(0, 0.5 - progress * 0.5)
          }
        }

        // Batch material property updates
        if (material.transmission !== undefined) {
          material.transmission = THREE.MathUtils.lerp(0.7, 1, easeOutCubic)
        }

        if (material.distortion !== undefined) {
          material.distortion = THREE.MathUtils.lerp(0.6, 0.4, easeOutCubic)
        }

        if (progress > 0.95 && !hasCompletedEntrance && !anim.animationCompleted) {
          // Explicitly set final scale to ensure consistency
          mesh.scale.setScalar(FINAL_SCALE)
          anim.animationCompleted = true
          onAnimationComplete?.()
        }
      } else {
        // Ensure the scale is exactly at the final value after animation
        if (Math.abs(mesh.scale.x - FINAL_SCALE) > 0.001) {
          mesh.scale.setScalar(FINAL_SCALE)
        }

        // Throttle idle animation updates for better performance
        // Only update every ~100ms instead of every frame
        const now = state.clock.elapsedTime
        const updateInterval = 0.1 // seconds

        if (now - anim.lastUpdateTime > updateInterval) {
          anim.lastUpdateTime = now

          // Update target rotation less frequently
          if (isHovered) {
            anim.targetRotation.y = Math.sin(now * 1.2) * 0.15
            anim.targetRotation.x = Math.cos(now * 1.0) * 0.1
          } else {
            anim.targetRotation.y = Math.sin(now * 0.3) * 0.03
            anim.targetRotation.x = Math.cos(now * 0.4) * 0.02
          }

          // Batch material updates
          if (isHovered) {
            if (material.transmission !== undefined) {
              material.transmission = THREE.MathUtils.lerp(material.transmission, 0.85, 0.1)
            }
            if (material.distortion !== undefined) {
              material.distortion = THREE.MathUtils.lerp(material.distortion, 0.5, 0.1)
            }
          } else {
            if (material.transmission !== undefined) {
              material.transmission = THREE.MathUtils.lerp(material.transmission, 1, 0.1)
            }
            if (material.distortion !== undefined) {
              material.distortion = THREE.MathUtils.lerp(material.distortion, 0.4, 0.1)
            }
          }

          // Batch color updates
          if ((material as THREE.MeshStandardMaterial).color instanceof THREE.Color) {
            const targetColor = isHovered ? hoverColor : defaultColor
            const currentColor = (material as THREE.MeshStandardMaterial).color

            if (!currentColor.equals(targetColor)) {
              currentColor.lerp(targetColor, 0.1)
            }
          }
        }

        // Apply rotation with threshold check to avoid tiny updates
        const rotXDiff = Math.abs(anim.currentRotation.x - anim.targetRotation.x)
        const rotYDiff = Math.abs(anim.currentRotation.y - anim.targetRotation.y)

        if (rotXDiff > 0.0005) {
          anim.currentRotation.x = THREE.MathUtils.lerp(anim.currentRotation.x, anim.targetRotation.x, delta * 2.5)
          mesh.rotation.x = anim.currentRotation.x
        }

        if (rotYDiff > 0.0005) {
          anim.currentRotation.y = THREE.MathUtils.lerp(anim.currentRotation.y, anim.targetRotation.y, delta * 2.5)
          mesh.rotation.y = anim.currentRotation.y
        }
      }
    })

    // Memoized material properties to prevent recreation
    const materialProps = useMemo(
      () => ({
        samples: quality === "high" ? 6 : 3,
        thickness: 0.4,
        roughness: 0.03,
        transmission: 1,
        ior: 1.6,
        chromaticAberration: quality === "high" ? 0.04 : 0.03,
        distortion: 0.4,
        distortionScale: 0.5,
        temporalDistortion: 0.2,
        metalness: 0.8,
        clearcoat: 1.2,
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

// Optimized main component with better state management
export const StarAnimation = React.memo(({ delay = 0, onAnimationComplete, inView = true }: StarAnimationProps) => {
  // Use a ref for hover state to avoid re-renders
  const hoverStateRef = useRef(false)
  const [state, setState] = useState({
    dpr: typeof window !== "undefined" ? Math.min(2, window.devicePixelRatio) : 1,
    hasCompletedEntrance: false,
  })

  const containerRef = useRef<HTMLDivElement>(null)
  const prefersReducedMotion = useReducedMotion()
  const timerRefs = useRef<{
    hover: NodeJS.Timeout | null
    completion: NodeJS.Timeout | null
  }>({
    hover: null,
    completion: null,
  })

  // GPU detection with memoized quality setting
  const gpu = useDetectGPU()
  const quality = useMemo(() => {
    return gpu.tier >= 2 ? "high" : "low"
  }, [gpu.tier])

  // Optimized hover handlers that don't trigger re-renders
  const handleMouseEnter = useCallback(() => {
    if (timerRefs.current.hover) clearTimeout(timerRefs.current.hover)
    timerRefs.current.hover = setTimeout(() => {
      hoverStateRef.current = true
      // Force a small area to repaint without re-rendering the whole component
      if (containerRef.current) {
        containerRef.current.style.transform = "translateZ(0)"
      }
    }, 50)
  }, [])

  const handleMouseLeave = useCallback(() => {
    if (timerRefs.current.hover) clearTimeout(timerRefs.current.hover)
    timerRefs.current.hover = setTimeout(() => {
      hoverStateRef.current = false
      // Force a small area to repaint without re-rendering the whole component
      if (containerRef.current) {
        containerRef.current.style.transform = "translateZ(0)"
      }
    }, 50)
  }, [])

  // Ensure animation completes even if tab loses focus
  useEffect(() => {
    if (inView && !state.hasCompletedEntrance) {
      // Force completion after a reasonable time
      timerRefs.current.completion = setTimeout(() => {
        if (!state.hasCompletedEntrance) {
          setState((prev) => ({ ...prev, hasCompletedEntrance: true }))
          onAnimationComplete?.()
        }
      }, 2000)
    }

    return () => {
      // Clean up all timers on unmount
      Object.values(timerRefs.current).forEach((timer) => {
        if (timer) clearTimeout(timer)
      })
    }
  }, [inView, state.hasCompletedEntrance, onAnimationComplete])

  const handleComplete = useCallback(() => {
    setState((prev) => ({ ...prev, hasCompletedEntrance: true }))
    onAnimationComplete?.()
  }, [onAnimationComplete])

  // Memoized canvas props to prevent recreation
  const canvasProps = useMemo(
    () => ({
      dpr: state.dpr,
      camera: { position: [0, 0, 2] as [number, number, number], fov: 40 },
      className: "w-full h-full",
      style: { background: "transparent" },
      frameloop: inView ? "always" : "demand", // Only animate when in view
      gl: {
        antialias: true,
        alpha: true,
        powerPreference: "high-performance" as WebGLPowerPreference,
        depth: true,
        stencil: false,
        // Add logarithmic depth buffer for better z-fighting prevention
        logarithmicDepthBuffer: true,
      },
    }),
    [state.dpr, inView],
  )

  // Don't render anything if not in view and animation hasn't started
  if (!inView && !state.hasCompletedEntrance) {
    return null
  }

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0 }}
      animate={{
        opacity: inView || state.hasCompletedEntrance ? 1 : 0,
      }}
      transition={{
        duration: 0.3,
        delay: inView ? delay : 0,
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="w-full h-full relative cursor-pointer"
      aria-hidden="true"
      style={{
        willChange: "transform, opacity",
        transform: "translateZ(0)",
        backfaceVisibility: "hidden",
      }}
    >
      <Canvas {...canvasProps}>
        <Float
          speed={1.5}
          floatIntensity={0.5}
          rotationIntensity={0.5}
          floatingRange={[-0.05, 0.05]} // Limit floating range for better performance
        >
          <Center>
            <StarMesh
              isHovered={hoverStateRef.current}
              hasCompletedEntrance={state.hasCompletedEntrance}
              onAnimationComplete={handleComplete}
              delay={delay}
              prefersReducedMotion={!!prefersReducedMotion}
              quality={quality}
              inView={inView}
            />
          </Center>
        </Float>

        {/* Optimized lighting setup */}
        <ambientLight intensity={0.6} />
        <pointLight position={[5, 5, 5]} intensity={0.7} />
        <pointLight position={[-5, -5, 5]} intensity={0.3} color="#ffd700" />
        <Environment preset="apartment" background={false} />
      </Canvas>

      {/* Optimized glow effect using CSS instead of extra divs when possible */}
      <div
        className="absolute inset-0 rounded-full pointer-events-none transition-opacity duration-300"
        style={{
          opacity: hoverStateRef.current && (inView || state.hasCompletedEntrance) ? 0.4 : 0,
          background: "radial-gradient(circle, rgba(255,215,0,0.3) 0%, transparent 70%)",
          transform: "translateZ(0)",
        }}
      />
    </motion.div>
  )
})

StarAnimation.displayName = "StarAnimation"

