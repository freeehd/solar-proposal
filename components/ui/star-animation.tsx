"use client"

import React from "react"
import { motion, useReducedMotion } from "framer-motion"
import { useState, useEffect, useRef, useMemo, useCallback } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { Center, useDetectGPU, Environment } from "@react-three/drei"
import * as THREE from "three"
import { useGLTF } from "@react-three/drei"

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

// Preload the star model to improve performance
useGLTF.preload("/models/gold_star.glb")

// Pre-create colors to avoid creating new instances in render loops
const hoverColor = new THREE.Color("#ffd700")
const defaultColor = new THREE.Color("#daa520")
const accentColor = new THREE.Color("#f8f0e3")

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
    const groupRef = useRef<THREE.Group>(null)
    const { scene } = useGLTF("/models/gold_star.glb") as any

    // Clone the scene to avoid issues with multiple instances
    const starModel = useMemo(() => scene.clone(), [scene])

    // Use a ref for animation state to avoid re-renders
    const animationState = useRef({
      targetRotation: { x: 0, y: 0 },
      currentRotation: { x: 0, y: 0 },
      startTime: null as number | null,
      animationCompleted: false,
      hasStarted: false,
      lastUpdateTime: 0,
    })

    const FINAL_SCALE = 0.1 // Reduced scale for smaller icon size

    // Apply initial material settings to all meshes in the model
    useEffect(() => {
      // Center the model by adjusting its position if needed
      starModel.position.set(0, 0, 0)

      // Adjust initial rotation to ensure the star is oriented correctly
      starModel.rotation.set(0, 0, 0)

      starModel.traverse((child: THREE.Object3D) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh
          if (mesh.material) {
            // Ensure material is a MeshStandardMaterial or similar
            const material = mesh.material as THREE.MeshStandardMaterial
            material.emissive = new THREE.Color(0xCCAC00)
            material.emissiveIntensity = 0
            material.metalness = 0.9
            material.roughness = 0.8
            
          }
        }
      })
    }, [starModel])

    // Optimize effect to run only when necessary
    useEffect(() => {
      if (!inView || animationState.current.animationCompleted) return

      animationState.current.hasStarted = true

      const timer = setTimeout(() => {
        if (!animationState.current.animationCompleted) {
          animationState.current.animationCompleted = true
          onAnimationComplete?.()
        }
      }, 1500)

      return () => clearTimeout(timer)
    }, [inView, onAnimationComplete])

    // Optimize frame updates with throttling and early returns
    useFrame((state, delta) => {
      if (!groupRef.current) return
      if (!inView && !animationState.current.hasStarted) return

      const group = groupRef.current
      const anim = animationState.current

      // Fast path for reduced motion
      if (prefersReducedMotion) {
        if (!anim.animationCompleted) {
          group.scale.setScalar(FINAL_SCALE)
          group.position.y = 0
          group.rotation.set(0, 0, 0)
          if (!hasCompletedEntrance) {
            anim.animationCompleted = true
            onAnimationComplete?.()
          }
        }
        return
      }

      // Initialize animation timing
      if (anim.startTime === null) {
        anim.startTime = state.clock.elapsedTime + delay
        group.scale.set(0, 0, 0)
        return
      }

      const timeSinceStart = state.clock.elapsedTime - anim.startTime
      const entryDuration = 0.8 // Reduced for faster animation

      if (timeSinceStart < 0) {
        group.scale.set(0, 0, 0)
        group.position.y = 0
        return
      }

      // Entrance animation
      if (timeSinceStart < entryDuration) {
        const progress = timeSinceStart / entryDuration
        const easeOutCubic = 1 - Math.pow(1 - progress, 3)
        const easeOutQuint = 1 - Math.pow(1 - progress, 5)

        let scaleProgress = 0
        if (progress < 0.95) {
          scaleProgress = easeOutCubic * FINAL_SCALE
        } else {
          const finalProgress = (progress - 0.95) / 0.05
          scaleProgress = THREE.MathUtils.lerp(easeOutCubic * FINAL_SCALE, FINAL_SCALE, finalProgress)
        }
        group.scale.setScalar(scaleProgress)

        // Modified rotation animation to be more subtle
        const spinRotations = 2 // Reduced from 2
        const spinEasing = 1 - Math.pow(1 - progress, 4)
        group.rotation.y = (1 - spinEasing) * Math.PI * 2 * spinRotations

        // Add a slight upward tilt at the start that levels out
        group.rotation.x = (1 - easeOutQuint) * Math.PI * 0.35 // Reduced from 0.25


        // No bounce effect - keep position fixed
        group.position.y = 0

        // Update material emissive intensity
        starModel.traverse((child: THREE.Object3D) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh
            if (mesh.material) {
              const material = mesh.material as THREE.MeshStandardMaterial
              material.emissiveIntensity = 0
            }
          }
        })

        if (progress > 0.95 && !hasCompletedEntrance && !anim.animationCompleted) {
          group.scale.setScalar(FINAL_SCALE)
          anim.animationCompleted = true
          onAnimationComplete?.()
        }
      } else {
        // Idle animation - throttle updates for better performance
        if (Math.abs(group.scale.x - FINAL_SCALE) > 0.001) {
          group.scale.setScalar(FINAL_SCALE)
        }

        // Keep position fixed - no movement
        group.position.set(0, 0, 0)

        const now = state.clock.elapsedTime
        const updateInterval = 0.1 // Throttle updates to every 100ms

        if (now - anim.lastUpdateTime > updateInterval) {
          anim.lastUpdateTime = now

          // Very subtle rotation only
          if (isHovered) {
            anim.targetRotation.y = Math.sin(now * 0.5) * 0.1
            anim.targetRotation.x = Math.cos(now * 0.4) * 0.1
          } else {
            anim.targetRotation.y = Math.sin(now * 0.2) * 0.2
            anim.targetRotation.x = Math.cos(now * 0.3) * 0.21
          }
        }

        // Only update rotation if there's a significant change
        const rotXDiff = Math.abs(anim.currentRotation.x - anim.targetRotation.x)
        const rotYDiff = Math.abs(anim.currentRotation.y - anim.targetRotation.y)

        if (rotXDiff > 0.0005) {
          anim.currentRotation.x = THREE.MathUtils.lerp(anim.currentRotation.x, anim.targetRotation.x, delta * 1.5)
          group.rotation.x = anim.currentRotation.x
        }

        if (rotYDiff > 0.0005) {
          anim.currentRotation.y = THREE.MathUtils.lerp(anim.currentRotation.y, anim.targetRotation.y, delta * 1.5)
          group.rotation.y = anim.currentRotation.y
        }
      }
    })

    return (
      <group ref={groupRef}>
        <primitive
          object={starModel}
          position={[0, -3, 10]}
          rotation={[0, 0, 0]}
          scale={[1, 1, 1]} // Initial scale will be animated
        />
      </group>
    )
  },
)

StarMesh.displayName = "StarMesh"

export const StarAnimation = React.memo(({ delay = 0, onAnimationComplete, inView = true }: StarAnimationProps) => {
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

  // Detect GPU capabilities once and memoize the result
  const gpu = useDetectGPU()
  const quality = useMemo(() => {
    return gpu.tier >= 2 ? "high" : "low"
  }, [gpu.tier])

  // Memoize event handlers to prevent recreating on each render
  const handleMouseEnter = useCallback(() => {
    if (timerRefs.current.hover) clearTimeout(timerRefs.current.hover)
    timerRefs.current.hover = setTimeout(() => {
      hoverStateRef.current = true
    }, 50)
  }, [])

  const handleMouseLeave = useCallback(() => {
    if (timerRefs.current.hover) clearTimeout(timerRefs.current.hover)
    timerRefs.current.hover = setTimeout(() => {
      hoverStateRef.current = false
    }, 50)
  }, [])

  // Optimize effect to run only when necessary
  useEffect(() => {
    if (inView && !state.hasCompletedEntrance) {
      timerRefs.current.completion = setTimeout(() => {
        if (!state.hasCompletedEntrance) {
          setState((prev) => ({ ...prev, hasCompletedEntrance: true }))
          onAnimationComplete?.()
        }
      }, 1000) // Reduced from 1500 for faster completion
    }

    return () => {
      Object.values(timerRefs.current).forEach((timer) => {
        if (timer) clearTimeout(timer)
      })
    }
  }, [inView, state.hasCompletedEntrance, onAnimationComplete])

  const handleComplete = useCallback(() => {
    setState((prev) => ({ ...prev, hasCompletedEntrance: true }))
    onAnimationComplete?.()
  }, [onAnimationComplete])

  // Memoize canvas props to avoid recreating on each render
  const canvasProps = useMemo(
    () => ({
      dpr: state.dpr,
      camera: { position: [0, 0, 2] as [number, number, number], fov: 35 }, // Adjusted camera position and FOV
      className: "w-full h-full",
      style: { background: "transparent" },
      frameloop: inView ? "always" : "demand", // Only run animation loop when in view
      gl: {
        antialias: true,
        alpha: true,
        powerPreference: "high-performance" as WebGLPowerPreference,
        depth: true,
        stencil: false,
        logarithmicDepthBuffer: true,
      },
    }),
    [state.dpr, inView],
  )

  // Early return if not in view and animation not completed
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
        duration: 0.2, // Faster fade-in
        delay: 0, // No delay since we're handling timing in the parent
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="w-full h-full relative cursor-pointer"
      aria-hidden="true"
      style={{
        willChange: "opacity",
        backfaceVisibility: "hidden",
      }}
    >
      <Canvas {...canvasProps}>
        {/* Removed Float component completely to eliminate all floating motion */}
        <Center>
          <StarMesh
            isHovered={hoverStateRef.current}
            hasCompletedEntrance={state.hasCompletedEntrance}
            onAnimationComplete={handleComplete}
            delay={0} // No delay since we're handling timing in the parent
            prefersReducedMotion={!!prefersReducedMotion}
            quality={quality}
            inView={inView}
          />
        </Center>

        <ambientLight intensity={0.6} />
        <pointLight position={[5, 5, 5]} intensity={0.7} />
        <pointLight position={[-5, -5, 5]} intensity={0.3} color="#ffd700" />
        <Environment preset="apartment" background={false} />
      </Canvas>

      <div
        className="absolute inset-0 rounded-full pointer-events-none transition-opacity duration-300"
        style={{
          opacity: hoverStateRef.current && (inView || state.hasCompletedEntrance) ? 0.4 : 0,
          background: "radial-gradient(circle, rgba(255,215,0,0.3) 0%, transparent 70%)",
        }}
      />
    </motion.div>
  )
})

StarAnimation.displayName = "StarAnimation"

