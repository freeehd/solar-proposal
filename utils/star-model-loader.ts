import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"
import * as THREE from "three"

// Star model Vercel Blob URL
export const STAR_MODEL_URL =
  "https://ufpsglq2mvejclds.public.blob.vercel-storage.com/star-dae9XbJkwuOqfRFv7IAnRgsz8MIXNF.glb"

// Fallback URLs (keep these)
export const FALLBACK_STAR_MODEL_URL =
  "https://ufpsglq2mvejclds.public.blob.vercel-storage.com/star-fallback-dae9XbJkwuOqfRFv7IAnRgsz8MIXNF.glb"
export const LOCAL_FALLBACK_URL = "/fallback-star.glb"

// Check if WebGL is supported
export function isWebGLSupported(): boolean {
  if (typeof window === "undefined") return false

  try {
    const canvas = document.createElement("canvas")
    return !!(window.WebGLRenderingContext && (canvas.getContext("webgl") || canvas.getContext("experimental-webgl")))
  } catch (e) {
    return false
  }
}

// Initialize the global star model cache (keep this in window for now, simplify logic)
export function initStarModelCache() {
  if (typeof window === "undefined") return null
  if (!window.starModelCache) {
    window.starModelCache = {
      model: null,
      loadPromise: null,
      loading: false,
      error: false,
      isLoaded: false,
      isLoading: false,
    }
  }
  return window.starModelCache
}

export function getStarModelCache() {
  return initStarModelCache()
}

// Simplified loadStarModel function - ONLY loading and caching logic here
export function loadStarModel(): Promise<THREE.Group> {
  const cache = getStarModelCache()
  if (!cache) {
    return Promise.reject(new Error("Cannot initialize star model cache"))
  }

  if (cache.model && cache.isLoaded) {
    console.log("Using cached star model")
    return Promise.resolve(cache.model)
  }

  if (cache.isLoading && cache.loadPromise) {
    console.log("Star model loading in progress, waiting...")
    return cache.loadPromise
  }

  console.log("Loading star model...")
  cache.isLoading = true
  cache.loading = true

  const loadPromise = new Promise<THREE.Group>((resolve, reject) => {
    const loader = new GLTFLoader()

    // Try primary URL first
    loader.load(
      STAR_MODEL_URL,
      (gltf) => {
        cache.model = gltf.scene.clone() // Clone the model for caching
        cache.isLoading = false
        cache.loading = false
        cache.isLoaded = true
        resolve(cache.model)
      },
      undefined, // Progress callback (optional)
      (error) => {
        console.error("Error loading star model from primary URL, trying fallback:", error)

        // Try fallback URL
        loader.load(
          FALLBACK_STAR_MODEL_URL,
          (gltf) => {
            cache.model = gltf.scene.clone()
            cache.isLoading = false
            cache.loading = false
            cache.isLoaded = true
            resolve(cache.model)
          },
          undefined,
          (fallbackError) => {
            console.error("Error loading star model from fallback URL, trying local fallback:", fallbackError)

            // Try local fallback
            loader.load(
              LOCAL_FALLBACK_URL,
              (gltf) => {
                cache.model = gltf.scene.clone()
                cache.isLoading = false
                cache.loading = false
                cache.isLoaded = true
                resolve(cache.model)
              },
              undefined,
              (localError) => {
                console.error("All loading attempts failed, using generated fallback model:", localError)
                const fallbackModel = createFallbackStarModel()
                cache.model = fallbackModel
                cache.isLoading = false
                cache.loading = false
                cache.isLoaded = true
                cache.error = true
                resolve(fallbackModel)
              },
            )
          },
        )
      },
    )
  })

  cache.loadPromise = loadPromise
  return loadPromise
}

// Simplified preloadStarModel - just initiates the load
export function preloadStarModel() {
  if (typeof window !== "undefined") {
    const cache = getStarModelCache()

    // Only attempt to preload if not already loaded or loading
    if (!cache.isLoaded && !cache.isLoading) {
      loadStarModel().catch((error) => {
        console.warn("Preloading star model failed:", error)
        // Mark as loaded with error to prevent further attempts
        if (cache) {
          cache.isLoaded = true
          cache.error = true
        }
      })
    }
  }
}

// Create a fallback star model
export function createFallbackStarModel(): THREE.Group {
  try {
    // Create a more detailed fallback star shape
    const group = new THREE.Group()

    // Create the main body of the star (icosahedron)
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
  } catch (error) {
    console.error("Error creating fallback star model:", error)

    // Ultra-simple fallback as last resort
    const group = new THREE.Group()
    const geometry = new THREE.BoxGeometry(1, 1, 1)
    const material = new THREE.MeshBasicMaterial({ color: 0xdaa520 })
    const mesh = new THREE.Mesh(geometry, material)
    group.add(mesh)

    return group
  }
}

// Start preloading immediately
if (typeof window !== "undefined") {
  // Delay preloading slightly to allow the page to load first
  setTimeout(preloadStarModel, 500)
}

