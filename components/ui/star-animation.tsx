"use client"

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react"
import { motion, useReducedMotion } from "framer-motion"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { Center, useDetectGPU, Environment } from "@react-three/drei"
import * as THREE from "three"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"

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

// Add the model URLs
const STAR_MODEL_URL = "/models/star.glb"
const FALLBACK_STAR_MODEL_URL = "/models/star.gltf"

// Global model cache to prevent reloading
const modelCache = {
  primary: null as THREE.Group | null,
  fallback: null as THREE.Group | null,
  simple: null as THREE.Group | null,
  loading: false,
  error: null as Error | null,
  loadPromise: null as Promise<THREE.Group> | null,
  initialized: false,
}

// Platform detection
const isMacOS =
  typeof navigator !== "undefined" &&
  (/Mac/.test(navigator.platform) ||
    (/Mac/.test(navigator.userAgent) && /(Safari|AppleWebKit)/.test(navigator.userAgent)))

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

// Create a star model on demand - no preloading required
const createStarModel = () => {
  // Return cached model if available
  if (modelCache.simple) {
    return modelCache.simple.clone()
  }

  console.log("Creating simple star model")
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

  // Cache the model
  modelCache.simple = group.clone()

  return group
}

// Process the loaded model to optimize it
const processModel = (model: THREE.Group) => {
  model.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      const mesh = child as THREE.Mesh

      // Create an optimized material
      const material = new THREE.MeshStandardMaterial({
        roughness: 0.03,
        metalness: 0.8,
        color: new THREE.Color("#daa520"),
        emissive: new THREE.Color("#ffd000"),
        emissiveIntensity: 0,
        transparent: true,
        toneMapped: false,
      })

      // Apply the material
      mesh.material = material

      // Optimize geometry if needed
      if (mesh.geometry && !mesh.geometry.attributes.normal) {
        mesh.geometry.computeVertexNormals()
      }
    }
  })

  return model
}

// Preload the star model to ensure it's available immediately
const preloadStarModel = (): Promise<THREE.Group> => {
  // If we already have the model cached, return it immediately
  if (modelCache.primary) {
    return Promise.resolve(modelCache.primary.clone())
  }

  // If we're already loading, return the existing promise
  if (modelCache.loading && modelCache.loadPromise) {
    return modelCache.loadPromise.then((model) => model.clone())
  }

  // Start loading
  modelCache.loading = true

  const loadPromise = new Promise<THREE.Group>((resolve, reject) => {
    // Create a simple model immediately for initial rendering
    const simpleModel = createStarModel()

    // If we don't have a simple model cached, cache it now
    if (!modelCache.simple) {
      modelCache.simple = simpleModel.clone()
    }

    // Resolve immediately with the simple model to prevent delays
    // This ensures we have something to show right away
    resolve(simpleModel)

    const loader = new GLTFLoader()
    loader.setCrossOrigin("anonymous")

    // Add specific headers for Safari/macOS if needed
    if (isMacOS) {
      console.log("Using macOS-specific loading configuration")
    }

    // First try the primary URL
    loader.load(
      STAR_MODEL_URL,
      (gltf) => {
        console.log("Star model loaded successfully from primary URL")

        const loadedModel = gltf.scene.clone()
        processModel(loadedModel)

        // Cache the model
        modelCache.primary = loadedModel.clone()
        modelCache.loading = false
        modelCache.initialized = true

        // We don't resolve here since we already resolved with the simple model
      },
      (progress) => {
        // Loading progress
        if (progress.lengthComputable) {
          const percentComplete = Math.round((progress.loaded / progress.total) * 100)
          console.log(`Loading star model: ${percentComplete}%`)
        }
      },
      (error) => {
        console.warn("Error loading primary star model, trying fallback:", error)

        // Try the fallback URL
        loader.load(
          FALLBACK_STAR_MODEL_URL,
          (gltf) => {
            console.log("Star model loaded successfully from fallback URL")

            const loadedModel = gltf.scene.clone()
            processModel(loadedModel)

            // Cache the fallback model
            modelCache.fallback = loadedModel.clone()
            modelCache.loading = false
            modelCache.initialized = true

            // We don't resolve here since we already resolved with the simple model
          },
          undefined,
          (fallbackError) => {
            console.error("Error loading fallback star model, using simple model:", fallbackError)

            // We're already using the simple model, so just update the cache state
            modelCache.loading = false
            modelCache.error = fallbackError
            modelCache.initialized = true
          },
        )
      },
    )
  })

  // Store the promise in the cache
  modelCache.loadPromise = loadPromise

  return loadPromise
}

// Initialize model loading immediately
if (typeof window !== "undefined" && !modelCache.initialized) {
  // Create a simple model immediately to ensure it's available
  createStarModel()

  // Start loading the detailed model in the background
  preloadStarModel().catch((err) => {
    console.error("Error preloading star model:", err)
  })
}

// Update the StarMesh component to use the preloaded model
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
    const [model, setModel] = useState<THREE.Group | null>(null)
    const modelUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    const inViewRef = useRef(inView)

    // Update inViewRef when inView changes
    useEffect(() => {
      inViewRef.current = inView
    }, [inView])

    // Use the simple model immediately to ensure something is rendered
    const fallbackStarModel = useMemo(() => {
      return modelCache.simple ? modelCache.simple.clone() : createStarModel()
    }, [])

    // Load the model when the component mounts - use the simple model first, then update
    useEffect(() => {
      // Always start with the simple model for immediate rendering
      if (!model) {
        setModel(fallbackStarModel)
      }

      // Try to get the detailed model from cache
      const loadDetailedModel = async () => {
        try {
          // Check if we already have the primary model cached
          if (modelCache.primary) {
            // Use a short timeout to allow the simple model to render first
            modelUpdateTimeoutRef.current = setTimeout(() => {
              setModel(modelCache.primary!.clone())
            }, 100)
          } else {
            // Load the model - this will return the simple model immediately
            // but will load the detailed model in the background
            const initialModel = await preloadStarModel()

            // If we don't have a model yet, use the initial model
            if (!model) {
              setModel(initialModel)
            }

            // Set up a check to update to the detailed model when it's available
            const checkForDetailedModel = () => {
              if (modelCache.primary) {
                setModel(modelCache.primary.clone())
              } else if (modelCache.fallback) {
                setModel(modelCache.fallback.clone())
              } else if (!modelCache.loading && modelCache.initialized) {
                // If loading is complete but we don't have a detailed model, stick with the simple one
                return
              } else {
                // Check again in a moment
                modelUpdateTimeoutRef.current = setTimeout(checkForDetailedModel, 500)
              }
            }

            // Start checking for the detailed model
            modelUpdateTimeoutRef.current = setTimeout(checkForDetailedModel, 500)
          }
        } catch (error) {
          console.error("Error loading star model:", error)
          // We're already using the fallback model, so no need to do anything
        }
      }

      loadDetailedModel()

      // Set up completion timeout only if in view
      if (inView && !animationCompletedRef.current && !completionTimeoutRef.current) {
        completionTimeoutRef.current = setTimeout(() => {
          if (!animationCompletedRef.current) {
            console.log("StarMesh: Animation completion timeout triggered")
            animationCompletedRef.current = true
            onAnimationComplete?.()
          }
        }, 800) // Reduced timeout for faster completion
      }

      return () => {
        if (completionTimeoutRef.current) {
          clearTimeout(completionTimeoutRef.current)
          completionTimeoutRef.current = null
        }
        if (modelUpdateTimeoutRef.current) {
          clearTimeout(modelUpdateTimeoutRef.current)
          modelUpdateTimeoutRef.current = null
        }
      }
    }, [fallbackStarModel, model, onAnimationComplete, inView])

    // Create the material with the specified properties
    const starMaterial = useMemo(() => {
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
    }, [quality])

    // Animation state reference to avoid re-renders
    const animationState = useRef({
      targetRotation: { x: 0, y: 0 },
      currentRotation: { x: 0, y: 0 },
      startTime: null as number | null,
      hasStarted: false,
      lastUpdateTime: 0,
    })

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

      const group = groupRef.current
      const anim = animationState.current

      // If not in view, hide the star completely
      if (!inViewRef.current) {
        group.scale.setScalar(0)
        return
      }

      // Start animation only when in view
      if (!animationStartedRef.current && inViewRef.current) {
        animationStartedRef.current = true
        anim.startTime = state.clock.elapsedTime + delay
      }

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
        // Start at zero scale
        group.scale.setScalar(0)
        return
      }

      const timeSinceStart = state.clock.elapsedTime - anim.startTime
      const entryDuration = 0.6 // Animation duration

      if (timeSinceStart < 0) {
        // Keep hidden during delay
        group.scale.setScalar(0)
        group.position.y = 0
        return
      }

      // Entrance animation
      if (timeSinceStart < entryDuration) {
        const progress = timeSinceStart / entryDuration
        const easeOutCubic = 1 - Math.pow(1 - progress, 3)
        const easeOutQuint = 1 - Math.pow(1 - progress, 5)

        // Scale from 0 to final scale
        const scaleProgress = easeOutCubic * FINAL_SCALE
        group.scale.setScalar(scaleProgress)

        // Modified rotation animation to be more subtle
        const spinRotations = 1.5
        const spinEasing = 1 - Math.pow(1 - progress, 4)
        group.rotation.y = (1 - spinEasing) * Math.PI * 2 * spinRotations
        group.rotation.x = (1 - easeOutQuint) * Math.PI * 0.25

        // Fixed position - no movement
        group.position.set(0, 0, 0)

        if (progress > 0.8 && !hasCompletedEntrance && !animationCompletedRef.current) {
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
        {model ? (
          <primitive object={model} position={[0, 0, 0]} rotation={[0, 0, 0]} scale={[1, 1, 1]} />
        ) : (
          <primitive object={fallbackStarModel} position={[0, 0, 0]} rotation={[0, 0, 0]} scale={[1, 1, 1]} />
        )}
      </group>
    )
  },
)

StarMesh.displayName = "StarMesh"

// Main StarAnimation component with immediate rendering
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
    const [is3DReady, setIs3DReady] = useState(true) // Start as true for immediate rendering
    const completionTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    const hasCalledCompletionRef = useRef(false)
    const inViewRef = useRef(inView)

    // Update inViewRef when inView changes
    useEffect(() => {
      inViewRef.current = inView
    }, [inView])

    // Calculate DPR once during initialization
    const dpr = useMemo(() => {
      if (typeof window === "undefined") return 1

      // Lower DPR for Safari/macOS to improve performance
      if (isMacOS) {
        return Math.min(1.25, window.devicePixelRatio)
      }

      return Math.min(1.5, window.devicePixelRatio)
    }, [])

    const containerRef = useRef<HTMLDivElement>(null)
    const systemPrefersReducedMotion = useReducedMotion()
    const prefersReducedMotion = propsPrefersReducedMotion || !!systemPrefersReducedMotion

    // Detect GPU capabilities once and memoize the result
    const gpu = useDetectGPU()
    const quality = useMemo(() => {
      // Lower quality for Safari/macOS to improve performance
      if (isMacOS) {
        return "low"
      }

      return gpu && gpu.tier >= 2 ? "high" : "low"
    }, [gpu])

    // Force completion after a timeout, but only if in view
    useEffect(() => {
      if (inView && !hasCompletedEntrance && !hasCalledCompletionRef.current) {
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
        }, 800) // Reduced timeout for faster completion
      }

      return () => {
        if (completionTimeoutRef.current) {
          clearTimeout(completionTimeoutRef.current)
          completionTimeoutRef.current = null
        }
      }
    }, [inView, hasCompletedEntrance, onAnimationComplete])

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
    const handleError = useCallback(
      (error: Error) => {
        console.error("StarAnimation: Three.js error occurred", error)
        setHasErrored(true)

        if (!hasCalledCompletionRef.current) {
          setHasCompletedEntrance(true)
          hasCalledCompletionRef.current = true
          onAnimationComplete?.()
        }
      },
      [onAnimationComplete],
    )

    // Memoize canvas props to avoid recreating on each render
    const canvasProps = useMemo(
      () => ({
        dpr,
        camera: { position: [0, 0, 2] as [number, number, number], fov: 35 },
        className: "w-full h-full",
        style: { background: "transparent" },
        frameloop: "always", // Always run animation loop for immediate rendering
        gl: {
          antialias: quality === "high", // Only use antialias for high quality
          alpha: true,
          powerPreference: "high-performance" as WebGLPowerPreference,
          depth: true,
          stencil: false,
          logarithmicDepthBuffer: true,
          // Safari-specific WebGL context attributes
          ...(isMacOS
            ? {
                powerPreference: "default" as WebGLPowerPreference,
                antialias: false,
              }
            : {}),
        },
        onError: handleError,
      }),
      [dpr, quality, handleError],
    )

    // Fallback for errors
    if (hasErrored) {
      return (
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )
    }

    return (
      <motion.div
        ref={containerRef}
        initial={{ opacity: 1 }} // Start fully visible
        animate={{ opacity: 1 }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="w-full h-full relative cursor-pointer"
        aria-hidden="true"
        style={{
          willChange: "opacity",
          backfaceVisibility: "hidden",
        }}
      >
        {/* Render 3D star immediately but only animate when in view */}
        <div
          className="absolute inset-0 z-10"
          style={{
            opacity: 1,
            pointerEvents: "auto",
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
                delay={delay}
                prefersReducedMotion={prefersReducedMotion}
                quality={quality}
                inView={inView}
              />
            </Center>

            {/* Always render lights and environment for immediate appearance */}
            <ambientLight intensity={0.6} />
            <pointLight position={[5, 5, 5]} intensity={0.7} />
            <pointLight position={[-5, -5, 5]} intensity={0.3} color="#ffd700" />
            <Environment preset="apartment" background={false} />
          </Canvas>
        </div>

        <div
          className="absolute inset-0 rounded-full pointer-events-none transition-opacity duration-300 z-30"
          style={{
            opacity: hoverStateRef.current && inView ? 0.4 : 0,
            background: "radial-gradient(circle, rgba(255,215,0,0.3) 0%, transparent 70%)",
          }}
        />
      </motion.div>
    )
  },
)

StarAnimation.displayName = "StarAnimation"

