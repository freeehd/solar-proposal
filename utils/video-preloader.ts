/**
 * Video Preloader
 * A utility to preload videos and make them available to components
 * with detailed logging and error handling
 */

// Track if preloading has been initiated
let preloadingInitiated = false

// Device detection helper
export const isAppleDevice =
  typeof window !== "undefined" &&
  (/iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1) ||
    /Mac/.test(navigator.platform) ||
    /^((?!chrome|android).)*safari/i.test(navigator.userAgent) ||
    (!!navigator.userAgent.match(/AppleWebKit/) && !navigator.userAgent.match(/Chrome/)))

// Video sources with fallbacks for different platforms
export const VIDEO_SOURCES = {
  hero: {
    src: "/video3.mp4", // Use MP4 for all devices to avoid CORS issues
    fallbackSrc: "/video3.webm",
    poster: "/night3.png",
  },
  day: {
    src: "/day.mp4",
    poster: "/day1.png",
  },
  night: {
    src: "/night.mp4",
    poster: "/night3.png",
  },
}

// Interface for preloaded videos
interface PreloadedVideos {
  hero: HTMLVideoElement | null
  day: HTMLVideoElement | null
  night: HTMLVideoElement | null
}

// Interface for loading progress
interface LoadingProgress {
  hero: number
  day: number
  night: number
  overall: number
}

// Singleton class to manage video preloading
class VideoPreloader {
  private static instance: VideoPreloader
  private videos: PreloadedVideos = {
    hero: null,
    day: null,
    night: null,
  }
  private progress: LoadingProgress = {
    hero: 0,
    day: 0,
    night: 0,
    overall: 0,
  }
  private isLoading = false
  private isLoaded = false
  private progressListeners: ((progress: LoadingProgress) => void)[] = []
  private completionListeners: (() => void)[] = []
  private loadStartTime = 0

  private constructor() {
    console.log("VideoPreloader: Instance created")
    this.loadStartTime = Date.now()
  }

  public static getInstance(): VideoPreloader {
    if (!VideoPreloader.instance) {
      VideoPreloader.instance = new VideoPreloader()
    }
    return VideoPreloader.instance
  }

  /**
   * Start preloading all videos
   * @returns Promise that resolves when all videos are loaded
   */
  public preloadVideos(): Promise<PreloadedVideos> {
    // If already loaded, return the videos immediately
    if (this.isLoaded) {
      console.log("VideoPreloader: Videos already loaded, returning cached videos")
      return Promise.resolve(this.videos)
    }

    // If already loading, return a promise that resolves when loading completes
    if (this.isLoading) {
      console.log("VideoPreloader: Already loading videos, returning existing promise")
      return new Promise((resolve) => {
        this.completionListeners.push(() => resolve(this.videos))
      })
    }

    this.isLoading = true
    this.loadStartTime = Date.now()
    console.log("VideoPreloader: Starting to preload all videos")

    // Create promises for each video
    const heroPromise = this.preloadVideo("hero", VIDEO_SOURCES.hero)
    const dayPromise = this.preloadVideo("day", VIDEO_SOURCES.day)
    const nightPromise = this.preloadVideo("night", VIDEO_SOURCES.night)

    // Wait for all videos to load
    return Promise.all([heroPromise, dayPromise, nightPromise])
      .then(() => {
        const loadTime = Date.now() - this.loadStartTime
        this.isLoaded = true
        this.isLoading = false
        this.progress.overall = 100

        console.log(`VideoPreloader: All videos preloaded successfully in ${loadTime}ms`)
        console.log("VideoPreloader: Video states:", {
          hero: this.videos.hero ? "loaded" : "failed",
          day: this.videos.day ? "loaded" : "failed",
          night: this.videos.night ? "loaded" : "failed",
        })

        // Notify all completion listeners
        this.completionListeners.forEach((listener) => listener())
        this.completionListeners = []

        return this.videos
      })
      .catch((error) => {
        console.error("VideoPreloader: Error preloading videos", error)

        // Even on error, mark as loaded and return whatever videos we have
        this.isLoaded = true
        this.isLoading = false
        this.progress.overall = 100

        console.log("VideoPreloader: Partial video states after error:", {
          hero: this.videos.hero ? "loaded" : "failed",
          day: this.videos.day ? "loaded" : "failed",
          night: this.videos.night ? "loaded" : "failed",
        })

        // Notify all completion listeners
        this.completionListeners.forEach((listener) => listener())
        this.completionListeners = []

        return this.videos
      })
  }

  /**
   * Preload a single video
   * @param key The key of the video (hero, day, night)
   * @param source The source information for the video
   * @returns Promise that resolves when the video is loaded
   */
  private preloadVideo(
    key: keyof PreloadedVideos,
    source: { src: string; fallbackSrc?: string; poster?: string },
  ): Promise<void> {
    console.log(`VideoPreloader: Starting to load ${key} video from ${source.src}`)

    return new Promise((resolve) => {
      // Create video element
      const video = document.createElement("video")
      video.muted = true
      video.playsInline = true
      video.loop = true
      video.preload = "auto"

      // Set poster if available
      if (source.poster) {
        video.poster = source.poster
      }

      // Track loading progress
      video.addEventListener("loadedmetadata", () => {
        console.log(`VideoPreloader: ${key} video metadata loaded`)
        this.progress[key] = 20
        this.updateOverallProgress()
      })

      video.addEventListener("loadeddata", () => {
        console.log(`VideoPreloader: ${key} video data loaded`)
        this.progress[key] = 50
        this.updateOverallProgress()
      })

      video.addEventListener("canplaythrough", () => {
        console.log(`VideoPreloader: ${key} video can play through`)
        this.progress[key] = 100
        this.updateOverallProgress()
        this.videos[key] = video
        resolve()
      })

      // Handle errors with better logging
      video.addEventListener("error", (e) => {
        console.error(`VideoPreloader: Error loading ${key} video:`, video.error)
        console.log(`Video source was: ${source.src}, error code: ${video.error?.code}`)

        // Try fallback if available
        if (source.fallbackSrc && source.fallbackSrc !== source.src) {
          console.log(`VideoPreloader: Trying fallback for ${key} video: ${source.fallbackSrc}`)
          video.src = source.fallbackSrc
          video.load()
        } else {
          console.log(`VideoPreloader: No fallback available for ${key} video, using poster instead`)
          // Mark as partially loaded and resolve anyway
          this.progress[key] = 100
          this.updateOverallProgress()

          // Still store the video element even if loading failed
          // It will display the poster image
          this.videos[key] = video
          resolve()
        }
      })

      // Set timeout to resolve even if video doesn't fully load
      setTimeout(() => {
        if (this.progress[key] < 100) {
          console.log(`VideoPreloader: Timeout for ${key} video, considering it loaded anyway`)
          this.progress[key] = 100
          this.updateOverallProgress()
          this.videos[key] = video
          resolve()
        }
      }, 10000) // 10 second timeout

      // Start loading with error handling
      try {
        console.log(`VideoPreloader: Setting src for ${key} video: ${source.src}`)
        video.src = source.src
        video.load()
      } catch (error) {
        console.error(`VideoPreloader: Exception during ${key} video loading:`, error)

        // Try fallback if available
        if (source.fallbackSrc) {
          console.log(`VideoPreloader: Trying fallback after exception for ${key} video: ${source.fallbackSrc}`)
          try {
            video.src = source.fallbackSrc
            video.load()
          } catch (fallbackError) {
            console.error(`VideoPreloader: Exception during fallback loading for ${key} video:`, fallbackError)
            this.progress[key] = 100
            this.updateOverallProgress()
            this.videos[key] = video // Still use the video element with poster
            resolve()
          }
        } else {
          this.progress[key] = 100
          this.updateOverallProgress()
          this.videos[key] = video // Still use the video element with poster
          resolve()
        }
      }
    })
  }

  /**
   * Update the overall progress based on individual video progress
   */
  private updateOverallProgress(): void {
    // Calculate overall progress as average of all videos
    const total = this.progress.hero + this.progress.day + this.progress.night
    this.progress.overall = Math.round(total / 3)

    console.log("VideoPreloader: Progress update:", {
      hero: this.progress.hero,
      day: this.progress.day,
      night: this.progress.night,
      overall: this.progress.overall,
    })

    // Notify all progress listeners
    this.progressListeners.forEach((listener) => listener({ ...this.progress }))
  }

  /**
   * Get the current loading progress
   * @returns The current loading progress
   */
  public getProgress(): LoadingProgress {
    return { ...this.progress }
  }

  /**
   * Add a listener for progress updates
   * @param listener The listener function
   * @returns A function to remove the listener
   */
  public addProgressListener(listener: (progress: LoadingProgress) => void): () => void {
    console.log("VideoPreloader: Adding progress listener")
    this.progressListeners.push(listener)

    // Immediately call with current progress
    listener({ ...this.progress })

    // Return function to remove listener
    return () => {
      const index = this.progressListeners.indexOf(listener)
      if (index !== -1) {
        this.progressListeners.splice(index, 1)
      }
    }
  }

  /**
   * Check if all videos are loaded
   * @returns True if all videos are loaded
   */
  public areVideosLoaded(): boolean {
    return this.isLoaded
  }

  /**
   * Get a preloaded video
   * @param key The key of the video to get
   * @returns The preloaded video element or null if not loaded
   */
  public getVideo(key: keyof PreloadedVideos): HTMLVideoElement | null {
    if (!this.videos[key]) {
      console.warn(`VideoPreloader: Requested ${key} video but it's not loaded yet`)
    }
    return this.videos[key]
  }

  /**
   * Create a clone of a preloaded video
   * @param key The key of the video to clone
   * @returns A new video element with the same source
   */
  public cloneVideo(key: keyof PreloadedVideos): HTMLVideoElement | null {
    const original = this.videos[key]
    if (!original) {
      console.warn(`VideoPreloader: Cannot clone ${key} video because it's not loaded yet`)
      return null
    }

    console.log(`VideoPreloader: Cloning ${key} video`)
    const clone = document.createElement("video")
    clone.muted = true
    clone.playsInline = true
    clone.loop = true
    clone.preload = "auto"

    // Copy poster if available
    if (original.poster) {
      clone.poster = original.poster
    }

    // Set the same source
    clone.src = original.src

    return clone
  }
}

// Export singleton instance
export const videoPreloader = VideoPreloader.getInstance()

// Helper functions
export function preloadAllVideos(): Promise<PreloadedVideos> {
  // Only initiate preloading once
  if (!preloadingInitiated) {
    preloadingInitiated = true
    console.log("VideoPreloader: Initiating preload from helper function")
    return videoPreloader.preloadVideos()
  } else {
    console.log("VideoPreloader: Preloading already initiated, returning existing promise")
    return videoPreloader.preloadVideos()
  }
}

export function getVideoLoadingProgress(): LoadingProgress {
  return videoPreloader.getProgress()
}

export function addVideoProgressListener(listener: (progress: LoadingProgress) => void): () => void {
  return videoPreloader.addProgressListener(listener)
}

export function areVideosLoaded(): boolean {
  const loaded = videoPreloader.areVideosLoaded()
  console.log(`VideoPreloader: areVideosLoaded check returned ${loaded}`)
  return loaded
}

export function getPreloadedVideo(key: keyof PreloadedVideos): HTMLVideoElement | null {
  return videoPreloader.getVideo(key)
}

export function clonePreloadedVideo(key: keyof PreloadedVideos): HTMLVideoElement | null {
  return videoPreloader.cloneVideo(key)
}

// Automatically start preloading if in browser environment
if (typeof window !== "undefined") {
  console.log("VideoPreloader: Auto-initializing preloader")
  // Use setTimeout to ensure this runs after the page has started loading
  setTimeout(() => {
    if (!preloadingInitiated) {
      console.log("VideoPreloader: Starting automatic preloading")
      preloadAllVideos().catch((error) => {
        console.error("VideoPreloader: Error during automatic preloading:", error)
      })
    }
  }, 100)
}

