"use client"

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react"
import { motion, useReducedMotion } from "framer-motion"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { Center, useDetectGPU, Environment } from "@react-three/drei"
import * as THREE from "three"
import { usePreloadedAssets, useStarMaterial } from "@/hooks/use-preloaded-assets"

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
  prefersReducedMotion?: boolean
}

// Constants
const FINAL_SCALE = 0.8

// WebGL context loss handler component
const WebGLContextHandler = () => {
  const { gl } = useThree()

  useEffect(() => {
    const canvas = gl.domElement

    const handleContextLost = (event: Event) => {
      event.preventDefault()
      console.warn("WebGL context lost")
    }

    const handleContextRestored = () => {
      console.log("WebGL context restored")
      // Force a re-render
      gl.render(gl.scene, gl.camera)
    }

    canvas.addEventListener("webglcontextlost", handleContextLost)
    canvas.addEventListener("webglcontextrestored", handleContextRestored)

    return () => {
      canvas.removeEventListener("webglcontextlost", handleContextLost)
      canvas.removeEventListener("webglcontextrestored", handleContextRestored)
    }
  }, [gl])

  return null
}

// Create a fallback star model
const createFallbackStarModel = () => {
  const group = new THREE.Group()
  const geometry = new THREE.IcosahedronGeometry(1, 1)
  const material = new THREE.MeshStandardMaterial({
    color: new THREE.Color("#daa520"),
    emissive: new THREE.Color("#ffd000"),
    emissiveIntensity: 0.2,
    roughness: 0.3,
    metalness: 0.7,
  })
  const mesh = new THREE.Mesh(geometry, material)
  group.add(mesh)
  return group
}

// Star mesh component with material application
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
    const materialRef = useRef<THREE.MeshStandardMaterial | null>(null)
    const animationCompletedRef = useRef(false)
    const animationStartedRef = useRef(false)
    const completionTimeoutRef = useRef<NodeJS.Timeout | null>(null)

    // Get preloaded star model - NEVER triggers loading
    const { starModel, isLoaded } = usePreloadedAssets()

    // Get shared material from the hook
    const sharedMaterial = useStarMaterial("star")

    // Create the material with the specified properties - use shared material if available
    const starMaterial = useMemo(() => {
      if (sharedMaterial) {
        materialRef.current = sharedMaterial as THREE.MeshStandardMaterial
        return sharedMaterial
      }

      // Fallback to creating a new material
      const material = new THREE.MeshStandardMaterial({
        roughness: 0.03,
        metalness: 0.8,
        color: new THREE.Color("#daa520"),
        emissive: new THREE.Color("#ffd000"),
        emissiveIntensity: 0,
        transparent: true,
        toneMapped: false,
      })

      materialRef.current = material
      return material
    }, [sharedMaterial, quality])

    // Clone and prepare the model - use the preloaded model or fallback
    const preparedModel = useMemo(() => {
      // If no model is available, use fallback
      if (!starModel) {
        console.log("StarMesh: No star model available, using fallback")
        return createFallbackStarModel()
      }

      try {
        // Clone the model
        console.log("StarMesh: Cloning preloaded star model")
        const clonedModel = starModel.clone()

        // Apply material to all meshes
        clonedModel.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh
            // Store original material for reference if needed
            if (!mesh.userData.originalMaterial) {
              mesh.userData.originalMaterial = mesh.material
            }
            // Apply our custom material
            mesh.material = starMaterial
          }
        })

        return clonedModel
      } catch (error) {
        console.error("StarMesh: Error preparing star model:", error)
        return createFallbackStarModel()
      }
    }, [starModel, starMaterial])

    // Animation state reference to avoid re-renders
    const animationState = useRef({
      targetRotation: { x: 0, y: 0 },
      currentRotation: { x: 0, y: 0 },
      startTime: null as number | null,
      hasStarted: false,
      lastUpdateTime: 0,
    })

    // Trigger animation completion
    useEffect(() => {
      if (!inView && !animationStartedRef.current) return

      // Once we start the animation, we don't stop it even if inView changes
      animationStartedRef.current = true
      animationState.current.hasStarted = true

      // Set up completion timeout
      if (!animationCompletedRef.current && !completionTimeoutRef.current) {
        completionTimeoutRef.current = setTimeout(() => {
          if (!animationCompletedRef.current) {
            console.log("StarMesh: Animation completion timeout triggered")
            animationCompletedRef.current = true
            onAnimationComplete?.()
          }
        }, 1500)
      }

      return () => {
        if (completionTimeoutRef.current) {
          clearTimeout(completionTimeoutRef.current)
          completionTimeoutRef.current = null
        }
      }
    }, [inView, onAnimationComplete])

    // Handle material updates on hover
    useEffect(() => {
      if (!materialRef.current) return

      // Update material properties on hover
      if (isHovered) {
        materialRef.current.emissiveIntensity = 0.2
      } else {
        materialRef.current.emissiveIntensity = 0
      }
    }, [isHovered])

    // Animation frame updates
    useFrame((state, delta) => {
      if (!groupRef.current) return

      // If animation hasn't started and we're not in view, don't animate
      if (!animationStartedRef.current && !inView) return

      const group = groupRef.current
      const anim = animationState.current

      // Fast path for reduced motion
      if (prefersReducedMotion) {
        if (!animationCompletedRef.current) {
          group.scale.setScalar(FINAL_SCALE)
          group.position.y = 0
          group.rotation.set(0, 0, 0)
          if (!hasCompletedEntrance) {
            animationCompletedRef.current = true
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
        const spinRotations = 2
        const spinEasing = 1 - Math.pow(1 - progress, 4)
        group.rotation.y = (1 - spinEasing) * Math.PI * 2 * spinRotations
        group.rotation.x = (1 - easeOutQuint) * Math.PI * 0.35

        // Fixed position - no movement
        group.position.set(0, 0, 0)

        if (progress > 0.95 && !hasCompletedEntrance && !animationCompletedRef.current) {
          group.scale.setScalar(FINAL_SCALE)
          animationCompletedRef.current = true

          // Clear any pending timeout
          if (completionTimeoutRef.current) {
            clearTimeout(completionTimeoutRef.current)
            completionTimeoutRef.current = null
          }

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

          // Very subtle rotation only - REDUCED rotation values to prevent going out of view
          if (isHovered) {
            // Subtle rotation only when hovered
            anim.targetRotation.y = Math.sin(now * 0.5) * 0.05
            anim.targetRotation.x = Math.cos(now * 0.4) * 0.03
          } else {
            // Very minimal rotation when not hovered
            anim.targetRotation.y = Math.sin(now * 0.2) * 0.05
            anim.targetRotation.x = Math.cos(now * 0.3) * 0.03
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

        // Ensure position is always fixed
        group.position.set(0, 0, 0)
      }
    })

    return (
      <group ref={groupRef}>
        <primitive object={preparedModel} position={[0, 0, 0]} rotation={[0, 0, 0]} scale={[1, 1, 1]} />
      </group>
    )
  },
)

StarMesh.displayName = "StarMesh"

// Main StarAnimation component
export const StarAnimation = React.memo(
  ({
    delay = 0,
    onAnimationComplete,
    inView = true,
    prefersReducedMotion: propsPrefersReducedMotion,
  }: StarAnimationProps) => {
    const hoverStateRef = useRef(false)
    const [hasCompletedEntrance, setHasCompletedEntrance] = useState(false)
    const [hasErrored, setHasErrored] = useState(false)
    const [isRendered, setIsRendered] = useState(false)
    const [hasStartedAnimation, setHasStartedAnimation] = useState(false)
    const completionTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    const hasCalledCompletionRef = useRef(false)

    // Calculate DPR once during initialization
    const dpr = useMemo(() => (typeof window !== "undefined" ? Math.min(1.5, window.devicePixelRatio) : 1), [])

    const containerRef = useRef<HTMLDivElement>(null)
    const systemPrefersReducedMotion = useReducedMotion()
    const prefersReducedMotion = propsPrefersReducedMotion || !!systemPrefersReducedMotion

    // Check if assets are loaded - NEVER triggers loading
    const { isLoaded, starModel } = usePreloadedAssets()

    // Detect GPU capabilities once and memoize the result
    const gpu = useDetectGPU()
    const quality = useMemo(() => {
      return gpu && gpu.tier >= 2 ? "high" : "low"
    }, [gpu])

    // Ensure we render when in view or if animation has started
    useEffect(() => {
      if ((inView && !isRendered) || hasStartedAnimation) {
        console.log("StarAnimation: Component in view or animation started, setting rendered state")
        setIsRendered(true)

        // Once we start rendering, we don't stop
        if (inView && !hasStartedAnimation) {
          setHasStartedAnimation(true)
        }
      }
    }, [inView, isRendered, hasStartedAnimation])

    // Force completion after a timeout
    useEffect(() => {
      if ((inView || hasStartedAnimation) && !hasCompletedEntrance && !hasCalledCompletionRef.current) {
        console.log("StarAnimation: Setting up completion timeout")

        // Clear any existing timeout
        if (completionTimeoutRef.current) {
          clearTimeout(completionTimeoutRef.current)
        }

        completionTimeoutRef.current = setTimeout(() => {
          if (!hasCompletedEntrance && !hasCalledCompletionRef.current) {
            console.log("StarAnimation: Force completing animation after timeout")
            setHasCompletedEntrance(true)
            hasCalledCompletionRef.current = true
            onAnimationComplete?.()
          }
        }, 5000) // Force complete after 5 seconds
      }

      return () => {
        if (completionTimeoutRef.current) {
          clearTimeout(completionTimeoutRef.current)
          completionTimeoutRef.current = null
        }
      }
    }, [inView, hasStartedAnimation, hasCompletedEntrance, onAnimationComplete])

    // Memoize event handlers to prevent recreating on each render
    const handleMouseEnter = useCallback(() => {
      hoverStateRef.current = true
    }, [])

    const handleMouseLeave = useCallback(() => {
      hoverStateRef.current = false
    }, [])

    const handleComplete = useCallback(() => {
      if (completionTimeoutRef.current) {
        clearTimeout(completionTimeoutRef.current)
        completionTimeoutRef.current = null
      }

      if (!hasCalledCompletionRef.current) {
        console.log("StarAnimation: Animation completed")
        setHasCompletedEntrance(true)
        hasCalledCompletionRef.current = true
        onAnimationComplete?.()
      }
    }, [onAnimationComplete])

    // Handle errors in Three.js
    const handleError = useCallback(() => {
      console.error("StarAnimation: Three.js error occurred")
      setHasErrored(true)

      if (!hasCalledCompletionRef.current) {
        setHasCompletedEntrance(true)
        hasCalledCompletionRef.current = true
        onAnimationComplete?.()
      }
    }, [onAnimationComplete])

    // Memoize canvas props to avoid recreating on each render
    const canvasProps = useMemo(
      () => ({
        dpr,
        camera: { position: [0, 0, 2] as [number, number, number], fov: 35 },
        className: "w-full h-full",
        style: { background: "transparent" },
        frameloop: inView || hasStartedAnimation ? "always" : "demand", // Only run animation loop when in view or started
        gl: {
          antialias: quality === "high", // Only use antialias for high quality
          alpha: true,
          powerPreference: "high-performance" as WebGLPowerPreference,
          depth: true,
          stencil: false,
          logarithmicDepthBuffer: true,
        },
        onError: handleError,
      }),
      [dpr, inView, hasStartedAnimation, quality, handleError],
    )

    // Fallback for errors
    if (hasErrored) {
      return (
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-amber-400 flex items-center justify-center text-white text-2xl">
            ★
          </div>
        </div>
      )
    }

    // Show loading state if assets are not yet loaded
    if (!isLoaded || !starModel) {
      console.log("StarAnimation: Assets not loaded, showing placeholder")
      return (
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-amber-400/50 flex items-center justify-center text-white text-2xl animate-pulse">
            ★
          </div>
        </div>
      )
    }

    // Don't render if not in view, hasn't started animation, and hasn't completed entrance
    if (!inView && !hasStartedAnimation && !hasCompletedEntrance && !isRendered) {
      return null
    }

    return (
      <motion.div
        ref={containerRef}
        initial={{ opacity: 0 }}
        animate={{
          opacity: inView || hasStartedAnimation || hasCompletedEntrance ? 1 : 0,
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
          {/* Add WebGL context handler */}
          <WebGLContextHandler />

          <Center>
            <StarMesh
              isHovered={hoverStateRef.current}
              hasCompletedEntrance={hasCompletedEntrance}
              onAnimationComplete={handleComplete}
              delay={0} // No delay since we're handling timing in the parent
              prefersReducedMotion={prefersReducedMotion}
              quality={quality}
              inView={inView || hasStartedAnimation}
            />
          </Center>

          {/* Only render lights and environment when in view or animation has started */}
          {(inView || hasStartedAnimation) && (
            <>
              <ambientLight intensity={0.6} />
              <pointLight position={[5, 5, 5]} intensity={0.7} />
              <pointLight position={[-5, -5, 5]} intensity={0.3} color="#ffd700" />
              <Environment preset="apartment" background={false} />
            </>
          )}
        </Canvas>

        <div
          className="absolute inset-0 rounded-full pointer-events-none transition-opacity duration-300"
          style={{
            opacity: hoverStateRef.current && (inView || hasStartedAnimation || hasCompletedEntrance) ? 0.4 : 0,
            background: "radial-gradient(circle, rgba(255,215,0,0.3) 0%, transparent 70%)",
          }}
        />
      </motion.div>
    )
  },
)

StarAnimation.displayName = "StarAnimation"

