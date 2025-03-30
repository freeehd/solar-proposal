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
  const [scaleFactor, setScaleFactor] = useState(0)

  // Media queries for responsive design
  const isMobile = useMediaQuery("(max-width: 640px)")
  const isTablet = useMediaQuery("(min-width: 641px) and (max-width: 1024px)")

  const [params, setParams] = useState({
    edge: 0.01,
    patternBlur: 0.05,
    patternScale: 2,
    refraction: 0.02,
    speed: 0.15,
    liquid: 0.4,
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

  // Update scale factor based on screen size
  useEffect(() => {
    if (isMobile) {
      setScaleFactor(1)
    } else if (isTablet) {
      setScaleFactor(1.5)
    } else {
      setScaleFactor(2)
    }
  }, [isMobile, isTablet])

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

  // Calculate responsive dimensions based on container size
  const calculateDimensions = () => {
    if (!containerWidth || !imageData || !svgDimensions.width || !svgDimensions.height) {
      return { width: 0, height: 0 }
    }

    // Base width on container width and apply scale factor
    const aspectRatio = svgDimensions.height / svgDimensions.width
    
    // Calculate width with proper scaling
    let width = 600
    
    // Calculate height based on aspect ratio with limits
    const height = Math.min(
      Math.round(width * aspectRatio),
      isMobile ? 120 : isTablet ? 120 : 120
    )

    return { width, height }
  }

  const dimensions = calculateDimensions()

  return (
    <div ref={containerRef} className="relative w-full flex justify-center items-center">
      {loading && (
        <div className="flex items-center justify-center w-full py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      )}

      {error && (
        <div className="error-fallback p-2 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg w-full">
          ⚠️ {error} - Please ensure your SVG meets the requirements
        </div>
      )}

      {imageData && !loading && !error && dimensions.width > 0 && (
        <div className="w-full flex justify-center items-center">
          <MetallicPaint 
            imageData={imageData} 
            params={params} 
            width={dimensions.width} 
            height={dimensions.height} 
          />
        </div>
      )}
    </div>
  )
}

export default MetallicEffect

