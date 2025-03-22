"use client"

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react"
import { motion, useReducedMotion } from "framer-motion"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { Center, useDetectGPU, Environment } from "@react-three/drei"
import * as THREE from "three"
import { useGLTF } from "@react-three/drei"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"

// Preload the model globally
useGLTF.preload("/models/star.glb")

// Global model cache
let cachedStarModel: THREE.Group | null = null
let isModelLoading = false
let modelLoadPromise: Promise<THREE.Group> | null = null

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

// Function to load the model once and cache it
const loadStarModel = (): Promise<THREE.Group> => {
  if (cachedStarModel) {
    return Promise.resolve(cachedStarModel)
  }

  if (modelLoadPromise) {
    return modelLoadPromise
  }

  isModelLoading = true

  modelLoadPromise = new Promise((resolve, reject) => {
    const loader = new GLTFLoader()
    loader.load(
      "/models/star.glb",
      (gltf) => {
        try {
          const model = gltf.scene.clone()

          // Center the model
          model.position.set(0, 0, 0)
          model.rotation.set(0, 0, 0)

          cachedStarModel = model
          isModelLoading = false
          resolve(model)
        } catch (error) {
          console.error("Error processing star model:", error)
          reject(error)
        }
      },
      (progress) => {
        if (progress.lengthComputable) {
          const percentComplete = (progress.loaded / progress.total) * 100
          console.log(`Star model loading: ${Math.round(percentComplete)}%`)
        }
      },
      (error) => {
        console.error("Error loading star model:", error)
        isModelLoading = false
        reject(error)
      },
    )
  })

  return modelLoadPromise
}

// Start loading the model immediately
if (typeof window !== "undefined") {
  loadStarModel().catch(console.error)
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
    const materialRef = useRef<THREE.MeshPhysicalMaterial | null>(null)
    const { gl } = useThree()

    // Error handling for model loading
    const [loadError, setLoadError] = useState(false)
    const [model, setModel] = useState<THREE.Group | null>(null)

    // Create the material with the specified properties
    const starMaterial = useMemo(() => {
      const material = new THREE.MeshPhysicalMaterial({
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
        attenuationColor: new THREE.Color("#ffd700"),
        color: new THREE.Color("#daa520"),
        emissive: new THREE.Color("#ffd000"),
        emissiveIntensity: 0,
        transparent: true,
        toneMapped: false,
      })

      materialRef.current = material
      return material
    }, [quality])

    // Load the model when the component mounts
    useEffect(() => {
      let isMounted = true

      const loadModel = async () => {
        try {
          const loadedModel = await loadStarModel()
          if (isMounted) {
            // Clone the model
            const clonedModel = loadedModel.clone()

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

            setModel(clonedModel)
          }
        } catch (error) {
          console.error("Error loading star model in component:", error)
          if (isMounted) {
            setLoadError(true)
          }
        }
      }

      loadModel()

      return () => {
        isMounted = false
      }
    }, [starMaterial])

    // Create a fallback model if loading fails
    const starModelOrFallback = useMemo(() => {
      if (loadError || !model) {
        // Create a fallback geometry if model fails to load
        const geometry = new THREE.IcosahedronGeometry(1, 1)
        const mesh = new THREE.Mesh(geometry, starMaterial)

        const group = new THREE.Group()
        group.add(mesh)
        return group
      }

      return model
    }, [model, loadError, starMaterial])

    // Animation state reference to avoid re-renders
    const animationState = useRef({
      targetRotation: { x: 0, y: 0 },
      currentRotation: { x: 0, y: 0 },
      startTime: null as number | null,
      animationCompleted: false,
      hasStarted: false,
      lastUpdateTime: 0,
    })

    // Trigger animation completion
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
        const spinRotations = 2
        const spinEasing = 1 - Math.pow(1 - progress, 4)
        group.rotation.y = (1 - spinEasing) * Math.PI * 2 * spinRotations
        group.rotation.x = (1 - easeOutQuint) * Math.PI * 0.35

        // Fixed position - no movement
        group.position.set(0, 0, 0)

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
        <primitive object={starModelOrFallback} position={[0, 0, 0]} rotation={[0, 0, 0]} scale={[1, 1, 1]} />
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
    const [isModelPreloaded, setIsModelPreloaded] = useState(!!cachedStarModel)

    // Calculate DPR once during initialization
    const dpr = useMemo(() => (typeof window !== "undefined" ? Math.min(1.5, window.devicePixelRatio) : 1), [])

    const containerRef = useRef<HTMLDivElement>(null)
    const systemPrefersReducedMotion = useReducedMotion()
    const prefersReducedMotion = propsPrefersReducedMotion || !!systemPrefersReducedMotion

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
      return gpu && gpu.tier >= 2 ? "high" : "low"
    }, [gpu])

    // Preload the model when the component mounts
    useEffect(() => {
      if (isModelPreloaded) return

      loadStarModel()
        .then(() => {
          setIsModelPreloaded(true)
        })
        .catch((error) => {
          console.error("Error preloading star model in StarAnimation:", error)
          setHasErrored(true)
        })

      // Set a timeout to prevent indefinite loading
      const timeout = setTimeout(() => {
        if (!isModelPreloaded) {
          console.warn("Star model preloading timed out in StarAnimation")
          setIsModelPreloaded(true)
        }
      }, 5000)

      return () => clearTimeout(timeout)
    }, [isModelPreloaded])

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
      if (inView && !hasCompletedEntrance) {
        timerRefs.current.completion = setTimeout(() => {
          if (!hasCompletedEntrance) {
            setHasCompletedEntrance(true)
            onAnimationComplete?.()
          }
        }, 1000) // Reduced from 1500 for faster completion
      }

      // Fallback timer in case of errors
      const fallbackTimer = setTimeout(() => {
        if (!hasCompletedEntrance) {
          setHasCompletedEntrance(true)
          setHasErrored(true)
          onAnimationComplete?.()
        }
      }, 5000)

      return () => {
        Object.values(timerRefs.current).forEach((timer) => {
          if (timer) clearTimeout(timer)
        })
        clearTimeout(fallbackTimer)
      }
    }, [inView, hasCompletedEntrance, onAnimationComplete])

    const handleComplete = useCallback(() => {
      setHasCompletedEntrance(true)
      onAnimationComplete?.()
    }, [onAnimationComplete])

    // Handle errors in Three.js
    const handleError = useCallback(() => {
      setHasErrored(true)
      setHasCompletedEntrance(true)
      onAnimationComplete?.()
    }, [onAnimationComplete])

    // Memoize canvas props to avoid recreating on each render
    const canvasProps = useMemo(
      () => ({
        dpr,
        camera: { position: [0, 0, 2] as [number, number, number], fov: 35 },
        className: "w-full h-full",
        style: { background: "transparent" },
        frameloop: inView ? "always" : "demand", // Only run animation loop when in view
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
      [dpr, inView, quality, handleError],
    )

    // Early return if not in view and animation not completed
    if (!inView && !hasCompletedEntrance) {
      return null
    }

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

    // Show loading state if model is not yet preloaded
    if (!isModelPreloaded) {
      return (
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-amber-400/50 flex items-center justify-center text-white text-2xl animate-pulse">
            ★
          </div>
        </div>
      )
    }

    return (
      <motion.div
        ref={containerRef}
        initial={{ opacity: 0 }}
        animate={{
          opacity: inView || hasCompletedEntrance ? 1 : 0,
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
          <Center>
            <StarMesh
              isHovered={hoverStateRef.current}
              hasCompletedEntrance={hasCompletedEntrance}
              onAnimationComplete={handleComplete}
              delay={0} // No delay since we're handling timing in the parent
              prefersReducedMotion={prefersReducedMotion}
              quality={quality}
              inView={inView}
            />
          </Center>

          {/* Only render lights and environment when in view */}
          {inView && (
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
            opacity: hoverStateRef.current && (inView || hasCompletedEntrance) ? 0.4 : 0,
            background: "radial-gradient(circle, rgba(255,215,0,0.3) 0%, transparent 70%)",
          }}
        />
      </motion.div>
    )
  },
)

StarAnimation.displayName = "StarAnimation"

