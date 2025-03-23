import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"
import * as THREE from "three"

// Asset URLs
const STAR_MODEL_URL = "https://ufpsglq2mvejclds.public.blob.vercel-storage.com/star-dae9XbJkwuOqfRFv7IAnRgsz8MIXNF.glb"
const FALLBACK_STAR_MODEL_URL =
  "https://ufpsglq2mvejclds.public.blob.vercel-storage.com/star-fallback-dae9XbJkwuOqfRFv7IAnRgsz8MIXNF.glb"
const VIDEO_URL = "https://ufpsglq2mvejclds.public.blob.vercel-storage.com/video3-1qC3I0KH9sIPRy0jKZzLCzPt09d1Xx.webm"
const FALLBACK_VIDEO_URL =
  "https://ufpsglq2mvejclds.public.blob.vercel-storage.com/video3-fallback-1qC3I0KH9sIPRy0jKZzLCzPt09d1Xx.mp4"

// Device detection helpers
export const isIOS =
  typeof window !== "undefined" && /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream

export const isSafari = typeof window !== "undefined" && /^((?!chrome|android).)*safari/i.test(navigator.userAgent)

// Global asset cache
type AssetCache = {
  starModel: {
    model: THREE.Group | null
    isLoaded: boolean
    isLoading: boolean
    error: Error | null
  }
  video: {
    element: HTMLVideoElement | null
    isLoaded: boolean
    isLoading: boolean
    error: Error | null
  }
}

// Initialize global cache
const assetCache: AssetCache = {
  starModel: {
    model: null,
    isLoaded: false,
    isLoading: false,
    error: null,
  },
  video: {
    element: null,
    isLoaded: false,
    isLoading: false,
    error: null,
  },
}

// Event system for loading progress
type ProgressListener = (type: "starModel" | "video", progress: number) => void
const progressListeners: ProgressListener[] = []

export function addProgressListener(listener: ProgressListener): () => void {
  progressListeners.push(listener)
  return () => {
    const index = progressListeners.indexOf(listener)
    if (index !== -1) {
      progressListeners.splice(index, 1)
    }
  }
}

function notifyProgress(type: "starModel" | "video", progress: number) {
  progressListeners.forEach((listener) => listener(type, progress))
}

// Load star model
export async function preloadStarModel(): Promise<THREE.Group> {
  // Return cached model if already loaded
  if (assetCache.starModel.isLoaded && assetCache.starModel.model) {
    return assetCache.starModel.model
  }

  // Return existing promise if loading is in progress
  if (assetCache.starModel.isLoading) {
    return new Promise((resolve, reject) => {
      const checkInterval = setInterval(() => {
        if (assetCache.starModel.isLoaded && assetCache.starModel.model) {
          clearInterval(checkInterval)
          resolve(assetCache.starModel.model)
        } else if (assetCache.starModel.error) {
          clearInterval(checkInterval)
          reject(assetCache.starModel.error)
        }
      }, 100)
    })
  }

  // Start loading
  assetCache.starModel.isLoading = true
  notifyProgress("starModel", 0)

  return new Promise<THREE.Group>((resolve, reject) => {
    const loader = new GLTFLoader()

    // Try primary URL
    loader.load(
      STAR_MODEL_URL,
      (gltf) => {
        assetCache.starModel.model = gltf.scene.clone()
        assetCache.starModel.isLoaded = true
        assetCache.starModel.isLoading = false
        notifyProgress("starModel", 100)
        resolve(assetCache.starModel.model)
      },
      (xhr) => {
        if (xhr.lengthComputable) {
          const progress = Math.round((xhr.loaded / xhr.total) * 100)
          notifyProgress("starModel", progress)
        }
      },
      (error) => {
        console.warn("Error loading star model, trying fallback:", error)

        // Try fallback URL
        loader.load(
          FALLBACK_STAR_MODEL_URL,
          (gltf) => {
            assetCache.starModel.model = gltf.scene.clone()
            assetCache.starModel.isLoaded = true
            assetCache.starModel.isLoading = false
            notifyProgress("starModel", 100)
            resolve(assetCache.starModel.model)
          },
          (xhr) => {
            if (xhr.lengthComputable) {
              const progress = Math.round((xhr.loaded / xhr.total) * 100)
              notifyProgress("starModel", progress)
            }
          },
          (fallbackError) => {
            console.error("Error loading star model from fallback:", fallbackError)
            // Create a fallback model
            const fallbackModel = createFallbackStarModel()
            assetCache.starModel.model = fallbackModel
            assetCache.starModel.isLoaded = true
            assetCache.starModel.isLoading = false
            assetCache.starModel.error = fallbackError
            notifyProgress("starModel", 100)
            resolve(fallbackModel)
          },
        )
      },
    )
  })
}

// Create a fallback star model
function createFallbackStarModel(): THREE.Group {
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

// Preload video
export async function preloadVideo(): Promise<HTMLVideoElement> {
  // Return cached video if already loaded
  if (assetCache.video.isLoaded && assetCache.video.element) {
    return assetCache.video.element
  }

  // Return existing promise if loading is in progress
  if (assetCache.video.isLoading) {
    return new Promise((resolve, reject) => {
      const checkInterval = setInterval(() => {
        if (assetCache.video.isLoaded && assetCache.video.element) {
          clearInterval(checkInterval)
          resolve(assetCache.video.element)
        } else if (assetCache.video.error) {
          clearInterval(checkInterval)
          reject(assetCache.video.error)
        }
      }, 100)
    })
  }

  // Start loading
  assetCache.video.isLoading = true
  notifyProgress("video", 0)

  return new Promise<HTMLVideoElement>((resolve, reject) => {
    // Choose appropriate video URL based on device
    const videoUrl = isIOS || isSafari ? FALLBACK_VIDEO_URL : VIDEO_URL

    // Create video element
    const video = document.createElement("video")
    video.muted = true
    video.playsInline = true
    video.loop = true
    video.preload = "auto"

    // Set specific attributes for iOS/Safari
    if (isIOS || isSafari) {
      video.setAttribute("playsinline", "")
      video.setAttribute("webkit-playsinline", "")
    }

    // Track loading progress
    let progressInterval: number | null = null

    const updateProgress = () => {
      if (video.buffered.length > 0) {
        const bufferedEnd = video.buffered.end(video.buffered.length - 1)
        const duration = video.duration || 1
        const progress = Math.min(100, Math.round((bufferedEnd / duration) * 100))
        notifyProgress("video", progress)

        // Consider loaded when we have enough buffered
        if (progress >= 30 && !assetCache.video.isLoaded) {
          if (progressInterval) {
            clearInterval(progressInterval)
            progressInterval = null
          }

          assetCache.video.element = video
          assetCache.video.isLoaded = true
          assetCache.video.isLoading = false
          notifyProgress("video", 100)
          resolve(video)
        }
      }
    }

    // Set up event listeners
    video.addEventListener("canplaythrough", () => {
      if (progressInterval) {
        clearInterval(progressInterval)
        progressInterval = null
      }

      assetCache.video.element = video
      assetCache.video.isLoaded = true
      assetCache.video.isLoading = false
      notifyProgress("video", 100)
      resolve(video)
    })

    video.addEventListener("error", (e) => {
      if (progressInterval) {
        clearInterval(progressInterval)
        progressInterval = null
      }

      const error = new Error(`Video loading error: ${video.error?.message || "unknown error"}`)
      console.error(error)

      // If using primary URL, try fallback
      if (video.src !== FALLBACK_VIDEO_URL) {
        console.log("Trying fallback video URL")
        video.src = FALLBACK_VIDEO_URL
        video.load()
        return
      }

      assetCache.video.error = error
      assetCache.video.isLoading = false
      reject(error)
    })

    // Start progress tracking
    progressInterval = window.setInterval(updateProgress, 200)

    // Set timeout to prevent indefinite loading
    const timeout = setTimeout(() => {
      if (!assetCache.video.isLoaded) {
        if (progressInterval) {
          clearInterval(progressInterval)
          progressInterval = null
        }

        // If we have some data, consider it loaded anyway
        if (video.readyState >= 2) {
          assetCache.video.element = video
          assetCache.video.isLoaded = true
          assetCache.video.isLoading = false
          notifyProgress("video", 100)
          resolve(video)
        } else {
          const timeoutError = new Error("Video loading timed out")
          assetCache.video.error = timeoutError
          assetCache.video.isLoading = false
          reject(timeoutError)
        }
      }
    }, 15000)

    // Set source and start loading
    video.src = videoUrl
    video.load()

    // Clean up on promise settlement
    const cleanup = () => {
      clearTimeout(timeout)
      if (progressInterval) {
        clearInterval(progressInterval)
        progressInterval = null
      }
    }

    // Ensure cleanup happens
    Promise.prototype.finally.call(
      new Promise((res) => {
        video.addEventListener("canplaythrough", res, { once: true })
        video.addEventListener("error", res, { once: true })
      }),
      cleanup,
    )
  })
}

// Preload all assets
export async function preloadAllAssets(): Promise<{
  starModel: THREE.Group
  video: HTMLVideoElement
}> {
  // Start both loads in parallel
  const starModelPromise = preloadStarModel()
  const videoPromise = preloadVideo()

  // Wait for both to complete
  const [starModel, video] = await Promise.all([
    starModelPromise.catch((error) => {
      console.error("Failed to load star model:", error)
      return createFallbackStarModel()
    }),
    videoPromise.catch((error) => {
      console.error("Failed to load video:", error)
      // Create a placeholder video element
      const placeholderVideo = document.createElement("video")
      placeholderVideo.muted = true
      placeholderVideo.playsInline = true
      placeholderVideo.loop = true
      return placeholderVideo
    }),
  ])

  return { starModel, video }
}

// Get cached assets (without loading)
export function getCachedAssets() {
  return {
    starModel: assetCache.starModel.model,
    video: assetCache.video.element,
    isStarModelLoaded: assetCache.starModel.isLoaded,
    isVideoLoaded: assetCache.video.isLoaded,
  }
}

// Check if all assets are loaded
export function areAllAssetsLoaded(): boolean {
  // Check both the isLoaded flag and the actual presence of the assets
  return (
    assetCache.starModel.isLoaded &&
    assetCache.starModel.model !== null &&
    assetCache.video.isLoaded &&
    assetCache.video.element !== null
  )
}

// Get overall loading progress (0-100)
export function getOverallProgress(): number {
  // If both assets are fully loaded, return 100% immediately
  if (assetCache.starModel.isLoaded && assetCache.video.isLoaded) {
    return 100
  }

  // Get actual progress values from the cache
  const starModelProgress = assetCache.starModel.isLoaded
    ? 100
    : assetCache.starModel.isLoading
      ? Math.min(99, progressListeners.length > 0 ? 50 : 0)
      : 0

  const videoProgress = assetCache.video.isLoaded
    ? 100
    : assetCache.video.isLoading
      ? Math.min(99, progressListeners.length > 0 ? 50 : 0)
      : 0

  // Weight video loading more heavily (60/40 split)
  const calculatedProgress = Math.round(videoProgress * 0.6 + starModelProgress * 0.4)

  // Ensure we return a value between 0-100
  return Math.max(0, Math.min(100, calculatedProgress))
}

