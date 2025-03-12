"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { motion, AnimatePresence, useAnimation } from "framer-motion"
import { cn } from "@/lib/utils"
import { ChargeParticles } from "./ui/charge-particles"
import { RippleEffect } from "./ui/ripple-effect"

interface PremiumIconProps {
  className?: string
  children: React.ReactNode
  isCharging?: boolean
  onChargingComplete?: () => void
  delay?: number
}

export function PremiumIcon({ className, children, isCharging, onChargingComplete, delay = 0 }: PremiumIconProps) {
  const controls = useAnimation()
  const [progress, setProgress] = useState(0)
  const [showRipple, setShowRipple] = useState(false)
  const [hasAppeared, setHasAppeared] = useState(false)
  const [hasCompletedCharging, setHasCompletedCharging] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [isCharged, setIsCharged] = useState(false)

  // Initial appearance animation
  useEffect(() => {
    const initialAppearance = async () => {
      if (!hasAppeared && !isCharging) {
        await controls.start({
          scale: [0.8, 1],
          opacity: [0, 1],
          transition: {
            duration: 0.4,
            ease: "easeOut",
            delay: delay,
          },
        })
        setHasAppeared(true)
      }
    }
    initialAppearance()
  }, [controls, delay, hasAppeared, isCharging])

  // Charging animation
  useEffect(() => {
    const handleCharging = async () => {
      if (isCharging && !isAnimating && !hasCompletedCharging) {
        setIsAnimating(true)
        setProgress(0)
        setShowRipple(false)
        setHasAppeared(false)

        const duration = 1200
        const startTime = Date.now()

        await controls.start({
          scale: 0.9,
          opacity: 1,
          transition: { duration: 0.2, ease: "easeIn" },
        })

        const animate = () => {
          const elapsed = Date.now() - startTime
          const newProgress = Math.min(elapsed / duration, 1)
          setProgress(newProgress)

          if (newProgress < 1) {
            requestAnimationFrame(animate)
          } else {
            setHasAppeared(true)
            setShowRipple(true)
            setHasCompletedCharging(true)
            setIsCharged(true) // Add this line to set the charged state
            controls
              .start({
                scale: 1,
                opacity: 1,
                transition: { duration: 0.3, ease: "easeOut" },
              })
              .then(() => {
                setIsAnimating(false)
                onChargingComplete?.()
                setTimeout(() => {
                  setShowRipple(false)
                }, 1000)
              })
          }
        }

        requestAnimationFrame(animate)
      }
    }

    handleCharging()
  }, [isCharging, isAnimating, hasCompletedCharging, controls, onChargingComplete])

  return (
    <div
      className="relative isolate"
      style={{
        zIndex: 100,
        position: "relative",
      }}
    >
      <motion.div
        className={cn(
          "relative flex items-center justify-center rounded-full bg-gradient-to-br from-blue-50 to-white shadow-xl border border-blue-100/50",
          // Responsive padding based on screen size - reduced for mobile
          "p-1.5 xs:p-2 sm:p-3 md:p-3.5 lg:p-5",
          className,
        )}
        initial={{ scale: 1, opacity: 0 }}
        animate={controls}
        whileHover={{
          scale: 1.09,
          boxShadow: "0 15px 30px -10px rgba(0, 0, 0, 0.15)",
        }}
      >
        {/* Background gradient */}
        <div
          className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500/5 to-blue-600/10 opacity-50"
          style={{ zIndex: 1 }}
          aria-hidden="true"
        />

        {/* Glow effect during charging */}
        <motion.div
          className="absolute inset-0 rounded-full bg-blue-400/20"
          style={{ zIndex: 2 }}
          initial={{ opacity: 0 }}
          animate={{
            opacity: isCharging && !hasAppeared ? [0, 0.5, 0.3] : 0,
            scale: isCharging && !hasAppeared ? [1, 1.05, 1] : 1,
          }}
          transition={{
            duration: 1,
            repeat: 0,
          }}
        />

        {/* Circular rotating animation */}
        <AnimatePresence>
          {isCharging && !hasAppeared && (
            <motion.div
              className="absolute inset-[-3px] sm:inset-[-4px] md:inset-[-5px] lg:inset-[-8px] pointer-events-none"
              style={{ zIndex: 10 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <defs>
                  <linearGradient id="circleGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="rgba(113, 244, 103, 0.9)" />
                    <stop offset="100%" stopColor="rgba(113, 255, 246, 0.1)" />
                  </linearGradient>
                </defs>
                <motion.circle
                  cx="50"
                  cy="50"
                  r="48"
                  fill="none"
                  stroke="url(#circleGradient)"
                  strokeWidth="5"
                  strokeLinecap="round"
                  initial={{ rotate: 0 }}
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 10,
                    ease: "linear",
                    repeat: Number.POSITIVE_INFINITY,
                  }}
                />
              </svg>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Ripple effect on completion */}
        <AnimatePresence mode="wait">
          {showRipple && (
            <>
              <RippleEffect delay={0} duration={1} />
              <RippleEffect delay={0.2} duration={1} />
            </>
          )}
        </AnimatePresence>

        {/* Persistent green ring after charging */}
        <AnimatePresence>
          {isCharged && (
            <motion.div
              className="absolute inset-[-1px] xs:inset-[-1.5px] sm:inset-[-2px] md:inset-[-3px] lg:inset-[-4px] pointer-events-none"
              style={{ zIndex: 5 }}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="48" fill="none" stroke="rgba(52, 211, 153, 0.8)" strokeWidth="3" />
              </svg>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Charge particles */}
        <AnimatePresence>
          {isCharging && !hasAppeared && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative"
              style={{ zIndex: 3 }}
            >
              <ChargeParticles progress={progress} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Icon content - make the children responsive */}
        <motion.div
          className="relative"
          style={{
            zIndex: 4,
            transform: "translate3d(0,0,0)", // Force GPU acceleration
          }}
          initial={{ opacity: 1 }}
          animate={{
            scale: isCharging && !hasAppeared ? [1, 1.1, 1] : 1,
            opacity: 1,
          }}
          transition={{
            duration: 0.6,
            ease: "easeInOut",
          }}
        >
          {/* Wrap children to ensure they scale properly */}
          <div className="transform scale-[0.75] xs:scale-[0.8] sm:scale-[0.9] md:scale-[0.95] lg:scale-100">
            {children}
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}

