"use client"

import React, { useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart2, Thermometer, Shield } from "lucide-react"
import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { PremiumIcon } from "@/components/premium-icon"
import { BeamOverlay } from "./beam-overlay"
import { IconPortalLayer } from "./icon-portal-layer"
import Image from "next/image"

interface SolarDesignSectionProps {
  proposalData?: {
    numberOfSolarPanels?: string
    yearlyEnergyProduced?: string
    yearlyEnergyUsage?: string
    energyOffset?: string
    solarPanelSize?: string
    lifetimeSavings?: string
    solarPanelDesign?: string // New prop for solar panel design image
    batteryImage?: string // New prop for battery image
  }
}

export default function SolarDesignSection({
  proposalData = {
    numberOfSolarPanels: "24",
    yearlyEnergyProduced: "12,500",
    yearlyEnergyUsage: "14,000",
    energyOffset: "85",
    solarPanelSize: "8.4",
    lifetimeSavings: "42,000",
    solarPanelDesign: "/placeholder.svg", // Default placeholder
    batteryImage: "/placeholder.svg", // Default placeholder
  },
}: SolarDesignSectionProps) {
  const energyOffset = Number.parseInt(proposalData.energyOffset || "0", 10)

  // Refs for the icons and circle
  const icon1Ref = useRef<HTMLDivElement>(null)
  const icon2Ref = useRef<HTMLDivElement>(null)
  const icon3Ref = useRef<HTMLDivElement>(null)
  const icon4Ref = useRef<HTMLDivElement>(null)
  const circleRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const sectionRef = useRef<HTMLElement>(null)

  // Use Framer Motion's useInView hook
  const isInView = useInView(sectionRef, {
    once: true, // Only trigger once
    amount: 0.3, // Trigger when 30% of the section is visible
  })

  // Track if animation sequence has started
  const [hasStarted, setHasStarted] = React.useState(false)

  // State for tracking which icons are being charged
  const [chargingStates, setChargingStates] = React.useState({
    icon1: false,
    icon2: false,
    icon3: false,
    icon4: false,
    circle: false,
  })

  // Text reveal states
  const [textRevealStates, setTextRevealStates] = React.useState({
    text1: false,
    text2: false,
    text3: false,
    text4: false,
    circleText: false,
  })

  // Start animation sequence when section comes into view
  React.useEffect(() => {
    if (isInView && !hasStarted) {
      setHasStarted(true)
    }
  }, [isInView, hasStarted])

  // Trigger text reveal after icon charging
  React.useEffect(() => {
    // For each icon, trigger text reveal after charging
    if (chargingStates.icon1) {
      setTimeout(() => setTextRevealStates((prev) => ({ ...prev, text1: true })), 300)
    }
    if (chargingStates.icon2) {
      setTimeout(() => setTextRevealStates((prev) => ({ ...prev, text2: true })), 300)
    }
    if (chargingStates.icon3) {
      setTimeout(() => setTextRevealStates((prev) => ({ ...prev, text3: true })), 300)
    }
    if (chargingStates.icon4) {
      setTimeout(() => setTextRevealStates((prev) => ({ ...prev, text4: true })), 300)
    }
    if (chargingStates.circle) {
      setTimeout(() => setTextRevealStates((prev) => ({ ...prev, circleText: true })), 300)
    }
  }, [chargingStates])

  const handleBeamProgress = useCallback(
    (beamId: string, progress: number) => {
      if (beamId === "beam1") {
        if (progress > 0.05 && !chargingStates.icon1) {
          setChargingStates((prev) => ({ ...prev, icon1: true }))
        }
        if (progress > 0.8) {
          setChargingStates((prev) => ({ ...prev, icon2: true }))
        }
      } else if (beamId === "beam2") {
        if (progress > 0.05 && !chargingStates.icon2) {
          setChargingStates((prev) => ({ ...prev, icon2: true }))
        }
        if (progress > 0.8) {
          setChargingStates((prev) => ({ ...prev, icon3: true }))
        }
      } else if (beamId === "beam3") {
        if (progress > 0.05 && !chargingStates.icon3) {
          setChargingStates((prev) => ({ ...prev, icon3: true }))
        }
        if (progress > 0.8) {
          setChargingStates((prev) => ({ ...prev, icon4: true }))
        }
      } else if (beamId === "beam4") {
        if (progress > 0.05 && !chargingStates.icon4) {
          setChargingStates((prev) => ({ ...prev, icon4: true }))
        }
        if (progress > 0.8) {
          setChargingStates((prev) => ({ ...prev, circle: true }))
        }
      }
    },
    [chargingStates],
  )

  const handleChargingComplete = useCallback((iconKey: keyof typeof chargingStates) => {
    setTimeout(() => {
      setChargingStates((prev) => {
        if (prev[iconKey]) {
          return { ...prev, [iconKey]: false }
        }
        return prev
      })
    }, 1000)
  }, [])

  return (
    <section ref={sectionRef} className="relative py-24 bg-gradient-to-b from-white to-slate-50">
      {/* Background gradients */}
      <div className="absolute inset-0" style={{ zIndex: "var(--z-index-base)" }}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-50 via-white to-transparent opacity-70" />
        <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-blue-50/30 to-transparent" />
        <div className="absolute bottom-0 right-0 w-1/2 h-64 bg-gradient-to-t from-blue-50/20 to-transparent rounded-full blur-3xl" />
      </div>

      {/* Main container */}
      <div className="container relative mx-auto px-4" ref={containerRef}>
        {/* Cards layer */}
        <div className="relative" style={{ zIndex: "var(--z-index-cards)" }}>
          {/* Cards layer */}
          <div
            className="relative isolate"
            style={{
              transform: "translate3d(0,0,0)",
            }}
          >
            {/* Content layer */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7 }}
              className="text-center mb-20"
            >
              <h2 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-800 to-blue-600 mb-6 tracking-tight">
                Your Premium Solar Solution
              </h2>
              <p className="text-slate-600 max-w-2xl mx-auto text-lg">
                Designed exclusively for your home's energy profile, our premium solar system delivers exceptional
                performance and maximum long-term value.
              </p>
            </motion.div>

            {/* Design Images Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="grid md:grid-cols-2 gap-8 mb-16"
            >
              {/* Solar Panel Design */}
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-gradient-to-br from-blue-100/50 to-white shadow-xl border border-blue-100/50">
                <Image
                  src={
                    // proposalData.solarPanelDesign ||
                    "/solar.png?height=600&width=800" || "/placeholder.svg"
                  }
                  alt="Solar Panel Design"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <h3 className="text-lg font-semibold mb-1">Solar Panel Layout</h3>
                  <p className="text-sm text-white/90">Optimized placement for maximum sun exposure</p>
                </div>
              </div>

              {/* Battery Design */}
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-gradient-to-br from-blue-100/50 to-white shadow-xl border border-blue-100/50">
                <Image
                  src={
                    // proposalData.batteryImage ||
                    "/Batteries/3.jpeg?height=600&width=800" || "/placeholder.svg"
                  }
                  alt="Battery System"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <h3 className="text-lg font-semibold mb-1">Battery System</h3>
                  <p className="text-sm text-white/90">Energy storage for continuous power supply</p>
                </div>
              </div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mt-12">
              {/* Main card */}
              <motion.div className="col-span-1 md:col-span-2">
                <Card className="bg-white/90 backdrop-blur-xl border border-blue-100/50 shadow-2xl overflow-visible rounded-xl h-full">
                  <CardContent className="flex items-center justify-center min-h-[320px] py-20">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-12 w-full px-4">
                      {/* Icon placeholders with fixed heights */}
                      <div className="flex flex-col items-center space-y-5 w-full">
                        <div ref={icon1Ref} className="h-[112px] w-full flex items-center justify-center" />
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{
                            opacity: textRevealStates.text1 ? 1 : 0,
                            y: textRevealStates.text1 ? 0 : 10,
                            scale: chargingStates.icon1 ? [1, 1.05, 1] : 1,
                          }}
                          transition={{
                            opacity: { duration: 0.8, ease: "easeOut" },
                            y: { duration: 0.8, ease: "easeOut" },
                            scale: { duration: 0.3 },
                          }}
                          className="text-center w-full"
                        >
                          <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: textRevealStates.text1 ? 1 : 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-1"
                          >
                            System Size
                          </motion.p>
                          <motion.p
                            initial={{ opacity: 0, y: 5 }}
                            animate={{
                              opacity: textRevealStates.text1 ? 1 : 0,
                              y: textRevealStates.text1 ? 0 : 5,
                            }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-blue-500"
                          >
                            {proposalData.solarPanelSize || "0"} kW
                          </motion.p>
                        </motion.div>
                      </div>

                      {/* Repeat for other icons with the same structure */}
                      <div className="flex flex-col items-center space-y-5 w-full">
                        <div ref={icon2Ref} className="h-[112px] w-full flex items-center justify-center" />
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{
                            opacity: textRevealStates.text2 ? 1 : 0,
                            y: textRevealStates.text2 ? 0 : 10,
                            scale: chargingStates.icon2 ? [1, 1.05, 1] : 1,
                          }}
                          transition={{
                            opacity: { duration: 0.8, ease: "easeOut" },
                            y: { duration: 0.8, ease: "easeOut" },
                            scale: { duration: 0.3 },
                          }}
                          className="text-center w-full"
                        >
                          <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: textRevealStates.text2 ? 1 : 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="text-sm font-medium text-slate-500 uppercase tracking-normal mb-1"
                          >
                            Solar Panels
                          </motion.p>
                          <motion.p
                            initial={{ opacity: 0, y: 5 }}
                            animate={{
                              opacity: textRevealStates.text2 ? 1 : 0,
                              y: textRevealStates.text2 ? 0 : 5,
                            }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-blue-500"
                          >
                            {proposalData.numberOfSolarPanels || "0"}
                          </motion.p>
                        </motion.div>
                      </div>

                      <div className="flex flex-col items-center space-y-5 w-full">
                        <div ref={icon3Ref} className="h-[112px] w-full flex items-center justify-center" />
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{
                            opacity: textRevealStates.text3 ? 1 : 0,
                            y: textRevealStates.text3 ? 0 : 10,
                            scale: chargingStates.icon3 ? [1, 1.05, 1] : 1,
                          }}
                          transition={{
                            opacity: { duration: 0.8, ease: "easeOut" },
                            y: { duration: 0.8, ease: "easeOut" },
                            scale: { duration: 0.3 },
                          }}
                          className="text-center w-full"
                        >
                          <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: textRevealStates.text3 ? 1 : 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="text-sm font-medium text-slate-500 uppercase tracking-normal mb-1"
                          >
                            Annual Consumption
                          </motion.p>
                          <motion.p
                            initial={{ opacity: 0, y: 5 }}
                            animate={{
                              opacity: textRevealStates.text3 ? 1 : 0,
                              y: textRevealStates.text3 ? 0 : 5,
                            }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-blue-500"
                          >
                            {proposalData.yearlyEnergyUsage || "0"} kWh
                          </motion.p>
                        </motion.div>
                      </div>

                      <div className="flex flex-col items-center space-y-5 w-full">
                        <div ref={icon4Ref} className="h-[112px] w-full flex items-center justify-center" />
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{
                            opacity: textRevealStates.text4 ? 1 : 0,
                            y: textRevealStates.text4 ? 0 : 10,
                            scale: chargingStates.icon4 ? [1, 1.05, 1] : 1,
                          }}
                          transition={{
                            opacity: { duration: 0.8, ease: "easeOut" },
                            y: { duration: 0.8, ease: "easeOut" },
                            scale: { duration: 0.3 },
                          }}
                          className="text-center w-full"
                        >
                          <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: textRevealStates.text4 ? 1 : 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="text-sm font-medium text-slate-500 uppercase tracking-normal mb-1"
                          >
                            Annual Production
                          </motion.p>
                          <motion.p
                            initial={{ opacity: 0, y: 5 }}
                            animate={{
                              opacity: textRevealStates.text4 ? 1 : 0,
                              y: textRevealStates.text4 ? 0 : 5,
                            }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-blue-500"
                          >
                            {proposalData.yearlyEnergyProduced || "0"} kWh
                          </motion.p>
                        </motion.div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Circle card */}
              <motion.div>
                <Card className="bg-white/90 backdrop-blur-xl border border-blue-100/50 shadow-2xl h-full rounded-xl">
                  <CardContent className="flex flex-col items-center justify-center min-h-[320px] py-8">
                    <div ref={circleRef} className="h-[208px] flex items-center justify-center" />
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{
                        opacity: textRevealStates.circleText ? 1 : 0,
                        y: textRevealStates.circleText ? 0 : 20,
                      }}
                      transition={{
                        opacity: { duration: 0.8, ease: "easeOut" },
                        y: { duration: 0.8, ease: "easeOut" },
                      }}
                      className="mt-8 text-center"
                    >
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: textRevealStates.circleText ? 1 : 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-1"
                      >
                        Lifetime Savings
                      </motion.p>
                      <motion.p
                        initial={{ opacity: 0, y: 5 }}
                        animate={{
                          opacity: textRevealStates.circleText ? 1 : 0,
                          y: textRevealStates.circleText ? 0 : 5,
                        }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-500"
                      >
                        ${Number(proposalData.lifetimeSavings || 0).toLocaleString()}
                      </motion.p>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Technology section */}
            <motion.div className="mt-16 relative isolate">
              <Card className="bg-white/90 backdrop-blur-xl border border-blue-100/50 shadow-2xl overflow-hidden rounded-xl">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-white border-b border-blue-50 py-6">
                  <CardTitle className="text-2xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-800 to-blue-600">
                    Premium Solar Technology
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-10 pb-8">
                  <motion.p
                    className="text-center mb-10 text-slate-600 max-w-3xl mx-auto text-lg"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7, duration: 0.5 }}
                  >
                    Our premium solar panels utilize cutting-edge photovoltaic technology to maximize energy conversion
                    efficiency. Engineered with premium materials, they deliver exceptional performance in all weather
                    conditions with an industry-leading lifespan.
                  </motion.p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    <motion.div
                      className="flex flex-col items-center text-center"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8, duration: 0.5 }}
                    >
                      <PremiumIcon className="w-24 h-24 mb-5">
                        <BarChart2 className="w-12 h-12 text-blue-600" />
                      </PremiumIcon>
                      <p className="font-semibold text-slate-700 text-lg mb-2">Elite Efficiency</p>
                      <p className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-blue-500">
                        20-22%
                      </p>
                      <p className="text-sm text-slate-500 mt-2">Industry-leading conversion rate</p>
                    </motion.div>

                    <motion.div
                      className="flex flex-col items-center text-center"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.9, duration: 0.5 }}
                    >
                      <PremiumIcon className="w-24 h-24 mb-5">
                        <Thermometer className="w-12 h-12 text-blue-600" />
                      </PremiumIcon>
                      <p className="font-semibold text-slate-700 text-lg mb-2">Temperature Resilience</p>
                      <p className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-blue-500">
                        -0.35% / °C
                      </p>
                      <p className="text-sm text-slate-500 mt-2">Superior heat performance</p>
                    </motion.div>

                    <motion.div
                      className="flex flex-col items-center text-center"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1, duration: 0.5 }}
                    >
                      <PremiumIcon className="w-24 h-24 mb-5">
                        <Shield className="w-12 h-12 text-blue-600" />
                      </PremiumIcon>
                      <p className="font-semibold text-slate-700 text-lg mb-2">Premium Warranty</p>
                      <p className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-blue-500">
                        25 Years
                      </p>
                      <p className="text-sm text-slate-500 mt-2">Comprehensive performance guarantee</p>
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>

        {/* Beam overlay - Only show when animation should start */}
        {hasStarted && (
          <div className="absolute inset-0 overflow-visible" style={{ zIndex: "var(--z-index-beams)" }}>
            <BeamOverlay
              containerRef={containerRef}
              icon1Ref={icon1Ref}
              icon2Ref={icon2Ref}
              icon3Ref={icon3Ref}
              icon4Ref={icon4Ref}
              circleRef={circleRef}
              onBeamProgress={handleBeamProgress}
            />
          </div>
        )}

        {/* Icon portal layer */}
        <IconPortalLayer
          icon1Ref={icon1Ref}
          icon2Ref={icon2Ref}
          icon3Ref={icon3Ref}
          icon4Ref={icon4Ref}
          circleRef={circleRef}
          chargingStates={chargingStates}
          onChargingComplete={handleChargingComplete}
          energyOffset={energyOffset}
          containerRef={containerRef}
          shouldAnimate={hasStarted}
          textRevealStates={textRevealStates}
        />
      </div>
    </section>
  )
}

