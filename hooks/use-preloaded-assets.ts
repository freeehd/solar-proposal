"use client"

import { useState, useEffect, useRef } from "react"
import type * as THREE from "three"
import { getCachedAssets, preloadAllAssets } from "@/utils/asset-preloader"

interface PreloadedAssets {
  starModel: THREE.Group | null
  video: HTMLVideoElement | null
  isLoading: boolean
  isLoaded: boolean
}

// Global flag to ensure we only load assets once across all hook instances
let globalLoadingInitiated = false

export function usePreloadedAssets(): PreloadedAssets {
  const [assets, setAssets] = useState<PreloadedAssets>(() => {
    // Initialize with whatever is in the cache
    const cached = getCachedAssets()
    return {
      starModel: cached.starModel,
      video: cached.video,
      isLoading: !cached.isLoaded,
      isLoaded: cached.isLoaded,
    }
  })

  const isMountedRef = useRef(true)

  // This effect runs only once per app lifecycle
  useEffect(() => {
    isMountedRef.current = true

    // If assets are already loaded, no need to do anything
    if (assets.isLoaded) {
      console.log("usePreloadedAssets: Assets already loaded")
      return
    }

    // Only initiate loading if it hasn't been started yet
    if (!globalLoadingInitiated) {
      console.log("usePreloadedAssets: Initiating global asset loading")
      globalLoadingInitiated = true

      // Start loading assets
      preloadAllAssets()
        .then(() => {
          if (!isMountedRef.current) return

          console.log("usePreloadedAssets: Assets loaded successfully")
          const cached = getCachedAssets()
          setAssets({
            starModel: cached.starModel,
            video: cached.video,
            isLoading: false,
            isLoaded: true,
          })
        })
        .catch((error) => {
          console.error("usePreloadedAssets: Error loading assets:", error)

          if (!isMountedRef.current) return

          // Even on error, update state with whatever we have
          const cached = getCachedAssets()
          setAssets({
            starModel: cached.starModel,
            video: cached.video,
            isLoading: false,
            isLoaded: cached.isLoaded,
          })
        })
    } else {
      console.log("usePreloadedAssets: Global loading already initiated, waiting for completion")

      // If loading was already initiated elsewhere, just check for updates
      const checkInterval = setInterval(() => {
        if (!isMountedRef.current) {
          clearInterval(checkInterval)
          return
        }

        const cached = getCachedAssets()
        if (cached.isLoaded) {
          console.log("usePreloadedAssets: Assets now available in cache")
          setAssets({
            starModel: cached.starModel,
            video: cached.video,
            isLoading: false,
            isLoaded: true,
          })
          clearInterval(checkInterval)
        }
      }, 500)

      // Clean up interval
      return () => clearInterval(checkInterval)
    }

    return () => {
      isMountedRef.current = false
    }
  }, [assets.isLoaded])

  return assets
}

