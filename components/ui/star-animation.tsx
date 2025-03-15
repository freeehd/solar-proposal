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

type CustomMaterial = THREE.MeshPhysicalMaterial & {
  distortion?: number
  transmission?: number
  distortionScale?: number
  temporalDistortion?: number
}

const starGeometry = (() => {
  const shape = new THREE.Shape()
  const numPoints = 5
  const outerRadius = 0.6
  const innerRadius = 0.22

  const points = []
  for (let i = 0; i <= numPoints * 2; i++) {
    const angle = (i * Math.PI) / numPoints
    const radius = i % 2 === 0 ? outerRadius : innerRadius
    const x = Math.sin(angle) * radius
    const y = Math.cos(angle) * radius
    points.push([x, y])
  }

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
    const meshRef = useRef<Mesh>(null)
    const materialRef = useRef<CustomMaterial>(null)

    const animationState = useRef({
      targetRotation: { x: 0, y: 0 },
      currentRotation: { x: 0, y: 0 },
      startTime: null as number | null,
      animationCompleted: false,
      hasStarted: false,
      lastUpdateTime: 0,
    })

    const FINAL_SCALE = 1.0

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

    useFrame((state, delta) => {
      if (!meshRef.current || !materialRef.current) return
      if (!inView && !animationState.current.hasStarted) return

      const mesh = meshRef.current
      const material = materialRef.current
      const anim = animationState.current

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
        mesh.scale.set(0, 0, 0)
        return
      }

      const timeSinceStart = state.clock.elapsedTime - anim.startTime
      const entryDuration = 1.0 // Reduced from 1.5 to make the animation faster

      if (timeSinceStart < 0) {
        mesh.scale.set(0, 0, 0)
        mesh.position.y = 0
        return
      }

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
        mesh.scale.setScalar(scaleProgress)

        // Modified rotation animation to be more subtle
        const spinRotations = 1 // Reduced from 2
        const spinEasing = 1 - Math.pow(1 - progress, 4)
        mesh.rotation.y = (1 - spinEasing) * Math.PI * 2 * spinRotations

        // Add a slight upward tilt at the start that levels out
        mesh.rotation.x = (1 - easeOutQuint) * Math.PI * 0.15 // Reduced from 0.25

        // Add a small bounce effect
        if (progress > 0.7 && progress < 0.9) {
          const bounceProgress = (progress - 0.7) / 0.2
          const bounce = Math.sin(bounceProgress * Math.PI) * 0.1
          mesh.position.y = bounce
        } else if (progress >= 0.9) {
          mesh.position.y = 0
        }

        if ((material as THREE.MeshStandardMaterial).color instanceof THREE.Color) {
          const currentColor = (material as THREE.MeshStandardMaterial).color
          if (progress < 0.7) {
            currentColor.copy(accentColor).lerp(defaultColor, easeOutCubic)
          } else {
            currentColor.copy(defaultColor)
          }
          if (material.emissiveIntensity !== undefined) {
            material.emissiveIntensity = Math.max(0, 0.5 - progress * 0.5)
          }
        }

        if (material.transmission !== undefined) {
          material.transmission = THREE.MathUtils.lerp(0.7, 1, easeOutCubic)
        }

        if (material.distortion !== undefined) {
          material.distortion = THREE.MathUtils.lerp(0.6, 0.4, easeOutCubic)
        }

        if (progress > 0.95 && !hasCompletedEntrance && !anim.animationCompleted) {
          mesh.scale.setScalar(FINAL_SCALE)
          anim.animationCompleted = true
          onAnimationComplete?.()
        }
      } else {
        if (Math.abs(mesh.scale.x - FINAL_SCALE) > 0.001) {
          mesh.scale.setScalar(FINAL_SCALE)
        }

        const now = state.clock.elapsedTime
        const updateInterval = 0.1

        if (now - anim.lastUpdateTime > updateInterval) {
          anim.lastUpdateTime = now

          if (isHovered) {
            anim.targetRotation.y = Math.sin(now * 1.2) * 0.15
            anim.targetRotation.x = Math.cos(now * 1.0) * 0.1
          } else {
            anim.targetRotation.y = Math.sin(now * 0.3) * 0.03
            anim.targetRotation.x = Math.cos(now * 0.4) * 0.02
          }

          if (isHovered) {
            if (material.transmission !== undefined && Math.abs(material.transmission - 0.85) > 0.005) {
              material.transmission = THREE.MathUtils.lerp(material.transmission, 0.85, 0.1)
            }
            if (material.distortion !== undefined && Math.abs(material.distortion - 0.5) > 0.005) {
              material.distortion = THREE.MathUtils.lerp(material.distortion, 0.5, 0.1)
            }
          } else {
            if (material.transmission !== undefined && Math.abs(material.transmission - 1) > 0.005) {
              material.transmission = THREE.MathUtils.lerp(material.transmission, 1, 0.1)
            }
            if (material.distortion !== undefined && Math.abs(material.distortion - 0.4) > 0.005) {
              material.distortion = THREE.MathUtils.lerp(material.distortion, 0.4, 0.1)
            }
          }

          if ((material as THREE.MeshStandardMaterial).color instanceof THREE.Color) {
            const targetColor = isHovered ? hoverColor : defaultColor
            const currentColor = (material as THREE.MeshStandardMaterial).color
            if (!currentColor.equals(targetColor)) {
              currentColor.lerp(targetColor, 0.1)
            }
          }
        }

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

  const gpu = useDetectGPU()
  const quality = useMemo(() => {
    return gpu.tier >= 2 ? "high" : "low"
  }, [gpu.tier])

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

  useEffect(() => {
    if (inView && !state.hasCompletedEntrance) {
      timerRefs.current.completion = setTimeout(() => {
        if (!state.hasCompletedEntrance) {
          setState((prev) => ({ ...prev, hasCompletedEntrance: true }))
          onAnimationComplete?.()
        }
      }, 1500) // Reduced from 2000 to match the faster animation
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

  const canvasProps = useMemo(
    () => ({
      dpr: state.dpr,
      camera: { position: [0, 0, 2] as [number, number, number], fov: 40 },
      className: "w-full h-full",
      style: { background: "transparent" },
      frameloop: inView ? "always" : "demand",
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
        <Float speed={1.5} floatIntensity={0.5} rotationIntensity={0.5} floatingRange={[-0.05, 0.05]}>
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
        </Float>

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

