"use client"

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react"
import { motion, useReducedMotion } from "framer-motion"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { Center, Environment, useGLTF } from "@react-three/drei"
import * as THREE from "three"

interface StarMeshProps {
  isHovered: boolean
  hasCompletedEntrance: boolean
  onAnimationComplete?: () => void
  delay?: number
  prefersReducedMotion: boolean
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
const STAR_MODEL_URL = "/models/star2.glb"

// Material configuration for consistent appearance
const createStarMaterial = (emissiveIntensity = 0.3) => {
  return new THREE.MeshStandardMaterial({
    color: new THREE.Color("#9a6209"), // Darker gold color
    emissive: new THREE.Color("#d99000"), // Deeper gold for glow
    emissiveIntensity: 0.4,
    roughness: 0.005, // Even lower roughness for more mirror-like reflection
    metalness: 1.0, // Maximum metalness for perfect mirror finish
    transparent: true,
    opacity: 0.98, // Higher opacity for more solid appearance
    envMapIntensity: 4.5, // Increased environment map intensity for stronger reflections
  });
};

// Global model cache
const modelCache = {
  model: null as THREE.Group | null,
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
    }

    const handleContextRestored = () => {
      // Force a re-render
      const scene = useThree((state) => state.scene)
      const camera = useThree((state) => state.camera)
      gl.render(scene, camera)
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

// Create a fallback star model for cases where the GLTF fails to load
const createFallbackStarModel = () => {
  const group = new THREE.Group()
  
  // Use an higher tessellation geometry for smoother appearance
  const geometry = new THREE.OctahedronGeometry(1, 8);  // Increased tessellation for better anti-aliasing
  geometry.computeVertexNormals();
  
  // Use the shared material configuration
  const material = createStarMaterial(0.3); // Default emission intensity
  
  const mesh = new THREE.Mesh(geometry, material)
  
  // Add a soft outer glow mesh to hide jagged edges
  const glowGeometry = new THREE.OctahedronGeometry(1.05, 6);
  const glowMaterial = new THREE.MeshBasicMaterial({
    color: new THREE.Color("#d99000"),
    transparent: true,
    opacity: 0.25,
    side: THREE.BackSide,
  });
  
  const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
  group.add(glowMesh);
  group.add(mesh)

  return group
}

// Star model loader component
const StarModel = ({ onLoad }: { onLoad: (model: THREE.Group) => void }) => {
  const { scene } = useGLTF(STAR_MODEL_URL)
  
  useEffect(() => {
    // Clone the scene first to avoid modifying during traversal
    const clonedScene = scene.clone();
    
    // Create a separate array of meshes to process to avoid recursion
    const meshesToProcess: THREE.Mesh[] = [];
    
    // First identify all meshes that need processing
    clonedScene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        meshesToProcess.push(child as THREE.Mesh);
      }
    });
    
    // Then process each mesh separately
    meshesToProcess.forEach(mesh => {
      // Apply the shared material configuration to each mesh
      if (mesh.material) {
        mesh.material = createStarMaterial(0.3);
        
        // Apply normal smoothing if geometry has normals
        if (mesh.geometry && mesh.geometry.attributes.normal) {
          mesh.geometry.computeVertexNormals();
        }
        
        // Add a glow mesh as a sibling, not a child (to avoid recursion)
        if (mesh.geometry && mesh.parent) {
          // Create a slightly larger clone for the glow effect
          const glowMesh = new THREE.Mesh(
            mesh.geometry.clone(),
            new THREE.MeshBasicMaterial({
              color: new THREE.Color("#d99000"),
              transparent: true,
              opacity: 0.25,
              side: THREE.BackSide,
            })
          );
          
          // Position the glow mesh at the same location as the original mesh
          glowMesh.position.copy(mesh.position);
          glowMesh.rotation.copy(mesh.rotation);
          glowMesh.scale.copy(mesh.scale).multiplyScalar(1.05);
          glowMesh.name = "glowMesh"; // Mark as a glow mesh
          
          // Add to parent instead of to the mesh itself
          mesh.parent.add(glowMesh);
        }
      }
    });
    
    // Save to cache and notify parent
    modelCache.model = clonedScene;
    onLoad(clonedScene);
  }, [scene, onLoad]);
  
  return null;
}

// Star mesh component with optimized rendering
const StarMesh = React.memo(
  ({
    isHovered,
    hasCompletedEntrance,
    onAnimationComplete,
    delay = 0,
    prefersReducedMotion,
    inView = true,
  }: StarMeshProps) => {
    const groupRef = useRef<THREE.Group>(null)
    const materialRef = useRef<THREE.MeshStandardMaterial | null>(null)
    const animationCompletedRef = useRef(false)
    const animationStartedRef = useRef(false)
    const completionTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    const inViewRef = useRef(inView)
    const [model, setModel] = useState<THREE.Group | null>(null)
    
    // Create the fallback star model for use until the GLTF loads
    const fallbackModel = useMemo(() => createFallbackStarModel(), [])
    
    // Handle model loading
    const handleModelLoad = useCallback((loadedModel: THREE.Group) => {
      setModel(loadedModel.clone())
      
      // Store a reference to a material for hover effects
      loadedModel.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          if (mesh.material && !mesh.name.includes("glowMesh")) {
            materialRef.current = mesh.material as THREE.MeshStandardMaterial;
            return;
          }
        }
      });
    }, [])

    // Update inViewRef when inView changes
    useEffect(() => {
      inViewRef.current = inView
    }, [inView])

    // Animation state reference to avoid re-renders
    const animationState = useRef({
      targetRotation: { x: 0, y: 0 },
      currentRotation: { x: 0, y: 0 },
      startTime: null as number | null,
      hasStarted: false,
      lastUpdateTime: 0,
    })

    // Handle visibility changes to prevent erratic behavior when switching tabs
    useEffect(() => {
      const handleVisibilityChange = () => {
        if (document.hidden) {
          // Tab is now hidden
          // Just note the time to calculate proper deltas when returning
        } else {
          // Tab is now visible again - reset animation state to prevent spinning
          const anim = animationState.current;
          // Reset rotation states to prevent spinning
          anim.targetRotation = { x: 0, y: 0 };
          anim.currentRotation = { x: 0, y: 0 };
          anim.lastUpdateTime = performance.now() / 1000;
          
          // If the group exists, reset its rotation too
          if (groupRef.current) {
            groupRef.current.rotation.set(0, 0, 0);
          }
        }
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);
      
      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    }, []);

    // Set up completion timeout only if in view
    useEffect(() => {
      if (inView && !animationCompletedRef.current && !completionTimeoutRef.current) {
        completionTimeoutRef.current = setTimeout(() => {
          if (!animationCompletedRef.current) {
            animationCompletedRef.current = true
            onAnimationComplete?.()
          }
        }, 800) // Timeout for fallback completion
      }

      return () => {
        if (completionTimeoutRef.current) {
          clearTimeout(completionTimeoutRef.current)
          completionTimeoutRef.current = null
        }
      }
    }, [onAnimationComplete, inView])

    // Animation frame updates
    useFrame((state, delta) => {
      if (!groupRef.current) return

      // Clamp delta to prevent excessive movement when tab refocuses
      // This prevents the spinning after tab change
      const clampedDelta = Math.min(delta, 0.1) 

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
        
        // Improved easing functions for smoother motion
        const easeOutBack = (x: number) => {
          const c1 = 1.70158;
          const c3 = c1 + 1;
          return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
        };
        
        // Apply easing to scale for a more dynamic entrance
        const scaleProgress = easeOutBack(progress) * FINAL_SCALE
        group.scale.setScalar(scaleProgress)

        // Enhanced rotation animation with smoother easing
        const spinRotations = 1.2
        const spinEasing = 1 - Math.pow(1 - progress, 3) // Cubic easing
        group.rotation.y = (1 - spinEasing) * Math.PI * 2 * spinRotations
        group.rotation.x = (1 - spinEasing) * Math.PI * 0.2 // Reduced tilt for better reflection view

        // Fixed position - no movement
        group.position.set(0, 0, -6)

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
        // Idle animation - optimized to reduce calculations
        // Only update scale if needed
        if (Math.abs(group.scale.x - FINAL_SCALE) > 0.001) {
          group.scale.setScalar(FINAL_SCALE)
        }

        // Optimize position updates - keep position fixed at a constant value
        if (group.position.z !== -6) {
          group.position.set(0, 0, -6)
        }

        const now = state.clock.elapsedTime
        const updateInterval = 0.1 // Throttle updates to every 100ms

        if (now - anim.lastUpdateTime > updateInterval) {
          anim.lastUpdateTime = now

          // Generate smooth rotation values based on time
          // Use different frequencies for more interesting motion
          const amplitude = isHovered ? 0.08 : 0.05; // Larger movement on hover
          const timeScale = isHovered ? 0.8 : 0.3;   // Faster movement on hover
          
          // Calculate new target rotation - optimized sin/cos calls
          anim.targetRotation.y = Math.sin(now * timeScale) * amplitude;
          anim.targetRotation.x = Math.cos(now * timeScale * 0.7) * amplitude * 0.6;
        }

        // Smooth interpolation to target rotation - only update when needed
        const rotXDiff = Math.abs(anim.currentRotation.x - anim.targetRotation.x)
        const rotYDiff = Math.abs(anim.currentRotation.y - anim.targetRotation.y)

        // Optimization: Only update rotation when the change is visible
        if (rotXDiff > 0.0005) {
          // Use clampedDelta to prevent excessive movement
          anim.currentRotation.x = THREE.MathUtils.lerp(anim.currentRotation.x, anim.targetRotation.x, clampedDelta * 2.5)
          group.rotation.x = anim.currentRotation.x
        }

        if (rotYDiff > 0.0005) {
          // Use clampedDelta to prevent excessive movement
          anim.currentRotation.y = THREE.MathUtils.lerp(anim.currentRotation.y, anim.targetRotation.y, clampedDelta * 2.5)
          group.rotation.y = anim.currentRotation.y
        }
      }
    })

    // Use cached model if available
    useEffect(() => {
      if (modelCache.model && !model) {
        setModel(modelCache.model.clone())
      }
    }, [model])

    // Handle material updates on hover
    useEffect(() => {
      if (!materialRef.current) return

      // Update material properties on hover
      if (isHovered) {
        materialRef.current.emissiveIntensity = 0.5 // Increased glow on hover
      } else {
        materialRef.current.emissiveIntensity = 0.3 // Default glow
      }
    }, [isHovered])

    // Handle material updates on hover
    useEffect(() => {
      if (!materialRef.current) return

      // Update material properties on hover
      if (isHovered) {
        materialRef.current.emissiveIntensity = 0.6 // Increased glow on hover
        materialRef.current.envMapIntensity = 5.5 // Increased reflectivity on hover
        materialRef.current.roughness = 0.001 // Further reduced roughness for more mirror-like appearance
      } else {
        materialRef.current.emissiveIntensity = 0.4 // Default glow
        materialRef.current.envMapIntensity = 4.5 // Default reflectivity
        materialRef.current.roughness = 0.005 // Default roughness
      }
    }, [isHovered])

    return (
      <group ref={groupRef}>
        {/* If we have a GLTF model, use it, otherwise use the fallback */}
        {model ? (
          <primitive object={model} position={[0, 0, 0]} rotation={[0, 0, 0]} scale={[1, 1, 1]} />
        ) : (
          <>
            <StarModel onLoad={handleModelLoad} />
            <primitive object={fallbackModel} position={[0, 0, 0]} rotation={[0, 0, 0]} scale={[1, 1, 1]} />
          </>
        )}
      </group>
    );
  }
)

StarMesh.displayName = "StarMesh"

// Main StarAnimation component with improved anti-aliasing
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
    const completionTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    const hasCalledCompletionRef = useRef(false)
    const inViewRef = useRef(inView)

    // Update inViewRef when inView changes
    useEffect(() => {
      inViewRef.current = inView
    }, [inView])

    // Calculate optimal DPR once during initialization with enhanced anti-aliasing
    const dpr = useMemo(() => {
      if (typeof window === "undefined") return 1
      
      // Use maximum available DPR for best anti-aliasing quality
      const maxDpr = Math.min(4, window.devicePixelRatio || 1);
      
      // On high-DPI displays, we can afford higher quality
      if (maxDpr > 2) {
        return maxDpr;
      }
      
      // Default to a safe value that balances quality and performance
      return Math.max(2, maxDpr);
    }, [])

    const containerRef = useRef<HTMLDivElement>(null)
    const systemPrefersReducedMotion = useReducedMotion()
    const prefersReducedMotion = propsPrefersReducedMotion || !!systemPrefersReducedMotion

    // Force completion after a timeout, but only if in view
    useEffect(() => {
      if (inView && !hasCompletedEntrance && !hasCalledCompletionRef.current) {
        // Clear any existing timeout
        if (completionTimeoutRef.current) {
          clearTimeout(completionTimeoutRef.current)
        }

        completionTimeoutRef.current = setTimeout(() => {
          if (!hasCompletedEntrance && !hasCalledCompletionRef.current) {
            setHasCompletedEntrance(true)
            hasCalledCompletionRef.current = true
            onAnimationComplete?.()
          }
        }, 800) // Timeout for fallback completion
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
        setHasCompletedEntrance(true)
        hasCalledCompletionRef.current = true
        onAnimationComplete?.()
      }
    }, [onAnimationComplete])

    // Handle errors in Three.js
    const handleError = useCallback(
      (error: Error) => {
        setHasErrored(true)

        if (!hasCalledCompletionRef.current) {
          setHasCompletedEntrance(true)
          hasCalledCompletionRef.current = true
          onAnimationComplete?.()
        }
      },
      [onAnimationComplete],
    )

    // Enhanced anti-aliasing settings
    const canvasProps = useMemo(
      () => ({
        dpr,
        camera: { 
          position: [0, 0, 3.5] as [number, number, number], 
          fov: 20, // Tighter FOV for less distortion
          near: 0.1,
          far: 1000,
        },
        className: "w-full h-full",
        style: { background: "transparent" },
        frameloop: "always" as const,
        gl: {
          antialias: true, // Enable built-in WebGL anti-aliasing
          alpha: true,
          powerPreference: "high-performance" as WebGLPowerPreference,
          depth: true,
          stencil: false,
          logarithmicDepthBuffer: true,
          precision: "highp" as const,
          samples: 16, // Maximum MSAA samples for best anti-aliasing quality
        },
        onCreated: (state: any) => {
          // Initialize renderer with enhanced anti-aliasing settings
          if (state.gl) {
            state.gl.setClearColor(0x000000, 0);
            state.gl.setPixelRatio(dpr);
            
            // Enable additional rendering features for better quality
            if ('outputColorSpace' in state.gl) {
              // Use color space for modern THREE.js
              state.gl.outputColorSpace = THREE.SRGBColorSpace;
            }
          }
        },
      }),
      [dpr],
    )

    // Add post-processing effects component
    const PostProcessingEffects = () => {
      const { gl } = useThree()
      
      useEffect(() => {
        if (gl) {
          gl.setPixelRatio(dpr);
          // Use modern THREE.js colorSpace API instead of deprecated outputEncoding
          if ('colorSpace' in gl) {
            // @ts-ignore - using modern THREE.js API
            gl.colorSpace = 'srgb';
          }
        }
      }, [gl]);
      
      return null;
    }

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
        initial={{ opacity: 1 }}
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
        {/* Render 3D star with enhanced anti-aliasing */}
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
            
            {/* Add post-processing effects */}
            <PostProcessingEffects />

            <Center>
              <StarMesh
                isHovered={hoverStateRef.current}
                hasCompletedEntrance={hasCompletedEntrance}
                onAnimationComplete={handleComplete}
                delay={delay}
                prefersReducedMotion={prefersReducedMotion}
                inView={inView}
              />
            </Center>

            {/* Optimized lighting setup for better highlights and edge definition */}
        
            <Environment preset="sunset" background={false} />
          </Canvas>
        </div>
      </motion.div>
    )
  },
)

StarAnimation.displayName = "StarAnimation"

