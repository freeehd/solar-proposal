"use client"

import { useState, useEffect } from "react"

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    // Check if window is available (client-side)
    if (typeof window === "undefined") {
      return
    }

    const mediaQuery = window.matchMedia(query)

    // Set initial value
    setMatches(mediaQuery.matches)

    // Create event listener function
    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches)
    }

    // Add event listener with modern API
    try {
      mediaQuery.addEventListener("change", handleChange)

      // Cleanup
      return () => {
        mediaQuery.removeEventListener("change", handleChange)
      }
    } catch (e) {
      // Fallback for older browsers
      mediaQuery.addListener(handleChange)

      // Cleanup
      return () => {
        mediaQuery.removeListener(handleChange)
      }
    }
  }, [query])

  return matches
}

