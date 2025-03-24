/**
 * Video Cache Manager
 * A singleton service that handles video preloading and caching
 * with optimized handling for different platforms (Mac/Windows)
 */

import { isAppleDevice } from "./asset-preloader";

interface CachedVideo {
  element: HTMLVideoElement;
  blob?: Blob;
  objectUrl?: string;
  loadPromise: Promise<HTMLVideoElement>;
  lastAccessed: number;
  isLoaded: boolean;
}

// Track active video requests to prevent duplicates
const activeVideoRequests = new Set<string>();

class VideoCacheManager {
  private static instance: VideoCacheManager;
  private cache = new Map<string, CachedVideo>();
  private maxCacheSize = 10; // Maximum number of videos to keep in cache
  private cleanupInterval: NodeJS.Timeout | null = null;

  private constructor() {
    // Set up periodic cache cleanup
    this.cleanupInterval = setInterval(() => this.cleanupCache(), 60000); // Clean up every minute
  }

  public static getInstance(): VideoCacheManager {
    if (!VideoCacheManager.instance) {
      VideoCacheManager.instance = new VideoCacheManager();
    }
    return VideoCacheManager.instance;
  }

  /**
   * Preload a video and cache it
   * @param url The URL of the video to preload
   * @returns A promise that resolves to the preloaded video element
   */
  public preloadVideo(url: string): Promise<HTMLVideoElement> {
    console.log(`VideoCacheManager: Request to preload ${url}`);

    // Check if this URL is already being requested
    if (activeVideoRequests.has(url)) {
      console.log(`VideoCacheManager: ${url} already being requested, waiting for it to complete`);
      
      // If we have a cached entry with a promise, return it
      if (this.cache.has(url)) {
        const cachedEntry = this.cache.get(url)!;
        cachedEntry.lastAccessed = Date.now(); // Update last accessed time
        return cachedEntry.loadPromise;
      }
    }
    
    // Check if we already have this video cached and loaded
    if (this.cache.has(url)) {
      const cachedEntry = this.cache.get(url)!;
      
      if (cachedEntry.isLoaded) {
        console.log(`VideoCacheManager: Using fully loaded cached video: ${url}`);
        cachedEntry.lastAccessed = Date.now(); // Update last accessed time
        return Promise.resolve(cachedEntry.element);
      } else {
        console.log(`VideoCacheManager: Using cached promise for loading video: ${url}`);
        cachedEntry.lastAccessed = Date.now(); // Update last accessed time
        return cachedEntry.loadPromise;
      }
    }
    
    // Mark this URL as being processed
    activeVideoRequests.add(url);
    
    // Create a new video element with optimized settings
    const video = this.createOptimizedVideoElement();
    
    // Create cache entry with initial promise
    const cacheEntry: CachedVideo = {
      element: video,
      loadPromise: Promise.resolve(video), // Will be replaced below
      lastAccessed: Date.now(),
      isLoaded: false
    };
    
    // Create a promise that resolves when the video is loaded
    const videoLoadPromise = new Promise<HTMLVideoElement>((resolve, reject) => {
      // Set up event listeners
      video.addEventListener("loadeddata", () => {
        console.log(`VideoCacheManager: Video loaded: ${url}`);
        cacheEntry.isLoaded = true;
        resolve(video);
      }, { once: true });
      
      video.addEventListener("error", (e) => {
        console.error(`VideoCacheManager: Error loading video ${url}:`, e);
        reject(new Error(`Failed to load video: ${url}`));
      }, { once: true });
      
      // FIXED: Removed custom headers that were causing CORS issues
      // Use a simple fetch without custom headers to avoid CORS preflight
      fetch(url, {
        method: "GET",
        mode: "cors",
        credentials: "same-origin",
        // Removed cache-control header that was causing CORS issues
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`Failed to fetch video: ${url}`);
        }
        return response.blob();
      })
      .then(blob => {
        // Store the blob in the cache entry
        cacheEntry.blob = blob;
        
        // Create an object URL
        const objectUrl = URL.createObjectURL(blob);
        cacheEntry.objectUrl = objectUrl;
        
        // Set the video source and start loading
        video.src = objectUrl;
        video.load();
      })
      .catch(error => {
        console.error(`VideoCacheManager: Error fetching video ${url}:`, error);
        
        // FALLBACK: Try direct loading if fetch fails
        console.log(`VideoCacheManager: Trying direct video loading as fallback for ${url}`);
        video.src = url;
        video.load();
        
        // Don't reject here - let the video error event handle it if this fails too
      });
    });
    
    // Update the promise in the cache entry
    cacheEntry.loadPromise = videoLoadPromise.finally(() => {
      // Remove from active requests when done (success or failure)
      activeVideoRequests.delete(url);
    });
    
    // Store in cache
    this.cache.set(url, cacheEntry);
    
    return cacheEntry.loadPromise;
  }

  /**
   * Get a video from the cache if it exists
   * @param url The URL of the video to get
   * @returns The cached video element or null if not cached
   */
  public getVideo(url: string): HTMLVideoElement | null {
    if (!this.cache.has(url)) {
      return null;
    }
    
    const cachedEntry = this.cache.get(url)!;
    cachedEntry.lastAccessed = Date.now(); // Update last accessed time
    
    return cachedEntry.element;
  }

  /**
   * Apply a cached video to a target video element
   * @param url The URL of the cached video
   * @param targetElement The video element to apply the cached video to
   * @returns True if successful, false otherwise
   */
  public applyToElement(url: string, targetElement: HTMLVideoElement): boolean {
    if (!this.cache.has(url)) {
      console.log(`VideoCacheManager: No cached video found for ${url}, applying direct src`);
      // Fallback to direct loading
      targetElement.src = url;
      targetElement.load();
      return true;
    }
    
    const cachedEntry = this.cache.get(url)!;
    cachedEntry.lastAccessed = Date.now(); // Update last accessed time
    
    try {
      // Different handling for Apple devices
      if (isAppleDevice) {
        // For Apple devices, use the object URL if available
        if (cachedEntry.objectUrl) {
          targetElement.src = cachedEntry.objectUrl;
        } else if (cachedEntry.element.src) {
          targetElement.src = cachedEntry.element.src;
        } else {
          // Fallback to direct loading
          targetElement.src = url;
        }
      } else {
        // For non-Apple devices, use the src directly
        if (cachedEntry.objectUrl) {
          targetElement.src = cachedEntry.objectUrl;
        } else if (cachedEntry.element.src) {
          targetElement.src = cachedEntry.element.src;
        } else {
          // Fallback to direct loading
          targetElement.src = url;
        }
      }
      
      // Load the video
      targetElement.load();
      return true;
    } catch (error) {
      console.error("VideoCacheManager: Error applying cached video to element:", error);
      
      // Fallback to direct loading
      targetElement.src = url;
      targetElement.load();
      return true; // Still return true as we've applied a fallback
    }
  }

  /**
   * Create an optimized video element with platform-specific settings
   */
  private createOptimizedVideoElement(): HTMLVideoElement {
    const video = document.createElement("video");
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";
    video.crossOrigin = "anonymous";
    
    // Special handling for Apple devices
    if (isAppleDevice) {
      video.setAttribute("playsinline", "");
      video.setAttribute("webkit-playsinline", "");
      video.setAttribute("x-webkit-airplay", "allow");
    }
    
    return video;
  }

  /**
   * Clean up old cache entries to prevent memory leaks
   */
  private cleanupCache(): void {
    if (this.cache.size <= this.maxCacheSize) {
      return;
    }
    
    console.log(`VideoCacheManager: Cleaning up cache (size: ${this.cache.size})`);
    
    // Convert to array for sorting
    const entries = Array.from(this.cache.entries());
    
    // Sort by last accessed time (oldest first)
    entries.sort((a, b) => a[1].lastAccessed - b[1].lastAccessed);
    
    // Remove oldest entries until we're under the limit
    const entriesToRemove = entries.slice(0, entries.length - this.maxCacheSize);
    
    for (const [url, entry] of entriesToRemove) {
      console.log(`VideoCacheManager: Removing ${url} from cache`);
      
      // Revoke object URL to prevent memory leaks
      if (entry.objectUrl) {
        URL.revokeObjectURL(entry.objectUrl);
      }
      
      // Remove from cache
      this.cache.delete(url);
    }
  }

  /**
   * Clean up all resources when the page is unloaded
   */
  public cleanup(): void {
    console.log("VideoCacheManager: Cleaning up all resources");
    
    // Clear the cleanup interval
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    
    // Revoke all object URLs
    for (const [url, entry] of this.cache.entries()) {
      if (entry.objectUrl) {
        URL.revokeObjectURL(entry.objectUrl);
      }
    }
    
    // Clear the cache
    this.cache.clear();
    
    // Clear active requests
    activeVideoRequests.clear();
  }
}

// Export singleton instance
export const videoCacheManager = VideoCacheManager.getInstance();

// Add cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    videoCacheManager.cleanup();
  });
}
