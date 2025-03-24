"use client"

import { useState, useEffect, useRef } from "react"
import { getCachedAssets, assetLoader } from "@/utils/asset-preloader"

interface PreloadedAssets {
  video: HTMLVideoElement | null
  isLoading: boolean
  isLoaded: boolean
  videoObjectUrl: string | null
}

export function usePreloadedAssets(): PreloadedAssets {
  const [assets, setAssets] = useState<PreloadedAssets>(() => {
    // Initialize with whatever is in the cache
    const cached = getCachedAssets()
    console.log("usePreloadedAssets initial state:", {
      hasVideo: !!cached.video,
      isLoaded: cached.isLoaded,
      hasObjectUrl: !!cached.videoObjectUrl,
    })
    return {
      video: cached.video,
      isLoading: !cached.isLoaded,
      isLoaded: cached.isLoaded,
      videoObjectUrl: cached.videoObjectUrl,
    }
  })

  const isMountedRef = useRef(true)
  const loadInitiatedRef = useRef(false)
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // This effect runs only once per component lifecycle
  useEffect(() => {
    isMountedRef.current = true

    // If assets are already loaded, no need to do anything
    if (assets.isLoaded && assets.video) {
      console.log("usePreloadedAssets: Assets already loaded, skipping load")
      return
    }

    // Use our ref to track if we've initiated loading from this hook instance
    if (!loadInitiatedRef.current) {
      console.log("usePreloadedAssets: Initiating asset loading")
      loadInitiatedRef.current = true

      // Use the singleton service to initiate loading
      assetLoader.initiatePreloading()

      // Set up a polling mechanism to check for asset completion
      checkIntervalRef.current = setInterval(() => {
        if (!isMountedRef.current) {
          if (checkIntervalRef.current) {
            clearInterval(checkIntervalRef.current)
            checkIntervalRef.current = null
          }
          return
        }

        const cached = getCachedAssets()

        // Only update if there's a change in loaded state or new assets available
        if (
          cached.isLoaded !== assets.isLoaded ||
          (!assets.video && cached.video) ||
          (!assets.videoObjectUrl && cached.videoObjectUrl)
        ) {
          console.log("usePreloadedAssets: Assets updated from interval check", {
            hasVideo: !!cached.video,
            isLoaded: cached.isLoaded,
            hasObjectUrl: !!cached.videoObjectUrl,
          })

          if (isMountedRef.current) {
            setAssets({
              video: cached.video,
              isLoading: !cached.isLoaded,
              isLoaded: cached.isLoaded,
              videoObjectUrl: cached.videoObjectUrl,
            })
          }

          // If everything is loaded, we can stop checking
          if (cached.isLoaded && cached.video) {
            if (checkIntervalRef.current) {
              clearInterval(checkIntervalRef.current)
              checkIntervalRef.current = null
            }
          }
        }
      }, 200) // Check every 200ms for faster updates
    }

    return () => {
      isMountedRef.current = false
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current)
        checkIntervalRef.current = null
      }
    }
  }, [assets.isLoaded, assets.video, assets.videoObjectUrl])

  return assets
}

