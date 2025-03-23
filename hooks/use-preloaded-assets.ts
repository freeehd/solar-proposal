"use client"

import { useState, useEffect, useRef } from "react"
import type * as THREE from "three"
import { getCachedAssets, preloadAllAssets, getStarMaterial } from "@/utils/asset-preloader"

interface PreloadedAssets {
  starModel: THREE.Group | null
  video: HTMLVideoElement | null
  isLoading: boolean
  isLoaded: boolean
  // Add materials to the interface
  materials: Map<string, THREE.Material> | null
}

// Global flag to ensure we only load assets once across all hook instances
let globalLoadingInitiated = false

// Improve the usePreloadedAssets hook to ensure the star model is properly cached and shared
// Add a debug log to track when assets are being accessed
export function usePreloadedAssets(): PreloadedAssets {
  const [assets, setAssets] = useState<PreloadedAssets>(() => {
    // Initialize with whatever is in the cache
    const cached = getCachedAssets()
    console.log("usePreloadedAssets initial state:", {
      hasStarModel: !!cached.starModel,
      hasVideo: !!cached.video,
      isLoaded: cached.isLoaded,
      materialsCount: cached.materials ? cached.materials.size : 0,
    })
    return {
      starModel: cached.starModel,
      video: cached.video,
      isLoading: !cached.isLoaded,
      isLoaded: cached.isLoaded,
      materials: cached.materials,
    }
  })

  const isMountedRef = useRef(true)
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const loadTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // This effect runs only once per app lifecycle
  useEffect(() => {
    isMountedRef.current = true

    // If assets are already loaded, no need to do anything
    if (assets.isLoaded) {
      console.log("usePreloadedAssets: Assets already loaded, skipping load")
      return
    }

    // Only initiate loading if it hasn't been started yet
    if (!globalLoadingInitiated) {
      console.log("usePreloadedAssets: Initiating global asset loading")
      globalLoadingInitiated = true

      // Start loading assets with a slight delay to prioritize UI rendering
      loadTimeoutRef.current = setTimeout(() => {
        preloadAllAssets()
          .then(() => {
            if (!isMountedRef.current) return

            console.log("usePreloadedAssets: Assets loaded successfully")
            const cached = getCachedAssets()
            console.log("usePreloadedAssets after load:", {
              hasStarModel: !!cached.starModel,
              hasVideo: !!cached.video,
              isLoaded: cached.isLoaded,
              materialsCount: cached.materials ? cached.materials.size : 0,
            })
            setAssets({
              starModel: cached.starModel,
              video: cached.video,
              isLoading: false,
              isLoaded: true,
              materials: cached.materials,
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
              materials: cached.materials,
            })
          })
      }, 500) // Small delay to prioritize UI rendering
    } else {
      console.log("usePreloadedAssets: Global loading already initiated, waiting for completion")

      // If loading was already initiated elsewhere, just check for updates
      checkIntervalRef.current = setInterval(() => {
        if (!isMountedRef.current) {
          if (checkIntervalRef.current) {
            clearInterval(checkIntervalRef.current)
            checkIntervalRef.current = null
          }
          return
        }

        const cached = getCachedAssets()
        if (cached.isLoaded) {
          console.log("usePreloadedAssets: Assets now available in cache")
          console.log("usePreloadedAssets from interval:", {
            hasStarModel: !!cached.starModel,
            hasVideo: !!cached.video,
            isLoaded: cached.isLoaded,
            materialsCount: cached.materials ? cached.materials.size : 0,
          })
          setAssets({
            starModel: cached.starModel,
            video: cached.video,
            isLoading: false,
            isLoaded: true,
            materials: cached.materials,
          })

          if (checkIntervalRef.current) {
            clearInterval(checkIntervalRef.current)
            checkIntervalRef.current = null
          }
        }
      }, 500)
    }

    return () => {
      isMountedRef.current = false
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current)
        checkIntervalRef.current = null
      }
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current)
        loadTimeoutRef.current = null
      }
    }
  }, [assets.isLoaded])

  return assets
}

// Add a new hook to get a specific material
export function useStarMaterial(key = "default"): THREE.Material | null {
  const { materials, isLoaded } = usePreloadedAssets()

  // If materials aren't loaded yet, return null
  if (!isLoaded || !materials) {
    return null
  }

  // Get the material from the cache or create a new one
  return getStarMaterial(key)
}

