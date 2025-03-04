"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Sun } from "lucide-react"
import MetallicPaint, { parseLogoImage } from "@/components/ui/MetallicPaint"

// Import your logo SVG
// If you're using Next.js, make sure the SVG is in the public folder
// or properly imported from your assets directory
import logo from "@/public/icon.svg"

export default function LoadingScreen() {
    const [loading, setLoading] = useState(true)
    const [imageData, setImageData] = useState<ImageData | null>(null)

    // Load the logo using parseLogoImage
    useEffect(() => {
        async function loadDefaultImage() {
            try {
                const response = await fetch(logo.src || logo)
                const blob = await response.blob()
                const file = new File([blob], "default.svg", { type: blob.type })
                const { imageData } = await parseLogoImage(file)
                setImageData(imageData)
            } catch (err) {
                console.error("Error loading default image:", err)

                // Create a fallback image if loading fails
                try {
                    const response = await fetch("/icon.svg")
                    const blob = await response.blob()
                    const file = new File([blob], "icon.svg", { type: blob.type })
                    const { imageData } = await parseLogoImage(file)
                    setImageData(imageData)
                } catch (fallbackErr) {
                    console.error("Error loading fallback image:", fallbackErr)
                }
            }
        }

        loadDefaultImage()
    }, [])

    // Simulate loading completion after 5 seconds
    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false)
        }, 5000)

        return () => clearTimeout(timer)
    }, [])

    return (
        <AnimatePresence>
            {loading && (
                <motion.div
                    className="fixed inset-0 flex flex-col items-center justify-center z-50 animated-sky-gradient overflow-hidden"
                    exit={{
                        opacity: 0,
                        transition: {
                            duration: 1.2,
                            ease: "easeInOut",
                        },
                    }}
                >
                    {/* Animated background elements */}
                    <div className="absolute inset-0 w-full h-full">
                        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white via-sky-100 to-sky-200 animate-gradient-shift"></div>
                        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-tr from-transparent via-sky-50/30 to-sky-100/40 animate-shimmer"></div>
                    </div>

                    <div className="relative flex flex-col items-center justify-center h-64 z-10">
                        {/* Sun icon animation */}
                        <motion.div
                            initial={{ y: 100, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{
                                type: "spring",
                                stiffness: 50,
                                damping: 20,
                                duration: 1.5,
                            }}
                            className="relative z-10"
                        >
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{
                                    duration: 8,
                                    ease: "linear",
                                    repeat: Number.POSITIVE_INFINITY,
                                }}
                            >
                                <Sun size={64} className="text-amber-500 drop-shadow" strokeWidth={1.5} />
                            </motion.div>
                        </motion.div>

                        {/* Company logo animation */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{
                                delay: 1,
                                duration: 1.5,
                                ease: "easeOut",
                            }}
                            className="mt-12 text-center"
                        >

                            <p className="mt-2 text-sm text-sky-600">Illuminating your digital experience</p>
                        </motion.div>
                    </div>

                    {/* Loading indicator */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.5, duration: 1 }}
                        className="mt-16 relative z-10"
                    >
                        <div className="flex items-center justify-center space-x-2">
                            <div className="h-2 w-2 rounded-full bg-sky-400 animate-pulse"></div>
                            <div className="h-2 w-2 rounded-full bg-sky-400 animate-pulse" style={{ animationDelay: "0.2s" }}></div>
                            <div className="h-2 w-2 rounded-full bg-sky-400 animate-pulse" style={{ animationDelay: "0.4s" }}></div>
                        </div>

                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

