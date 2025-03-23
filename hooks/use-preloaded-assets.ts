"use client"

import { useState, useEffect } from "react"
import type * as THREE from "three"
import { getCachedAssets, preloadAllAssets, areAllAssetsLoaded } from "@/utils/asset-preloader"

interface PreloadedAssets {
  starModel: THREE.Group | null
  video: HTMLVideoElement | null
  isLoading: boolean
  isLoaded: boolean
}

export function usePreloadedAssets(): PreloadedAssets {
  const [assets, setAssets] = useState<PreloadedAssets>(() => {
    const cached = getCachedAssets()
    return {
      starModel: cached.starModel,
      video: cached.video,
      isLoading: !areAllAssetsLoaded(),
      isLoaded: areAllAssetsLoaded(),
    }
  })

  useEffect(() => {
    // If assets are already loaded, no need to do anything
    if (assets.isLoaded) return

    let isMounted = true

    // Start preloading if not already loaded
    preloadAllAssets()
      .then(({ starModel, video }) => {
        if (!isMounted) return

        setAssets({
          starModel,
          video,
          isLoading: false,
          isLoaded: true,
        })
      })
      .catch((error) => {
        console.error("Error preloading assets:", error)

        if (!isMounted) return

        // Even on error, update state with whatever we have
        const cached = getCachedAssets()
        setAssets({
          starModel: cached.starModel,
          video: cached.video,
          isLoading: false,
          isLoaded: true,
        })
      })

    return () => {
      isMounted = false
    }
  }, [assets.isLoaded])

  return assets
}

