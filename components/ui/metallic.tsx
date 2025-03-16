"use client"

import MetallicPaint, { parseLogoImage } from "@/components/ui/MetallicPaint"
import { useState, useEffect, useRef } from "react"
import { useMediaQuery } from "@/hooks/use-media-query"

const MetallicEffect = () => {
  const [imageData, setImageData] = useState<ImageData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [svgDimensions, setSvgDimensions] = useState({ width: 500, height: 500 })
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState(0)

  // Media queries for responsive design
  const isMobile = useMediaQuery("(max-width: 640px)")
  const isTablet = useMediaQuery("(min-width: 641px) and (max-width: 1024px)")

  const [params, setParams] = useState({
    edge: 0.01,
    patternBlur: 0.09,
    patternScale: 2,
    refraction: 0.0,
    speed: 0.15,
    liquid: 0.0,
    color1: "#F1F4F9", //
    color2: "#1a1a1a", //
  })

  // Calculate and update container width on resize
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth)
      }
    }

    // Initial calculation
    updateWidth()

    // Add resize listener
    window.addEventListener("resize", updateWidth)

    // Cleanup
    return () => window.removeEventListener("resize", updateWidth)
  }, [])

  useEffect(() => {
    let isMounted = true

    async function loadDefaultImage() {
      try {
        setLoading(true)

        // 1. Add cache busting for development
        const response = await fetch("/thicker-icon.svg?t=" + Date.now())
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)

        // 2. Verify SVG MIME type
        const type = response.headers.get("Content-Type")
        if (!type?.includes("image/svg+xml")) {
          throw new Error("Invalid MIME type for SVG")
        }

        const blob = await response.blob()
        const file = new File([blob], "icon.svg", { type: "image/svg+xml" })

        // 3. Add timeout for image processing
        const { imageData, width, height } = await Promise.race([
          parseLogoImage(file),
          new Promise<never>((_, reject) => setTimeout(() => reject(new Error("Image processing timeout")), 5000)),
        ])

        if (isMounted) {
          setImageData(imageData)
          setSvgDimensions({ width, height }) // Set the SVG dimensions from the result
          setLoading(false)
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Failed to load metallic effect")
          setLoading(false)
        }
        console.error("Metallic effect error:", err)
      }
    }

    loadDefaultImage()

    return () => {
      isMounted = false
    }
  }, [])

  // Calculate responsive dimensions while maintaining aspect ratio
  const calculateDimensions = () => {
    if (!containerWidth || !svgDimensions.width || !svgDimensions.height) {
      return { width: "100%", height: 40 }
    }

    // Base width on container width
    const width = containerWidth

    // Calculate height based on original aspect ratio
    const aspectRatio = svgDimensions.height / svgDimensions.width
    const height = Math.round(width * aspectRatio)

    // Adjust height for different screen sizes
    const adjustedHeight = isMobile ? Math.min(height, 40) : isTablet ? Math.min(height, 60) : Math.min(height, 80)

    return { width, height: adjustedHeight }
  }

  const dimensions = calculateDimensions()

  return (
    <div ref={containerRef} className="relative w-full flex justify-start place-items-start">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/10 z-10 rounded-lg">
          <div className="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      )}

      {error && (
        <div className="error-fallback p-2 sm:p-3 md:p-4 text-sm sm:text-base text-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg">
          ⚠️ {error} - Please ensure your SVG meets the requirements
        </div>
      )}

      {imageData && !loading && !error && (
        <div
          className="w-full"
          style={{
            paddingTop: 0,
            height: isMobile ? 40 : isTablet ? 60 : 80,
          }}
        >
          <MetallicPaint imageData={imageData} params={params} width={dimensions.width} height={dimensions.height} />
        </div>
      )}
    </div>
  )
}

export default MetallicEffect

