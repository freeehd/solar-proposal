"use client"

import { useRef, useState, useEffect } from "react"
import { AnimatePresence } from "framer-motion"
import { Sun } from "lucide-react"
import { useMediaQuery } from "@/hooks/use-media-query"
import Image from "next/image"

interface HeroSectionProps {
  name: string
  address: string
  onReady?: () => void
}

export default function HeroSection({ name, address, onReady }: HeroSectionProps) {
  const [isVideoLoaded, setIsVideoLoaded] = useState(false)
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)
  const [showPlaceholder, setShowPlaceholder] = useState(true)
  const videoRef = useRef<HTMLVideoElement>(null)

  // Media queries for responsive design
  const isMobile = useMediaQuery("(max-width: 640px)")
  const isTablet = useMediaQuery("(min-width: 641px) and (max-width: 1024px)")

  // Simplified video loading strategy
  useEffect(() => {
    const video = videoRef.current
    if (!video) {
      // If video element isn't available, still notify we're ready
      if (onReady) onReady()
      return
    }

    const handleCanPlay = () => {
      setIsVideoLoaded(true)
      video
        .play()
        .then(() => {
          setIsVideoPlaying(true)
          setTimeout(() => {
            setShowPlaceholder(false)
            if (onReady) onReady()
          }, 500)
        })
        .catch(() => {
          // If autoplay fails, still mark as ready
          if (onReady) onReady()
        })
    }

    // If video is already loaded
    if (video.readyState >= 3) {
      handleCanPlay()
    } else {
      video.addEventListener("canplay", handleCanPlay, { once: true })
    }

    return () => {
      video.removeEventListener("canplay", handleCanPlay)
    }
  }, [onReady])

  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Static placeholder image that shows while video loads */}
      <AnimatePresence>
        {showPlaceholder && (
          <div className="absolute inset-0 z-0 bg-black">
            <Image
              src="/video-placeholder.jpg"
              alt="Solar background"
              fill
              priority
              className="object-cover"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/30" />
          </div>
        )}
      </AnimatePresence>

      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        <div
          className={`absolute inset-0 transition-opacity duration-1000 ${isVideoPlaying ? "opacity-100" : "opacity-0"}`}
        >
          <video
            ref={videoRef}
            className="absolute h-full w-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
          >
            <source src="/video3.webm" type="video/webm" />
            Your browser does not support the video tag.
          </video>
        </div>

        {/* Gradient overlay for better text contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/10 to-black/10" />
      </div>

      {/* Content Container */}
      <div className="relative z-10 h-full flex flex-col">
        {/* Top section with main heading */}
        <div className="flex-1 flex items-center justify-center px-4 sm:px-6 md:px-12">
          <div className="w-full max-w-6xl mx-auto">
            <div className="text-center relative">
              {/* Sun icon */}
              <div className="absolute -top-8 sm:-top-12 md:-top-16 text-yellow-400/90 flex justify-center w-full">
                <Sun size={isMobile ? 36 : isTablet ? 44 : 52} strokeWidth={1.5} />
              </div>

              {/* Text content */}
              <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white drop-shadow-md">
                Welcome to
                <span className="block mt-1 sm:mt-2 text-indigo-dye-700 text-4xl sm:text-5xl md:text-7xl lg:text-8xl">
                  Solar Future
                </span>
              </h1>

              {/* Underline */}
              <div className="h-0.5 bg-indigo-dye-500 mt-4 sm:mt-6 mx-auto w-[120px] sm:w-[160px] md:w-[200px]" />
            </div>
          </div>
        </div>

        {/* User information section */}
        {isMobile ? (
          <div className="w-full flex-grow flex flex-col">
            <div className="relative flex items-center justify-center mb-6">
              <div className="relative inline-block px-5 py-3 rounded-xl">
                <div className="absolute inset-0 bg-white/15 backdrop-blur-md rounded-xl border border-white/20" />
                <div className="relative z-10 text-center">
                  <p className="text-xl font-medium text-white mb-1 drop-shadow-md">
                    Hello, <span className="font-bold text-indigo-dye-700">{name}</span>
                  </p>
                  <p className="text-base text-white/80 drop-shadow-sm max-w-full truncate">{address}</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full">
            <div className="relative mx-auto max-w-5xl px-6 md:px-12 pb-12 pt-12">
              <div className="absolute inset-0 bg-white/15 backdrop-blur-md rounded-t-3xl border-t border-white/20" />
              <div className="relative z-10 flex flex-col md:flex-row items-center md:items-end justify-between gap-8">
                <div className="text-center md:text-left">
                  <p className="text-2xl md:text-3xl lg:text-4xl font-medium text-white mb-3 drop-shadow-md">
                    Hello, <span className="font-bold text-indigo-dye-700">{name}</span>
                  </p>
                  <p className="text-xl md:text-2xl text-white/80 drop-shadow-sm max-w-full truncate">{address}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-dye-400/0 via-indigo-dye-400 to-indigo-dye-400/0" />
    </section>
  )
}

