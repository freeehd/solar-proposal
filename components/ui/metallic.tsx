"use client"

import MetallicPaint, { parseLogoImage } from "@/components/ui/MetallicPaint"
import { useState, useEffect } from "react"

const MetallicEffect = () => {
  const [imageData, setImageData] = useState<ImageData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [svgDimensions, setSvgDimensions] = useState({ width: 500, height: 500 })

  const [params, setParams] = useState({
    edge: 0.01,
    patternBlur: 0.0,
    patternScale: 2,
    refraction: 0.02,
    speed: 0.3,
    liquid: 0.02,
    color1: "#fafaFF", // 
    color2: "#1a1a1a", // 
  })

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
          console.log(width, height)
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

  return (
    <div className="relative w-full flex justify-start place-items-start">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/10 z-10 rounded-lg">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      )}

      {error && (
        <div className="error-fallback p-4 text-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg">
          ⚠️ {error} - Please ensure your SVG meets the requirements
        </div>
      )}

      {imageData && !loading && !error && (
        <div className=" " style={{paddingTop:10, width: 500, height: 80 }}>
          <MetallicPaint
            imageData={imageData}
            params={params}
            width={500}
            height={80}
          />
        </div>
      )}
    </div>
  )
}

export default MetallicEffect

