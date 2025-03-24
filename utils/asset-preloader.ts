// Asset URLs
const VIDEO_URL = "/video3.webm"
const FALLBACK_VIDEO_URL = "/video3.mp4"

// Debug tracking
let videoLoadCount = 0
// Track active video requests to prevent duplicates
const activeVideoRequests = new Set<string>()
// Track method calls that are in progress
const preloadMethodCalls = new Set<string>()

function logVideoLoadAttempt(source: string) {
  videoLoadCount++
  console.log(`VIDEO LOAD ATTEMPT #${videoLoadCount} from ${source}`, {
    timestamp: new Date().toISOString(),
    isAppleDevice,
    cacheState: {
      isLoaded: assetCache.video.isLoaded,
      isLoading: assetCache.video.isLoading,
      hasElement: !!assetCache.video.element,
      hasPromise: !!assetCache.video.loadPromise,
    },
  })
}

// Device detection helpers
export const isAppleDevice =
  typeof window !== "undefined" &&
  (/iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1) ||
    /Mac/.test(navigator.platform) ||
    /^((?!chrome|android).)*safari/i.test(navigator.userAgent) ||
    (!!navigator.userAgent.match(/AppleWebKit/) && !navigator.userAgent.match(/Chrome/)))

// Global singleton asset cache with improved structure
type AssetCache = {
  video: {
    element: HTMLVideoElement | null
    isLoaded: boolean
    isLoading: boolean
    error: Error | null
    loadPromise: Promise<HTMLVideoElement> | null
    lastLoadAttempt: number
    objectUrl: string | null
  }
  initialLoadComplete: boolean
  preloadingInitiated: boolean
}

// Initialize global cache as a singleton
const assetCache: AssetCache = {
  video: {
    element: null,
    isLoaded: false,
    isLoading: false,
    error: null,
    loadPromise: null,
    lastLoadAttempt: 0,
    objectUrl: null,
  },
  initialLoadComplete: false,
  preloadingInitiated: false,
}

// Event system for loading progress
type ProgressListener = (type: "video", progress: number) => void
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

function notifyProgress(type: "video", progress: number) {
  progressListeners.forEach((listener) => listener(type, progress))
}

// Centralized Asset Loader Service using Singleton pattern
class AssetLoaderService {
  private static instance: AssetLoaderService
  private loadingPromises: Map<string, Promise<any>> = new Map()
  private loadingInitiated = false

  // Private constructor to prevent direct instantiation
  private constructor() {}

  public static getInstance(): AssetLoaderService {
    if (!AssetLoaderService.instance) {
      AssetLoaderService.instance = new AssetLoaderService()
    }
    return AssetLoaderService.instance
  }

  // Check if video is already in cache (memory or session storage)
  private getVideoFromCache(): HTMLVideoElement | null {
    // Check memory cache first
    if (assetCache.video.isLoaded && assetCache.video.element) {
      console.log("Video found in memory cache")
      return assetCache.video.element
    }

    // Check session storage for video load status
    try {
      const videoStatus = sessionStorage.getItem("videoLoadStatus")
      if (videoStatus === "loaded") {
        console.log("Video previously loaded according to session storage")
        // We still need to create a new video element, but we know it should be in browser cache
        const video = this.createOptimizedVideoElement()
        video.src = isAppleDevice ? FALLBACK_VIDEO_URL : VIDEO_URL
        assetCache.video.element = video
        assetCache.video.isLoaded = true
        return video
      }
    } catch (e) {
      // Session storage might be unavailable in some contexts
      console.warn("Could not access session storage", e)
    }

    return null
  }

  // Mark video as loaded in session storage
  private markVideoAsLoaded(): void {
    try {
      sessionStorage.setItem("videoLoadStatus", "loaded")
    } catch (e) {
      console.warn("Could not update session storage", e)
    }
  }

  // Create an optimized video element with platform-specific settings
  private createOptimizedVideoElement(): HTMLVideoElement {
    const video = document.createElement("video")
    video.muted = true
    video.playsInline = true
    video.loop = true
    video.preload = "auto"
    // Set anonymous crossOrigin to allow CORS requests without credentials
    video.crossOrigin = "anonymous"

    // Platform-specific optimizations
    if (isAppleDevice) {
      video.setAttribute("playsinline", "")
      video.setAttribute("webkit-playsinline", "")
      video.setAttribute("x-webkit-airplay", "allow")
      // Don't set autoplay attribute here - it can trigger loading
    }

    // Add data attribute to identify our preloaded videos
    video.dataset.preloaded = "true"

    return video
  }

  // Try direct loading without fetch for CORS issues
  public tryDirectVideoLoading(): Promise<HTMLVideoElement> {
    console.log("Attempting direct video loading (bypassing fetch) due to CORS issues")

    return new Promise<HTMLVideoElement>((resolve) => {
      const videoUrl = isAppleDevice ? FALLBACK_VIDEO_URL : VIDEO_URL
      const video = this.createOptimizedVideoElement()

      // Set up event listeners
      video.addEventListener(
        "canplaythrough",
        () => {
          console.log("Direct loading: Video can play through")
          assetCache.video.element = video
          assetCache.video.isLoaded = true
          assetCache.video.isLoading = false
          this.markVideoAsLoaded()
          notifyProgress("video", 100)
          resolve(video)
        },
        { once: true },
      )

      video.addEventListener(
        "loadeddata",
        () => {
          console.log("Direct loading: Video data loaded")
          // For iOS, we consider the video loaded when data is loaded
          if (isAppleDevice && !assetCache.video.isLoaded) {
            assetCache.video.element = video
            assetCache.video.isLoaded = true
            assetCache.video.isLoading = false
            this.markVideoAsLoaded()
            notifyProgress("video", 100)
            resolve(video)
          }
        },
        { once: true },
      )

      video.addEventListener(
        "error",
        () => {
          console.error("Direct loading: Video error:", video.error)
          // Create a placeholder video element
          const placeholderVideo = this.createOptimizedVideoElement()
          placeholderVideo.poster = "/night3.png"

          assetCache.video.element = placeholderVideo
          assetCache.video.isLoaded = true
          assetCache.video.isLoading = false
          notifyProgress("video", 100)
          resolve(placeholderVideo)
        },
        { once: true },
      )

      // Set source and start loading
      video.src = videoUrl
      video.load()

      // Set timeout to prevent indefinite loading
      setTimeout(() => {
        if (!assetCache.video.isLoaded) {
          console.warn("Direct loading: Video loading timed out, using placeholder")
          // Create a placeholder video element
          const placeholderVideo = this.createOptimizedVideoElement()
          placeholderVideo.poster = "/night3.png"

          assetCache.video.element = placeholderVideo
          assetCache.video.isLoaded = true
          assetCache.video.isLoading = false
          notifyProgress("video", 100)
          resolve(placeholderVideo)
        }
      }, 10000) // 10 second timeout
    })
  }

  public preloadVideo(): Promise<HTMLVideoElement> {
    const cacheKey = "mainVideo"
    const videoUrl = isAppleDevice ? FALLBACK_VIDEO_URL : VIDEO_URL

    // CRITICAL FIX: Check if this method call is already in progress
    if (preloadMethodCalls.has(cacheKey)) {
      console.log("preloadVideo method call already in progress, reusing result")
      // If we have a promise, return it
      if (this.loadingPromises.has(cacheKey)) {
        return this.loadingPromises.get(cacheKey)!
      }

      // If we have a cached video, return it
      const cachedVideo = this.getVideoFromCache()
      if (cachedVideo) {
        console.log("Using cached video from duplicate method call")
        return Promise.resolve(cachedVideo)
      }

      // If we're here, something went wrong with tracking. Create a new promise as fallback
      console.warn("Method call tracking inconsistency detected, creating new promise")
    }

    // Mark this method call as in progress
    preloadMethodCalls.add(cacheKey)

    logVideoLoadAttempt("preloadVideo method")

    // Check if we already have a cached video
    const cachedVideo = this.getVideoFromCache()
    if (cachedVideo) {
      console.log("Video found in memory cache")
      // Clean up method call tracking
      setTimeout(() => preloadMethodCalls.delete(cacheKey), 100)
      return Promise.resolve(cachedVideo)
    }

    // Check global request tracker
    if (activeVideoRequests.has(videoUrl)) {
      console.log(`Video ${videoUrl} already being fetched globally, waiting...`)

      // Create a promise that resolves when the existing request completes
      const waitPromise = new Promise<HTMLVideoElement>((resolve) => {
        const checkInterval = setInterval(() => {
          const cached = this.getVideoFromCache()
          if (cached) {
            clearInterval(checkInterval)
            resolve(cached)
          }
        }, 100)

        // Safety timeout after 10 seconds
        setTimeout(() => {
          clearInterval(checkInterval)
          const cached = this.getVideoFromCache() || this.createOptimizedVideoElement()
          resolve(cached)
        }, 10000)
      })

      // Store this promise
      this.loadingPromises.set(cacheKey, waitPromise)

      // Clean up method call tracking when promise resolves
      waitPromise.finally(() => {
        setTimeout(() => {
          preloadMethodCalls.delete(cacheKey)
          this.loadingPromises.delete(cacheKey)
        }, 100)
      })

      return waitPromise
    }

    // Add to global tracker
    activeVideoRequests.add(videoUrl)

    // Return existing promise if already loading
    if (this.loadingPromises.has(cacheKey)) {
      console.log("Video loading already in progress, reusing promise")
      return this.loadingPromises.get(cacheKey)!
    }

    // Create new loading promise
    console.log("Starting new video loading process")

    // Try with fetch first, but fall back to direct loading if CORS issues occur
    let loadPromise: Promise<HTMLVideoElement>

    try {
      loadPromise = this.createVideoLoadPromise().catch((error) => {
        console.error("Error with fetch-based loading, trying direct loading:", error)
        return this.tryDirectVideoLoading()
      })
    } catch (error) {
      console.error("Could not create video load promise, using direct loading:", error)
      loadPromise = this.tryDirectVideoLoading()
    }

    this.loadingPromises.set(cacheKey, loadPromise)

    // Clear promise from map when settled to prevent memory leaks
    loadPromise.finally(() => {
      activeVideoRequests.delete(videoUrl) // Remove from global tracker
      setTimeout(() => {
        preloadMethodCalls.delete(cacheKey) // Remove from method call tracker
        this.loadingPromises.delete(cacheKey)
      }, 100)
    })

    return loadPromise
  }

  private createVideoLoadPromise(): Promise<HTMLVideoElement> {
    // Update last attempt timestamp
    assetCache.video.lastLoadAttempt = Date.now()

    // Start loading
    console.log("Creating new video load promise")
    assetCache.video.isLoading = true
    notifyProgress("video", 0)

    return new Promise<HTMLVideoElement>((resolve) => {
      // Always use MP4 for Apple devices
      const videoUrl = isAppleDevice ? FALLBACK_VIDEO_URL : VIDEO_URL
      console.log(`Using video URL: ${videoUrl} (isAppleDevice: ${isAppleDevice})`)

      // Create video element
      const video = this.createOptimizedVideoElement()

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
            this.markVideoAsLoaded()
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
        this.markVideoAsLoaded()
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
          this.markVideoAsLoaded()
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
        const placeholderVideo = this.createOptimizedVideoElement()
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
            this.markVideoAsLoaded()
            notifyProgress("video", 100)
            resolve(video)
          } else {
            console.warn("Video loading timed out, using placeholder")
            // Create a placeholder video element
            const placeholderVideo = this.createOptimizedVideoElement()
            placeholderVideo.poster = "/night3.png"

            assetCache.video.element = placeholderVideo
            assetCache.video.isLoaded = true
            assetCache.video.isLoading = false
            notifyProgress("video", 100)
            resolve(placeholderVideo)
          }
        }
      }, 10000) // 10 second timeout

      // Try to fetch the video as a blob first for better caching
      fetch(videoUrl, {
        method: "GET",
        mode: "cors",
        // Don't send credentials to avoid CORS preflight requests
        credentials: "omit",
        // Don't add custom headers that would trigger preflight requests
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`Failed to fetch video: ${videoUrl}`)
          }
          return response.blob()
        })
        .then((blob) => {
          // Create an object URL from the blob
          const objectUrl = URL.createObjectURL(blob)

          // Store the object URL in the cache
          assetCache.video.objectUrl = objectUrl

          // Set the video source to the object URL
          video.src = objectUrl
          video.load()
        })
        .catch((error) => {
          console.error("Error fetching video as blob:", error)

          // IMPROVED FALLBACK: Try direct loading without fetch
          console.log("Trying direct video loading as fallback due to fetch issue")
          video.src = videoUrl
          video.load()

          // For local paths, we should still consider this a success
          // This helps with development environments where CORS might be an issue
          if (videoUrl.startsWith("/")) {
            console.log("Local video path detected, continuing with direct loading")
            // Don't reject the promise, let the video load events handle it
          }
        })

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

  // Add a function to create a video element directly from a URL
  // Add this function to the AssetLoaderService class:

  public createVideoElementFromUrl(url: string): HTMLVideoElement {
    console.log(`Creating video element directly from URL: ${url}`)

    // Create a new video element with optimized settings
    const video = this.createOptimizedVideoElement()

    // Set the source directly
    video.src = url
    video.load()

    return video
  }

  public async preloadAllAssets(): Promise<{
    video: HTMLVideoElement
  }> {
    console.log("preloadAllAssets called, initialLoadComplete:", assetCache.initialLoadComplete)

    // If initial load is already complete, return cached assets
    if (assetCache.initialLoadComplete) {
      console.log("Initial load already complete, returning cached assets:", {
        hasVideo: !!assetCache.video.element,
      })
      return {
        video: assetCache.video.element!,
      }
    }

    // Mark preloading as initiated to prevent duplicate calls
    assetCache.preloadingInitiated = true

    console.log("Starting video loading")

    try {
      // Load video
      const video = await this.preloadVideo()

      console.log("Video loaded successfully:", {
        hasVideo: !!video,
      })

      // Mark initial load as complete
      assetCache.initialLoadComplete = true

      return { video }
    } catch (error) {
      console.error("Error in preloadAllAssets:", error)

      // Even on error, return whatever we have
      const placeholderVideo = this.createOptimizedVideoElement()
      placeholderVideo.poster = "/night3.png"

      const video = assetCache.video.element || placeholderVideo

      // Mark initial load as complete even on error
      assetCache.initialLoadComplete = true

      console.log("Video loaded with fallback:", {
        hasVideo: !!video,
      })

      return { video }
    }
  }

  public initiatePreloading(): void {
    if (this.loadingInitiated) {
      console.log("Preloading already initiated, skipping")
      return
    }

    this.loadingInitiated = true
    console.log("Initiating video preloading with proper scheduling")

    // Use a small delay to prioritize UI rendering
    setTimeout(() => {
      this.preloadAllAssets().catch((error) => {
        console.warn("Error during scheduled video preloading:", error)
      })
    }, 500)
  }

  // Create a video element from the cached video
  public createVideoElementFromCache(): HTMLVideoElement | null {
    if (!assetCache.video.isLoaded || !assetCache.video.element) {
      console.warn("No cached video available to create element from")
      return null
    }

    // Create a new video element
    const video = this.createOptimizedVideoElement()

    // If we have an object URL, use that
    if (assetCache.video.objectUrl) {
      video.src = assetCache.video.objectUrl
    }
    // Otherwise use the src from the cached element
    else if (assetCache.video.element.src) {
      video.src = assetCache.video.element.src
    }
    // Fallback to the original URL
    else {
      video.src = isAppleDevice ? FALLBACK_VIDEO_URL : VIDEO_URL
    }

    return video
  }
}

// Export a singleton instance
export const assetLoader = AssetLoaderService.getInstance()

// Export wrapper functions that use the singleton service
export function preloadVideo(): Promise<HTMLVideoElement> {
  logVideoLoadAttempt("preloadVideo function")
  return assetLoader.preloadVideo()
}

export async function preloadAllAssets(): Promise<{
  video: HTMLVideoElement
}> {
  return assetLoader.preloadAllAssets()
}

// Get cached assets - never triggers loading
export function getCachedAssets() {
  // Add detailed logging to help with debugging
  console.log("getCachedAssets called, returning:", {
    hasVideo: !!assetCache.video.element,
    isLoaded: assetCache.video.isLoaded,
    initialLoadComplete: assetCache.initialLoadComplete,
    hasObjectUrl: !!assetCache.video.objectUrl,
  })

  return {
    video: assetCache.video.element,
    isLoaded: assetCache.video.isLoaded,
    initialLoadComplete: assetCache.initialLoadComplete,
    videoObjectUrl: assetCache.video.objectUrl,
  }
}

// Export the function
export function createVideoElementFromUrl(url: string): HTMLVideoElement {
  return assetLoader.createVideoElementFromUrl(url)
}

// Improve the createVideoElementFromCache function to handle missing cache
export function createVideoElementFromCache(): HTMLVideoElement | null {
  const element = assetLoader.createVideoElementFromCache()

  if (!element && typeof window !== "undefined") {
    // If no cached element but we're in the browser, create a direct element
    console.log("No cached video available, creating direct element")
    const video = document.createElement("video")
    video.muted = true
    video.playsInline = true
    video.loop = true
    video.preload = "auto"
    video.crossOrigin = "anonymous"
    video.src = isAppleDevice ? FALLBACK_VIDEO_URL : VIDEO_URL
    return video
  }

  return element
}

// Check if all assets are loaded
export function areAllAssetsLoaded(): boolean {
  // Check if video is loaded
  const videoLoaded = assetCache.video.isLoaded && assetCache.video.element !== null

  // If we've been trying to load for more than 8 seconds, consider it loaded anyway
  const loadingTooLong = Date.now() - assetCache.video.lastLoadAttempt > 8000

  return videoLoaded || loadingTooLong
}

// Get overall loading progress (0-100)
export function getOverallProgress(): number {
  // If video is fully loaded, return 100% immediately
  if (areAllAssetsLoaded()) {
    return 100
  }

  // Get progress values from listeners
  let videoProgress = 0

  // Call each listener with a temporary function to capture current progress
  progressListeners.forEach((listener) => {
    const tempListener = (type: "video", progress: number) => {
      if (type === "video") videoProgress = Math.max(videoProgress, progress)
    }

    // Call with current values
    tempListener("video", assetCache.video.isLoaded ? 100 : 0)
  })

  // If we've been loading for more than 8 seconds, ensure progress is at least 90%
  const loadingTooLong = Date.now() - assetCache.video.lastLoadAttempt > 8000

  if (loadingTooLong && videoProgress < 90) {
    return 90
  }

  // Ensure we return a value between 0-100
  return Math.max(0, Math.min(100, videoProgress))
}

