"use client"
import { useCallback, useRef, useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart2, Thermometer, Shield, Battery, Zap, Sun, Home } from "lucide-react"
import { motion, useInView } from "framer-motion"
import { PremiumIcon } from "@/components/premium-icon"
import { CircularProgress } from "@/components/ui/circular-progress"
import { CountUp } from "@/components/count-up"
import Image from "next/image"
import { AnimatedBeam } from "./ui/animated-beam"

interface SolarDesignSectionProps {
  proposalData?: {
    numberOfSolarPanels?: string
    yearlyEnergyProduced?: string
    yearlyEnergyUsage?: string
    energyOffset?: string
    solarPanelSize?: string
    lifetimeSavings?: string
    solarPanelDesign?: string
    batteryImage?: string
    // Add storage section props
    batteryName?: string
    inverterName?: string
    capacity?: string
    outputKW?: string
    operatingMode?: string
    backupAllocation?: string
    essentialsDays?: string
    appliancesDays?: string
    wholeHomeDays?: string
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
    solarPanelDesign: "/placeholder.svg",
    batteryImage: "/placeholder.svg",
    // Add storage section defaults
    batteryName: "PowerWall 2",
    inverterName: "Solar Edge",
    capacity: "13.5",
    outputKW: "5",
    operatingMode: "Self-Powered",
    backupAllocation: "100%",
    essentialsDays: "5",
    appliancesDays: "3",
    wholeHomeDays: "1.5",
  },
}: SolarDesignSectionProps) {
  const energyOffset = Number.parseInt(proposalData.energyOffset || "0", 10)
  const lifetimeSavings = Number.parseInt(proposalData.lifetimeSavings?.replace(/,/g, "") || "0", 10)

  // Refs for the icons and container
  const icon1Ref = useRef<HTMLDivElement>(null)
  const icon2Ref = useRef<HTMLDivElement>(null)
  const batteryCapacityRef = useRef<HTMLDivElement>(null) // New ref for battery capacity
  const icon3Ref = useRef<HTMLDivElement>(null)
  const icon4Ref = useRef<HTMLDivElement>(null)
  const circleRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const sectionRef = useRef<HTMLElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const techSectionRef = useRef<HTMLDivElement>(null)

  // Use Framer Motion's useInView hook for main section and tech section
  const isInView = useInView(sectionRef, {
    once: true, // Only trigger once
    amount: 0.3, // Require 30% of the section to be visible (more reliable)
  })

  const isTechSectionInView = useInView(techSectionRef, {
    once: true,
    amount: 0.3,
  })

  // Track if animation sequence has started
  const [hasStarted, setHasStarted] = useState(false)
  const [techSectionVisible, setTechSectionVisible] = useState(false)

  // State for tracking which icons are being charged
  const [chargingStates, setChargingStates] = useState({
    icon1: false,
    icon2: false,
    batteryCapacity: false, // New charging state
    icon3: false,
    icon4: false,
    circle: false,
  })

  // Text reveal states
  const [textRevealStates, setTextRevealStates] = useState({
    text1: false,
    text2: false,
    batteryCapacityText: false, // New text reveal state
    text3: false,
    text4: false,
    circleText: false,
  })

  // Start animation sequence when section comes into view
  useEffect(() => {
    if (isInView && !hasStarted) {
      // Add a delay to ensure the section is fully visible before starting animations
      const timer = setTimeout(() => {
        console.log("Section in view, starting animations")
        setHasStarted(true)
      }, 800) // Longer delay to ensure section is properly visible

      return () => clearTimeout(timer)
    }
  }, [isInView, hasStarted])

  // Handle tech section visibility
  useEffect(() => {
    if (isTechSectionInView && !techSectionVisible) {
      const timer = setTimeout(() => {
        setTechSectionVisible(true)
      }, 400)

      return () => clearTimeout(timer)
    }
  }, [isTechSectionInView, techSectionVisible])

  // Add a useEffect to force activation on mobile after a delay
  useEffect(() => {
    // Only use this fallback if the section hasn't started animating after a longer period
    const timer = setTimeout(() => {
      if (!hasStarted && !isInView) {
        console.log("Fallback animation trigger activated")
        setHasStarted(true)
      }
    }, 3000) // Longer fallback delay (3 seconds)

    return () => clearTimeout(timer)
  }, [hasStarted, isInView])

  // Trigger text reveal after icon charging
  useEffect(() => {
    // For each icon, trigger text reveal after charging
    if (chargingStates.icon1) {
      setTimeout(() => setTextRevealStates((prev) => ({ ...prev, text1: true })), 300)
    }
    if (chargingStates.icon2) {
      setTimeout(() => setTextRevealStates((prev) => ({ ...prev, text2: true })), 300)
    }
    if (chargingStates.batteryCapacity) {
      setTimeout(() => setTextRevealStates((prev) => ({ ...prev, batteryCapacityText: true })), 300)
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
    <section
      ref={sectionRef}
      className="relative py-16 sm:py-20 md:py-24 bg-white min-h-[80vh]" // Increased min-height
      style={{
        contain: "paint",
        visibility: "visible", // Ensure visibility
        display: "block", // Ensure proper display
      }}
    >
      {/* Add a debug indicator to help troubleshoot visibility issues (can be removed in production) */}
      

      {/* Main container */}
      <div className="container relative mx-auto px-4 sm:px-6" ref={containerRef}>
        {/* Content layer */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-20"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-indigo-dye-600 mb-4 sm:mb-6 tracking-tight">
            Your Premium Solar Solution
          </h2>
          <p className="text-smoky-black/80 max-w-2xl mx-auto text-base sm:text-lg font-medium">
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
              src={"/solar.png?height=600&width=800" || "/placeholder.svg"}
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
              src={"/Batteries/3.jpeg?height=600&width=800" || "/placeholder.svg"}
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

        {/* Unified Card with Metrics and Circle */}
        <div className="mt-12 mb-16">
          <Card
            className="bg-white border border-indigo-dye/20 shadow-xl overflow-visible rounded-xl relative"
            ref={cardRef}
          >
            <CardContent className="p-1 xs:p-2 sm:p-4 md:p-6 lg:p-10 relative">
              {/* Render beams based on current progress and visibility */}
              {hasStarted && isInView && (
                <div className="absolute inset-0 overflow-visible" style={{ zIndex: 10 }}>
                  <AnimatedBeam
                    containerRef={cardRef}
                    fromRef={icon1Ref}
                    toRef={icon2Ref}
                    delay={0}
                    duration={1}
                    onProgress={(progress) => {
                      if (progress > 0.05 && !chargingStates.icon1) {
                        setChargingStates((prev) => ({ ...prev, icon1: true }))
                      }
                      if (progress > 0.8 && !chargingStates.icon2) {
                        setChargingStates((prev) => ({ ...prev, icon2: true }))
                      }
                    }}
                  />
                  <AnimatedBeam
                    containerRef={cardRef}
                    fromRef={icon2Ref}
                    toRef={batteryCapacityRef}
                    delay={1}
                    duration={1}
                    onProgress={(progress) => {
                      if (progress > 0.05 && !chargingStates.icon2) {
                        setChargingStates((prev) => ({ ...prev, icon2: true }))
                      }
                      if (progress > 0.8 && !chargingStates.batteryCapacity) {
                        setChargingStates((prev) => ({ ...prev, batteryCapacity: true }))
                      }
                    }}
                  />
                  <AnimatedBeam
                    containerRef={cardRef}
                    fromRef={batteryCapacityRef}
                    toRef={icon3Ref}
                    delay={2}
                    duration={1}
                    onProgress={(progress) => {
                      if (progress > 0.05 && !chargingStates.batteryCapacity) {
                        setChargingStates((prev) => ({ ...prev, batteryCapacity: true }))
                      }
                      if (progress > 0.8 && !chargingStates.icon3) {
                        setChargingStates((prev) => ({ ...prev, icon3: true }))
                      }
                    }}
                  />
                  <AnimatedBeam
                    containerRef={cardRef}
                    fromRef={icon3Ref}
                    toRef={icon4Ref}
                    delay={3}
                    duration={1}
                    onProgress={(progress) => {
                      if (progress > 0.05 && !chargingStates.icon3) {
                        setChargingStates((prev) => ({ ...prev, icon3: true }))
                      }
                      if (progress > 0.8 && !chargingStates.icon4) {
                        setChargingStates((prev) => ({ ...prev, icon4: true }))
                      }
                    }}
                  />
                  <AnimatedBeam
                    containerRef={cardRef}
                    fromRef={icon4Ref}
                    toRef={circleRef}
                    delay={4}
                    duration={1}
                    circleRef={circleRef}
                    onProgress={(progress) => {
                      if (progress > 0.05 && !chargingStates.icon4) {
                        setChargingStates((prev) => ({ ...prev, icon4: true }))
                      }
                      if (progress > 0.8 && !chargingStates.circle) {
                        setChargingStates((prev) => ({ ...prev, circle: true }))
                      }
                    }}
                  />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-6 lg:gap-10 place-items-center">
                {/* Main metrics grid */}
                <div className="col-span-1 md:col-span-2 w-full">
                  {/* Changed grid layout for mobile - now using 1 column for smallest screens */}
                  <div className="grid grid-cols-2 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-1 xs:gap-x-2 sm:gap-x-4 md:gap-x-6 lg:gap-x-10 gap-y-3 xs:gap-y-4 sm:gap-y-8 md:gap-y-10 w-full justify-items-center">
                    {/* System Size */}
                    <div className="flex flex-col items-center space-y-1 xs:space-y-2 sm:space-y-4 w-full max-w-[70px] xs:max-w-[90px] sm:max-w-[120px] md:max-w-[140px] lg:max-w-[160px]">
                      <motion.div
                        ref={icon1Ref}
                        id="icon1"
                        className="h-[50px] xs:h-[60px] sm:h-[80px] md:h-[100px] lg:h-[112px] w-full flex items-center justify-center"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{
                          opacity: isInView ? 1 : 0,
                          scale: isInView ? 1 : 0.8,
                        }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                      >
                        <PremiumIcon
                          className="w-10 xs:w-14 sm:w-18 md:w-24 lg:w-28 h-10 xs:h-14 sm:h-18 md:h-24 lg:h-28"
                          isCharging={chargingStates.icon1}
                          onChargingComplete={() => handleChargingComplete("icon1")}
                          delay={0.5}
                        >
                          <BarChart2 className="w-5 xs:w-7 sm:w-9 md:w-12 lg:w-14 h-5 xs:h-7 sm:h-9 md:h-12 lg:h-14 text-indigo-dye-600" />
                        </PremiumIcon>
                      </motion.div>
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
                          className="text-[9px] xs:text-[10px] sm:text-xs font-medium text-smoky-black/70 uppercase tracking-wider mb-0.5"
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
                          className="text-sm xs:text-base sm:text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-dye-600 to-indigo-dye-700"
                        >
                          {proposalData.solarPanelSize || "0"} kW
                        </motion.p>
                      </motion.div>
                    </div>

                    {/* Solar Panels */}
                    <div className="flex flex-col items-center space-y-1 xs:space-y-2 sm:space-y-4 w-full max-w-[70px] xs:max-w-[90px] sm:max-w-[120px] md:max-w-[140px] lg:max-w-[160px]">
                      <motion.div
                        ref={icon2Ref}
                        id="icon2"
                        className="h-[50px] xs:h-[60px] sm:h-[80px] md:h-[100px] lg:h-[112px] w-full flex items-center justify-center"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{
                          opacity: isInView ? 1 : 0,
                          scale: isInView ? 1 : 0.8,
                        }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                      >
                        <PremiumIcon
                          className="w-10 xs:w-14 sm:w-18 md:w-24 lg:w-28 h-10 xs:h-14 sm:h-18 md:h-24 lg:h-28"
                          isCharging={chargingStates.icon2}
                          onChargingComplete={() => handleChargingComplete("icon2")}
                          delay={1}
                        >
                          <Sun className="w-5 xs:w-7 sm:w-9 md:w-12 lg:w-14 h-5 xs:h-7 sm:h-9 md:h-12 lg:h-14 text-amber-500" />
                        </PremiumIcon>
                      </motion.div>
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
                          className="text-[9px] xs:text-[10px] sm:text-xs font-medium text-smoky-black/70 uppercase tracking-wider mb-0.5"
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
                          className="text-sm xs:text-base sm:text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-dye-600 to-indigo-dye-700"
                        >
                          {proposalData.numberOfSolarPanels || "0"}
                        </motion.p>
                      </motion.div>
                    </div>

                    {/* Battery Capacity - NEW */}
                    <div className="flex flex-col items-center space-y-1 xs:space-y-2 sm:space-y-4 w-full max-w-[70px] xs:max-w-[90px] sm:max-w-[120px] md:max-w-[140px] lg:max-w-[160px]">
                      <motion.div
                        ref={batteryCapacityRef}
                        id="batteryCapacity"
                        className="h-[50px] xs:h-[60px] sm:h-[80px] md:h-[100px] lg:h-[112px] w-full flex items-center justify-center"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{
                          opacity: isInView ? 1 : 0,
                          scale: isInView ? 1 : 0.8,
                        }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                      >
                        <PremiumIcon
                          className="w-10 xs:w-14 sm:w-18 md:w-24 lg:w-28 h-10 xs:h-14 sm:h-18 md:h-24 lg:h-28"
                          isCharging={chargingStates.batteryCapacity}
                          onChargingComplete={() => handleChargingComplete("batteryCapacity")}
                          delay={1.5}
                        >
                          <Battery className="w-5 xs:w-7 sm:w-9 md:w-12 lg:w-14 h-5 xs:h-7 sm:h-9 md:h-12 lg:h-14 text-green-600" />
                        </PremiumIcon>
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{
                          opacity: textRevealStates.batteryCapacityText ? 1 : 0,
                          y: textRevealStates.batteryCapacityText ? 0 : 10,
                          scale: chargingStates.batteryCapacity ? [1, 1.05, 1] : 1,
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
                          animate={{ opacity: textRevealStates.batteryCapacityText ? 1 : 0 }}
                          transition={{ duration: 0.5, delay: 0.1 }}
                          className="text-[9px] xs:text-[10px] sm:text-xs font-medium text-smoky-black/70 uppercase tracking-wider mb-0.5"
                        >
                          Battery Capacity
                        </motion.p>
                        <motion.p
                          initial={{ opacity: 0, y: 5 }}
                          animate={{
                            opacity: textRevealStates.batteryCapacityText ? 1 : 0,
                            y: textRevealStates.batteryCapacityText ? 0 : 5,
                          }}
                          transition={{ duration: 0.5, delay: 0.2 }}
                          className="text-sm xs:text-base sm:text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-dye-600 to-indigo-dye-700"
                        >
                          {proposalData.capacity || "13.5"} kWh
                        </motion.p>
                      </motion.div>
                    </div>

                    {/* Annual Consumption */}
                    <div className="flex flex-col items-center space-y-1 xs:space-y-2 sm:space-y-4 w-full max-w-[70px] xs:max-w-[90px] sm:max-w-[120px] md:max-w-[140px] lg:max-w-[160px]">
                      <motion.div
                        ref={icon3Ref}
                        id="icon3"
                        className="h-[50px] xs:h-[60px] sm:h-[80px] md:h-[100px] lg:h-[112px] w-full flex items-center justify-center"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{
                          opacity: isInView ? 1 : 0,
                          scale: isInView ? 1 : 0.8,
                        }}
                        transition={{ duration: 0.5, delay: 0.5 }}
                      >
                        <PremiumIcon
                          className="w-10 xs:w-14 sm:w-18 md:w-24 lg:w-28 h-10 xs:h-14 sm:h-18 md:h-24 lg:h-28"
                          isCharging={chargingStates.icon3}
                          onChargingComplete={() => handleChargingComplete("icon3")}
                          delay={2}
                        >
                          <Home className="w-5 xs:w-7 sm:w-9 md:w-12 lg:w-14 h-5 xs:h-7 sm:h-9 md:h-12 lg:h-14 text-indigo-dye-600" />
                        </PremiumIcon>
                      </motion.div>
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
                          className="text-[9px] xs:text-[10px] sm:text-xs font-medium text-smoky-black/70 uppercase tracking-wider mb-0.5"
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
                          className="text-sm xs:text-base sm:text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-dye-600 to-indigo-dye-700"
                        >
                          {proposalData.yearlyEnergyUsage || "0"} kWh
                        </motion.p>
                      </motion.div>
                    </div>

                    {/* Annual Production */}
                    <div className="flex flex-col items-center space-y-1 xs:space-y-2 sm:space-y-4 w-full max-w-[70px] xs:max-w-[90px] sm:max-w-[120px] md:max-w-[140px] lg:max-w-[160px]">
                      <motion.div
                        ref={icon4Ref}
                        id="icon4"
                        className="h-[50px] xs:h-[60px] sm:h-[80px] md:h-[100px] lg:h-[112px] w-full flex items-center justify-center"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{
                          opacity: isInView ? 1 : 0,
                          scale: isInView ? 1 : 0.8,
                        }}
                        transition={{ duration: 0.5, delay: 0.6 }}
                      >
                        <PremiumIcon
                          className="w-10 xs:w-14 sm:w-18 md:w-24 lg:w-28 h-10 xs:h-14 sm:h-18 md:h-24 lg:h-28"
                          isCharging={chargingStates.icon4}
                          onChargingComplete={() => handleChargingComplete("icon4")}
                          delay={2.5}
                        >
                          <Zap className="w-5 xs:w-7 sm:w-9 md:w-12 lg:w-14 h-5 xs:h-7 sm:h-9 md:h-12 lg:h-14 text-indigo-dye-600" />
                        </PremiumIcon>
                      </motion.div>
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
                          className="text-[9px] xs:text-[10px] sm:text-xs font-medium text-smoky-black/70 uppercase tracking-wider mb-0.5"
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
                          className="text-sm xs:text-base sm:text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-dye-600 to-indigo-dye-700"
                        >
                          {proposalData.yearlyEnergyProduced || "0"} kWh
                        </motion.p>
                      </motion.div>
                    </div>
                  </div>
                </div>

                {/* Circle Progress */}
                <div className="flex flex-col items-center justify-center mt-6 pt-[5px] md:mt-0">
                  <motion.div
                    ref={circleRef}
                    id="circle"
                    className="h-[100px] xs:h-[120px] sm:h-[150px] md:h-[180px] lg:h-[208px] flex items-center justify-center"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{
                      opacity: isInView ? 1 : 0,
                      scale: isInView ? 1 : 0.8,
                    }}
                    transition={{ duration: 0.5, delay: 0.7 }}
                  >
                    <CircularProgress
                      percentage={energyOffset}
                      isCharging={chargingStates.circle}
                      onChargingComplete={() => handleChargingComplete("circle")}
                    />
                  </motion.div>
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
                    className="mt-4 sm:mt-6 md:mt-8 text-center"
                  >
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: textRevealStates.circleText ? 1 : 0 }}
                      transition={{ duration: 0.5, delay: 0.1 }}
                      className="text-[9px] xs:text-[10px] sm:text-xs font-medium text-smoky-black/70 uppercase tracking-wider mb-0.5"
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
                      className="text-2xl sm:text-3xl font-bold"
                    >
                      <span className="text-indigo-dye-600">$</span>
                      <CountUp
                        value={lifetimeSavings}
                        isActive={textRevealStates.circleText}
                        duration={2}
                        className="font-bold text-indigo-dye-600"
                      />
                    </motion.p>
                  </motion.div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Technology section */}
        <motion.div className="mt-8 mb-8 relative isolate" ref={techSectionRef}>
          <Card className="bg-white border border-indigo-dye/20 shadow-xl overflow-hidden rounded-xl">
            <CardHeader className="bg-white border-b border-indigo-dye/10 py-3 xs:py-4 sm:py-6">
              <CardTitle className="text-xl xs:text-2xl font-bold text-center text-indigo-dye-600">
                Premium Solar Technology
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 xs:p-4 sm:pt-6 sm:px-6 sm:pb-6 md:pt-10 md:pb-8">
              <motion.p
                className="text-center mb-4 xs:mb-6 sm:mb-8 md:mb-10 text-smoky-black/80 max-w-3xl mx-auto text-sm xs:text-base sm:text-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: isTechSectionInView ? 1 : 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                Our premium solar panels utilize cutting-edge photovoltaic technology to maximize energy conversion
                efficiency. Engineered with premium materials, they deliver exceptional performance in all weather
                conditions.
              </motion.p>
              <div className="grid grid-cols-1 xs:grid-cols-3 gap-4 xs:gap-6 sm:gap-8 md:gap-10">
                <motion.div
                  className="flex flex-col items-center text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: techSectionVisible ? 1 : 0, y: techSectionVisible ? 0 : 20 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: techSectionVisible ? 1 : 0, scale: techSectionVisible ? 1 : 0.8 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                  >
                    <PremiumIcon className="w-12 xs:w-14 sm:w-16 md:w-20 lg:w-24 h-12 xs:h-14 sm:h-16 md:h-20 lg:h-24 mb-2 xs:mb-3 sm:mb-4 md:mb-5">
                      <BarChart2
                        className="w-6 xs:w-7 sm:w-8 md:w-10 lg:w-12 h-6 xs:h-7 sm:h-8 md:h-10 lg:h-12 text-indigo-dye-600"
                        strokeWidth={2}
                      />
                    </PremiumIcon>
                  </motion.div>
                  <p className="font-semibold text-smoky-black/80 text-sm xs:text-base sm:text-lg mb-0.5 xs:mb-1 sm:mb-2">
                    Elite Efficiency
                  </p>
                  <p className="text-base xs:text-lg sm:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-dye-600 to-indigo-dye-700">
                    20-22%
                  </p>
                  <p className="text-xs xs:text-sm text-smoky-black/70 mt-1 xs:mt-2">
                    Industry-leading conversion rate
                  </p>
                </motion.div>

                <motion.div
                  className="flex flex-col items-center text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: techSectionVisible ? 1 : 0, y: techSectionVisible ? 0 : 20 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: techSectionVisible ? 1 : 0, scale: techSectionVisible ? 1 : 0.8 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                  >
                    <PremiumIcon className="w-12 xs:w-14 sm:w-16 md:w-20 lg:w-24 h-12 xs:h-14 sm:h-16 md:h-20 lg:h-24 mb-2 xs:mb-3 sm:mb-4 md:mb-5">
                      <Thermometer
                        className="w-6 xs:w-7 sm:w-8 md:w-10 lg:w-12 h-6 xs:h-7 sm:h-8 md:h-10 lg:h-12 text-indigo-dye-600"
                        strokeWidth={2}
                      />
                    </PremiumIcon>
                  </motion.div>
                  <p className="font-semibold text-smoky-black/80 text-sm xs:text-base sm:text-lg mb-0.5 xs:mb-1 sm:mb-2">
                    Temperature Resilience
                  </p>
                  <p className="text-base xs:text-lg sm:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-dye-600 to-indigo-dye-700">
                    -0.35% / °C
                  </p>
                  <p className="text-xs xs:text-sm text-smoky-black/70 mt-1 xs:mt-2">Superior heat performance</p>
                </motion.div>

                <motion.div
                  className="flex flex-col items-center text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: techSectionVisible ? 1 : 0, y: techSectionVisible ? 0 : 20 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: techSectionVisible ? 1 : 0, scale: techSectionVisible ? 1 : 0.8 }}
                    transition={{ duration: 0.5, delay: 0.7 }}
                  >
                    <PremiumIcon className="w-12 xs:w-14 sm:w-16 md:w-20 lg:w-24 h-12 xs:h-14 sm:h-16 md:h-20 lg:h-24 mb-2 xs:mb-3 sm:mb-4 md:mb-5">
                      <Shield
                        className="w-6 xs:w-7 sm:w-8 md:w-10 lg:w-12 h-6 xs:h-7 sm:h-8 md:h-10 lg:h-12 text-indigo-dye-600"
                        strokeWidth={2}
                      />
                    </PremiumIcon>
                  </motion.div>
                  <p className="font-semibold text-smoky-black/80 text-sm xs:text-base sm:text-lg mb-0.5 xs:mb-1 sm:mb-2">
                    Premium Warranty
                  </p>
                  <p className="text-base xs:text-lg sm:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-dye-600 to-indigo-dye-700">
                    25 Years
                  </p>
                  <p className="text-xs xs:text-sm text-smoky-black/70 mt-1 xs:mt-2">
                    Comprehensive performance guarantee
                  </p>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  )
}

