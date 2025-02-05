"use client"

import { useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { ArrowRight, Sun } from "lucide-react"

interface HeroSectionProps {
  name: string
  address: string
}

export default function HeroSection({ name, address }: HeroSectionProps) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  })

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "20%"])
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.9])
  const rotateZ = useTransform(scrollYProgress, [0, 0.5], [0, -5])

  return (
    <motion.section
      ref={ref}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{ y, opacity }}
    >
      <div className=" opacity-10" />
      <div className="absolute inset-0 overflow-hidden">
        <video
          className="absolute top-1/2 left-1/2 min-w-full min-h-full object-cover -translate-x-1/2 -translate-y-1/2"
          autoPlay
          muted
          loop
          playsInline
        >
          <source
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/fields-POvLWFhvuVfy2JVLNlZHs052lC5iiS.mp4"
            type="video/mp4"
          />
          Your browser does not support the video tag.
        </video>
        <div className="absolute inset-0 bg-black/50" /> {/* Overlay for better text visibility */}
      </div>
      <div className="container mx-auto px-4 pt-20 pb-32 relative z-20">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div style={{ scale, rotateZ }} className="relative z-10">
              <motion.div
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                className="relative"
              >
                <span className="absolute -left-8 -top-8 text-primary/20 text-8xl font-bold">01</span>
                <h1 className="dramatic-text font-bold mb-8 text-shadow-lg">
                  Welcome to
                  <br />
                  <span className="accent-text">Solar Future</span>
                </h1>
              </motion.div>
              <motion.div
                className="space-y-4"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              >
                <p className="text-xl md:text-2xl text-muted-foreground font-light">
                  Hello, <span className="text-primary font-medium">{name}</span>
                </p>
                <p className="text-lg text-muted-foreground/80 font-light tracking-wide">{address}</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="mt-12"
              >
                <button className="group bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8 py-4 rounded-full transition-all duration-300 flex items-center shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30">
                  Explore Your Proposal
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                </button>
              </motion.div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="relative aspect-square hidden lg:block"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent rounded-full animate-pulse" />
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <Sun className="w-32 h-32 text-primary/30" />
              </motion.div>
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                  className="w-48 h-48 rounded-full bg-gradient-to-br from-primary/30 to-transparent blur-xl"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.section>
  )
}

