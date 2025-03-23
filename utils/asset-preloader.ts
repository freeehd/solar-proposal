import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"
import * as THREE from "three"

// Asset URLs
const STAR_MODEL_URL = "https://ufpsglq2mvejclds.public.blob.vercel-storage.com/star-dae9XbJkwuOqfRFv7IAnRgsz8MIXNF.glb"
const FALLBACK_STAR_MODEL_URL =
  "https://ufpsglq2mvejclds.public.blob.vercel-storage.com/star-fallback-dae9XbJkwuOqfRFv7IAnRgsz8MIXNF.glb"
const VIDEO_URL = "https://ufpsglq2mvejclds.public.blob.vercel-storage.com/video3-1qC3I0KH9sIPRy0jKZzLCzPt09d1Xx.webm"
const FALLBACK_VIDEO_URL =
  "https://ufpsglq2mvejclds.public.blob.vercel-storage.com/video3-rAkQAMhZySExrESChs56oUvTsY14kl.mp4"

// Device detection helpers
export const isAppleDevice =
  typeof window !== "undefined" &&
  (/iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1) ||
    /Mac/.test(navigator.platform) ||
    /^((?!chrome|android).)*safari/i.test(navigator.userAgent) ||
    (!!navigator.userAgent.match(/AppleWebKit/) && !navigator.userAgent.match(/Chrome/)))

// Global singleton asset cache
type AssetCache = {
  starModel: {
    model: THREE.Group | null
    isLoaded: boolean
    isLoading: boolean
    error: Error | null
    loadPromise: Promise<THREE.Group> | null
  }
  video: {
    element: HTMLVideoElement | null
    isLoaded: boolean
    isLoading: boolean
    error: Error | null
    loadPromise: Promise<HTMLVideoElement> | null
  }
  // Track if initial loading is complete
  initialLoadComplete: boolean
}

// Initialize global cache as a singleton
const assetCache: AssetCache = {
  starModel: {
    model: null,
    isLoaded: false,
    isLoading: false,
    error: null,
    loadPromise: null,
  },
  video: {
    element: null,
    isLoaded: false,
    isLoading: false,
    error: null,
    loadPromise: null,
  },
  initialLoadComplete: false,
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

// Create a fallback star model
function createFallbackStarModel(): THREE.Group {
  console.log("Creating fallback star model")
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

// Load star model with improved reliability - only loads once
export function preloadStarModel(): Promise<THREE.Group> {
  console.log("preloadStarModel called, current state:", {
    isLoaded: assetCache.starModel.isLoaded,
    isLoading: assetCache.starModel.isLoading,
  })

  // Return cached model if already loaded
  if (assetCache.starModel.isLoaded && assetCache.starModel.model) {
    console.log("Star model already loaded, returning cached model")
    return Promise.resolve(assetCache.starModel.model)
  }

  // Return existing promise if loading is in progress
  if (assetCache.starModel.isLoading && assetCache.starModel.loadPromise) {
    console.log("Star model loading in progress, returning existing promise")
    return assetCache.starModel.loadPromise
  }

  // Start loading
  console.log("Starting star model loading")
  assetCache.starModel.isLoading = true
  notifyProgress("starModel", 0)

  // Create and store the promise
  const loadPromise = new Promise<THREE.Group>((resolve, reject) => {
    const loader = new GLTFLoader()

    // Add a timeout to prevent indefinite loading
    const timeout = setTimeout(() => {
      console.warn("Star model loading timed out, using fallback")
      const fallbackModel = createFallbackStarModel()
      assetCache.starModel.model = fallbackModel
      assetCache.starModel.isLoaded = true
      assetCache.starModel.isLoading = false
      notifyProgress("starModel", 100)
      resolve(fallbackModel)
    }, 15000) // 15 second timeout

    // Try primary URL
    loader.load(
      STAR_MODEL_URL,
      (gltf) => {
        clearTimeout(timeout)
        console.log("Star model loaded successfully")
        assetCache.starModel.model = gltf.scene.clone()
        assetCache.starModel.isLoaded = true
        assetCache.starModel.isLoading = false
        notifyProgress("starModel", 100)
        resolve(assetCache.starModel.model)
      },
      (xhr) => {
        if (xhr.lengthComputable) {
          const progress = Math.round((xhr.loaded / xhr.total) * 100)
          console.log(`Star model loading progress: ${progress}%`)
          notifyProgress("starModel", progress)
        }
      },
      (error) => {
        console.warn("Error loading star model, trying fallback:", error)

        // Try fallback URL
        loader.load(
          FALLBACK_STAR_MODEL_URL,
          (gltf) => {
            clearTimeout(timeout)
            console.log("Star model fallback loaded successfully")
            assetCache.starModel.model = gltf.scene.clone()
            assetCache.starModel.isLoaded = true
            assetCache.starModel.isLoading = false
            notifyProgress("starModel", 100)
            resolve(assetCache.starModel.model)
          },
          (xhr) => {
            if (xhr.lengthComputable) {
              const progress = Math.round((xhr.loaded / xhr.total) * 100)
              console.log(`Star model fallback loading progress: ${progress}%`)
              notifyProgress("starModel", progress)
            }
          },
          (fallbackError) => {
            clearTimeout(timeout)
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

  // Store the promise
  assetCache.starModel.loadPromise = loadPromise

  return loadPromise
}

// Preload video with improved reliability - only loads once
export function preloadVideo(): Promise<HTMLVideoElement> {
  console.log("preloadVideo called, current state:", {
    isLoaded: assetCache.video.isLoaded,
    isLoading: assetCache.video.isLoading,
  })

  // Return cached video if already loaded
  if (assetCache.video.isLoaded && assetCache.video.element) {
    console.log("Video already loaded, returning cached video")
    return Promise.resolve(assetCache.video.element)
  }

  // Return existing promise if loading is in progress
  if (assetCache.video.isLoading && assetCache.video.loadPromise) {
    console.log("Video loading in progress, returning existing promise")
    return assetCache.video.loadPromise
  }

  // Start loading
  console.log("Starting video loading")
  assetCache.video.isLoading = true
  notifyProgress("video", 0)

  // Create and store the promise
  const loadPromise = new Promise<HTMLVideoElement>((resolve) => {
    // Always use MP4 for Apple devices
    const videoUrl = isAppleDevice ? FALLBACK_VIDEO_URL : VIDEO_URL
    console.log(`Using video URL: ${videoUrl} (isAppleDevice: ${isAppleDevice})`)

    // Create video element
    const video = document.createElement("video")
    video.muted = true
    video.playsInline = true
    video.loop = true
    video.preload = "auto"
    video.crossOrigin = "anonymous"

    // Set specific attributes for iOS/Safari
    if (isAppleDevice) {
      video.setAttribute("playsinline", "")
      video.setAttribute("webkit-playsinline", "")
      video.setAttribute("x-webkit-airplay", "allow")
      video.setAttribute("autoplay", "")
    }

    // Track loading progress
    let progressInterval: number | null = null

    const updateProgress = () => {
      if (video.buffered.length > 0) {
        const bufferedEnd = video.buffered.end(video.buffered.length - 1)
        const duration = video.duration || 1
        const progress = Math.min(100, Math.round((bufferedEnd / duration) * 100))
        console.log(`Video loading progress: ${progress}%`)
        notifyProgress("video", progress)

        // Consider loaded when we have enough buffered
        if (progress >= 30 && !assetCache.video.isLoaded) {
          if (progressInterval) {
            clearInterval(progressInterval)
            progressInterval = null
          }

          console.log("Video has enough data, considering loaded")
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
      console.log("Video can play through")
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

    video.addEventListener("loadeddata", () => {
      console.log("Video data loaded")
      // For iOS, we consider the video loaded when data is loaded
      if (isAppleDevice && !assetCache.video.isLoaded) {
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
    })

    const handleVideoError = () => {
      console.error("Video error:", video.error)

      if (progressInterval) {
        clearInterval(progressInterval)
        progressInterval = null
      }

      // Create a placeholder video element
      const placeholderVideo = document.createElement("video")
      placeholderVideo.muted = true
      placeholderVideo.playsInline = true
      placeholderVideo.loop = true
      placeholderVideo.crossOrigin = "anonymous"
      placeholderVideo.poster = "/night3.png"

      assetCache.video.element = placeholderVideo
      assetCache.video.isLoaded = true
      assetCache.video.isLoading = false
      notifyProgress("video", 100)
      resolve(placeholderVideo)
    }

    video.addEventListener("error", handleVideoError)

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
          console.log("Video timeout but has some data, considering loaded")
          assetCache.video.element = video
          assetCache.video.isLoaded = true
          assetCache.video.isLoading = false
          notifyProgress("video", 100)
          resolve(video)
        } else {
          console.warn("Video loading timed out, using placeholder")
          // Create a placeholder video element
          const placeholderVideo = document.createElement("video")
          placeholderVideo.muted = true
          placeholderVideo.playsInline = true
          placeholderVideo.loop = true
          placeholderVideo.crossOrigin = "anonymous"
          placeholderVideo.poster = "/night3.png"

          assetCache.video.element = placeholderVideo
          assetCache.video.isLoaded = true
          assetCache.video.isLoading = false
          notifyProgress("video", 100)
          resolve(placeholderVideo)
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

  // Store the promise
  assetCache.video.loadPromise = loadPromise

  return loadPromise
}

// Preload all assets with improved reliability - only loads once
export async function preloadAllAssets(): Promise<{
  starModel: THREE.Group
  video: HTMLVideoElement
}> {
  console.log("preloadAllAssets called, initialLoadComplete:", assetCache.initialLoadComplete)

  // If initial load is already complete, return cached assets
  if (assetCache.initialLoadComplete) {
    console.log("Initial load already complete, returning cached assets")
    return {
      starModel: assetCache.starModel.model!,
      video: assetCache.video.element!,
    }
  }

  console.log("Starting parallel asset loading")

  // Start both loads in parallel
  const starModelPromise = preloadStarModel()
  const videoPromise = preloadVideo()

  try {
    // Wait for both to complete
    const [starModel, video] = await Promise.all([starModelPromise, videoPromise])

    console.log("All assets loaded successfully")

    // Mark initial load as complete
    assetCache.initialLoadComplete = true

    return { starModel, video }
  } catch (error) {
    console.error("Error in preloadAllAssets:", error)

    // Even on error, return whatever we have
    const starModel = assetCache.starModel.model || createFallbackStarModel()

    const placeholderVideo = document.createElement("video")
    placeholderVideo.muted = true
    placeholderVideo.playsInline = true
    placeholderVideo.loop = true
    placeholderVideo.crossOrigin = "anonymous"
    placeholderVideo.poster = "/night3.png"

    const video = assetCache.video.element || placeholderVideo

    // Mark initial load as complete even on error
    assetCache.initialLoadComplete = true

    return { starModel, video }
  }
}

// Get cached assets - never triggers loading
export function getCachedAssets() {
  return {
    starModel: assetCache.starModel.model,
    video: assetCache.video.element,
    isLoaded: assetCache.starModel.isLoaded && assetCache.video.isLoaded,
    initialLoadComplete: assetCache.initialLoadComplete,
  }
}

// Check if all assets are loaded
export function areAllAssetsLoaded(): boolean {
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

  // Get progress values from listeners
  let starModelProgress = 0
  let videoProgress = 0

  // Call each listener with a temporary function to capture current progress
  progressListeners.forEach((listener) => {
    const tempListener = (type: "starModel" | "video", progress: number) => {
      if (type === "starModel") starModelProgress = Math.max(starModelProgress, progress)
      if (type === "video") videoProgress = Math.max(videoProgress, progress)
    }

    // Call with current values
    tempListener("starModel", assetCache.starModel.isLoaded ? 100 : 0)
    tempListener("video", assetCache.video.isLoaded ? 100 : 0)
  })

  // Weight video loading more heavily (60/40 split)
  const calculatedProgress = Math.round(videoProgress * 0.6 + starModelProgress * 0.4)

  // Ensure we return a value between 0-100
  return Math.max(0, Math.min(100, calculatedProgress))
}

// Start preloading as early as possible - only on initial page load
if (typeof window !== "undefined") {
  console.log("Starting early asset preloading")

  // Use requestIdleCallback or setTimeout to not block the main thread
  const startPreloading = () => {
    preloadAllAssets().catch((error) => {
      console.warn("Error during initial asset preloading:", error)
    })
  }

  if ("requestIdleCallback" in window) {
    ;(window as any).requestIdleCallback(startPreloading)
  } else {
    setTimeout(startPreloading, 1000)
  }
}

