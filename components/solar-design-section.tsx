"use client"
import { useCallback, useRef, useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart2, Thermometer, Shield, Sun, Battery, Zap, TrendingUp } from "lucide-react"
import { motion, useInView } from "framer-motion"
import { PremiumIcon } from "@/components/premium-icon"
import Image from "next/image"
import { AnimatedBeam } from "./ui/animated-beam"
import { SolarMetricsGrid } from "./solar-metrics-grid"

// Update the interface to use only snake_case properties
interface SolarDesignSectionProps {
  proposalData?: {
    number_of_solar_panels?: string
    yearly_energy_produced?: string
    yearly_energy_usage?: string
    energy_offset?: string
    solar_panel_size?: string
    lifetime_savings?: string
    solar_panel_design?: string
    battery_image?: string
    // Add storage section props in snake_case
    battery_name?: string
    inverter_name?: string
    capacity?: string
    output_kw?: string
    operating_mode?: string
    backup_allocation?: string
    essentials_days?: string
    appliances_days?: string
    whole_home_days?: string
  }
  enabledBatteryFields?: {
    batteryName: boolean
    inverterName: boolean
    capacity: boolean
    outputKW: boolean
    cost: boolean
    batteryImage: boolean
  }
}

export default function SolarDesignSection({
  proposalData = {
    number_of_solar_panels: "24",
    yearly_energy_produced: "12,500",
    yearly_energy_usage: "14,000",
    energy_offset: "150",
    solar_panel_size: "8.4",
    lifetime_savings: "42,000",
    solar_panel_design: "/placeholder.svg",
    battery_image: "/placeholder.svg",
    // Add storage section defaults with snake_case
    battery_name: "PowerWall 2",
    inverter_name: "Solar Edge",
    capacity: "13.5",
    output_kw: "5",
    operating_mode: "Self-Powered",
    backup_allocation: "100%",
    essentials_days: "5",
    appliances_days: "3",
    whole_home_days: "1.5",
  },
  enabledBatteryFields,
}: SolarDesignSectionProps) {
  // Safe area insets state
  const [safeAreaInsets, setSafeAreaInsets] = useState({
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  })

  // Add this state at the top with other state declarations
  const [isSmallDevice, setIsSmallDevice] = useState(false)
  const [isIOS, setIsIOS] = useState(false)

  // Get safe area insets
  useEffect(() => {
    // Check if running in a browser and if CSS environment variables are supported
    if (typeof window !== "undefined" && window.CSS && window.CSS.supports) {
      // Check if the browser supports env()
      if (window.CSS.supports("padding-top: env(safe-area-inset-top)")) {
        // Get computed style of document.documentElement
        const computedStyle = getComputedStyle(document.documentElement)

        // Try to get the safe area insets
        const top = Number.parseInt(computedStyle.getPropertyValue("--sat") || "0", 10)
        const right = Number.parseInt(computedStyle.getPropertyValue("--sar") || "0", 10)
        const bottom = Number.parseInt(computedStyle.getPropertyValue("--sab") || "0", 10)
        const left = Number.parseInt(computedStyle.getPropertyValue("--sal") || "0", 10)

        setSafeAreaInsets({ top, right, bottom, left })
      }
    }
  }, [])

  // Refs for the icons and container
  const icon1Ref = useRef<HTMLDivElement>(null)
  const icon2Ref = useRef<HTMLDivElement>(null)
  const batteryCapacityRef = useRef<HTMLDivElement>(null)
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
    batteryCapacity: false,
    icon3: false,
    icon4: false,
    circle: false,
  })

  // Text reveal states
  const [textRevealStates, setTextRevealStates] = useState({
    text1: false,
    text2: false,
    batteryCapacityText: false,
    text3: false,
    text4: false,
    circleText: false,
  })

  // Detect device type
  useEffect(() => {
    const checkDevice = () => {
      // Check if small device (iPhone or similar)
      setIsSmallDevice(window.innerWidth < 640)

      // Check if iOS device
      const userAgent = window.navigator.userAgent.toLowerCase()
      setIsIOS(/iphone|ipad|ipod|macintosh/.test(userAgent) && "ontouchend" in document)
    }

    checkDevice()
    window.addEventListener("resize", checkDevice)

    return () => window.removeEventListener("resize", checkDevice)
  }, [])

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
    // For small devices, reveal text immediately without animations
    if (isSmallDevice || isIOS) {
      setTextRevealStates({
        text1: true,
        text2: true,
        batteryCapacityText: true,
        text3: true,
        text4: true,
        circleText: true,
      })
      return
    }

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
  }, [chargingStates, isSmallDevice, isIOS])

  // Activate all icons immediately on small devices
  useEffect(() => {
    if (isSmallDevice || isIOS) {
      setChargingStates({
        icon1: true,
        icon2: true,
        batteryCapacity: true,
        icon3: true,
        icon4: true,
        circle: true,
      })
    }
  }, [isSmallDevice, isIOS, hasStarted])

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

  // Simplified image URL variables using only snake_case
  const solarPanelImageUrl =
    proposalData.solar_panel_design && proposalData.solar_panel_design !== "/placeholder.svg"
      ? proposalData.solar_panel_design
      : "/solar.png"

  const batteryImageUrl =
    enabledBatteryFields?.batteryImage && proposalData.battery_image && proposalData.battery_image !== "/placeholder.svg"
      ? proposalData.battery_image
      : "/Batteries/3.jpeg"

  return (
    <section
      ref={sectionRef}
      className="relative py-12 xs:py-14 sm:py-20 md:py-24  min-h-[80vh]"
      style={{
        contain: "paint",
        visibility: "visible",
        display: "block",
        paddingTop: `calc(12px + ${safeAreaInsets.top ? `${safeAreaInsets.top}px` : "env(safe-area-inset-top)"})`,
        paddingRight: safeAreaInsets.right ? `${safeAreaInsets.right}px` : "env(safe-area-inset-right)",
        paddingBottom: `calc(12px + ${safeAreaInsets.bottom ? `${safeAreaInsets.bottom}px` : "env(safe-area-inset-bottom)"})`,
        paddingLeft: safeAreaInsets.left ? `${safeAreaInsets.left}px` : "env(safe-area-inset-left)",
      }}
    >
      {/* Main container */}
      <div
        className={`container relative mx-auto ${isSmallDevice || isIOS ? "px-2 xs:px-3" : "px-3 xs:px-4"} sm:px-6`}
        ref={containerRef}
      >
        {/* Content layer */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-12 xs:mb-16 sm:mb-20"
        >
          <h2 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-bold text-primary mb-3 xs:mb-4 sm:mb-6 tracking-tight">
            Your Premium Solar Solution
          </h2>
          <p className="text-foreground/80 max-w-2xl mx-auto text-base sm:text-lg font-medium">
            Designed exclusively for your home's energy profile, our premium solar system delivers exceptional
            performance and maximum long-term value.
          </p>
        </motion.div>

        {/* Design Images Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.2 }}
          className={`grid ${enabledBatteryFields?.batteryImage ? "md:grid-cols-2" : "md:grid-cols-1"} gap-6 xs:gap-8 mb-12 xs:mb-16`}
        >
          {/* Solar Panel Design */}
          <div className={`relative aspect-[4/3] rounded-2xl overflow-hidden bg-gradient-to-br from-secondary/50 to-background shadow-xl border border-border ${!enabledBatteryFields?.batteryImage ? "w-full max-w-3xl mx-auto" : ""}`}>
            <Image
              src={solarPanelImageUrl}
              alt="Solar Panel Design"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 text-primary-foreground">
              <h3 className="text-lg font-semibold mb-1">Solar Panel Layout</h3>
              <p className="text-sm text-primary-foreground/90">Optimized placement for maximum sun exposure</p>
            </div>
          </div>

          {/* Battery Design - Only show if enabled */}
          {enabledBatteryFields?.batteryImage && (
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-gradient-to-br from-secondary/50 to-background shadow-xl border border-border">
              <Image
                src={batteryImageUrl}
                alt="Battery System"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 text-primary-foreground">
                <h3 className="text-lg font-semibold mb-1">Battery System</h3>
                <p className="text-sm text-primary-foreground/90">Energy storage for continuous power supply</p>
              </div>
            </div>
          )}
        </motion.div>

        {/* Unified Card with Metrics and Circle */}
        <div
          className={`mt-6 ${isSmallDevice || isIOS ? "xs:mt-8" : "xs:mt-10"} sm:mt-12 mb-8 ${isSmallDevice || isIOS ? "xs:mb-10" : "xs:mb-16"}`}
        >
          <Card className="pearlescent-card border-none m-0 pt-0 relative" ref={cardRef}>
            <CardContent className="relative pt-5">
              {/* Render beams based on current progress and visibility - ONLY on larger devices */}
              {hasStarted && isInView && !isSmallDevice && !isIOS && (
                <div className="absolute inset-0 overflow-visible" style={{ zIndex: 10 }}>
                  <AnimatedBeam
                    containerRef={cardRef}
                    fromRef={icon1Ref}
                    toRef={icon2Ref}
                    delay={0}
                    duration={1}
                    pathColor="hsl(var(--primary) / 0.7)"
                    glowColor="hsl(var(--primary) / 0.4)"
                    pathWidth={2}
                    glowWidth={10}
                    onProgress={(progress) => {
                      if (progress > 0.05 && !chargingStates.icon1) {
                        setChargingStates((prev) => ({ ...prev, icon1: true }))
                      }
                      if (progress > 0.8 && !chargingStates.icon2) {
                        setChargingStates((prev) => ({ ...prev, icon2: true }))
                      }
                    }}
                  />
                  {enabledBatteryFields?.capacity ? (
                    <>
                      <AnimatedBeam
                        containerRef={cardRef}
                        fromRef={icon2Ref}
                        toRef={batteryCapacityRef}
                        delay={1}
                        duration={1}
                        pathColor="hsl(var(--primary) / 0.7)"
                        glowColor="hsl(var(--primary) / 0.4)"
                        pathWidth={2}
                        glowWidth={10}
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
                        pathColor="hsl(var(--primary) / 0.7)"
                        glowColor="hsl(var(--primary) / 0.4)"
                        pathWidth={2}
                        glowWidth={10}
                        onProgress={(progress) => {
                          if (progress > 0.05 && !chargingStates.batteryCapacity) {
                            setChargingStates((prev) => ({ ...prev, batteryCapacity: true }))
                          }
                          if (progress > 0.8 && !chargingStates.icon3) {
                            setChargingStates((prev) => ({ ...prev, icon3: true }))
                          }
                        }}
                      />
                    </>
                  ) : (
                    <AnimatedBeam
                      containerRef={cardRef}
                      fromRef={icon2Ref}
                      toRef={icon3Ref}
                      delay={1}
                      duration={1}
                      pathColor="hsl(var(--primary) / 0.7)"
                      glowColor="hsl(var(--primary) / 0.4)"
                      pathWidth={2}
                      glowWidth={10}
                      onProgress={(progress) => {
                        if (progress > 0.05 && !chargingStates.icon2) {
                          setChargingStates((prev) => ({ ...prev, icon2: true }))
                        }
                        if (progress > 0.8 && !chargingStates.icon3) {
                          setChargingStates((prev) => ({ ...prev, icon3: true }))
                        }
                      }}
                    />
                  )}
                  <AnimatedBeam
                    containerRef={cardRef}
                    fromRef={icon3Ref}
                    toRef={icon4Ref}
                    delay={enabledBatteryFields?.capacity ? 3 : 2}
                    duration={1}
                    pathColor="hsl(var(--primary) / 0.7)"
                    glowColor="hsl(var(--primary) / 0.4)"
                    pathWidth={2}
                    glowWidth={10}
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
                    circleRef={circleRef}
                    delay={enabledBatteryFields?.capacity ? 4 : 3}
                    duration={1.5}
                    pattern="wave"
                    patternCount={2}
                    patternIntensity={0.03}
                    pathColor="hsl(var(--primary) / 0.7)"
                    glowColor="hsl(var(--primary) / 0.4)"
                    pathWidth={0}
                    glowWidth={0}
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

              {/* Use the extracted SolarMetricsGrid component */}
              <SolarMetricsGrid
                proposalData={proposalData}
                isInView={isInView}
                chargingStates={chargingStates}
                textRevealStates={textRevealStates}
                handleChargingComplete={handleChargingComplete}
                icon1Ref={icon1Ref}
                icon2Ref={icon2Ref}
                batteryCapacityRef={batteryCapacityRef}
                icon3Ref={icon3Ref}
                icon4Ref={icon4Ref}
                circleRef={circleRef}
                isSimplifiedView={isSmallDevice || isIOS}
                enabledBatteryFields={enabledBatteryFields}
              />
            </CardContent>
          </Card>
        </div>

        {/* Technology section */}
        <motion.div className="mt-6 xs:mt-8 mb-6 xs:mb-8 relative isolate" ref={techSectionRef}>
          <Card className="pearlescent-card border border-border shadow-xl overflow-hidden rounded-xl">
            <CardHeader className="border-b border-border py-3 xs:py-4 sm:py-6">
              <CardTitle className="text-xl xs:text-2xl font-bold text-center text-primary">
                Premium Solar Technology
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 xs:p-4 sm:pt-6 sm:px-6 sm:pb-6 md:pt-10 md:pb-8">
              <motion.p
                className="text-center mb-4 xs:mb-6 sm:mb-8 md:mb-10 text-foreground/80 max-w-3xl mx-auto text-sm xs:text-base sm:text-lg"
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
                        className={`${isSmallDevice || isIOS ? "w-6 xs:w-7 h-6 xs:h-7" : "w-8 xs:w-9 h-8 xs:h-9"} sm:w-9 md:w-12 lg:w-14 sm:h-9 md:h-12 lg:h-14 text-primary`}
                        strokeWidth={2}
                      />
                    </PremiumIcon>
                  </motion.div>
                  <p className="font-semibold text-foreground/80 text-sm xs:text-base sm:text-lg mb-0.5 xs:mb-1 sm:mb-2">
                    Elite Efficiency
                  </p>
                  <p className="text-base xs:text-lg sm:text-xl font-bold text-primary">
                    20-22%
                  </p>
                  <p className="text-xs xs:text-sm text-foreground/70 mt-1 xs:mt-2">
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
                        className={`${isSmallDevice || isIOS ? "w-6 xs:w-7 h-6 xs:h-7" : "w-8 xs:w-9 h-8 xs:h-9"} sm:w-9 md:w-12 lg:w-14 sm:h-9 md:h-12 lg:h-14 text-primary`}
                        strokeWidth={2}
                      />
                    </PremiumIcon>
                  </motion.div>
                  <p className="font-semibold text-foreground/80 text-sm xs:text-base sm:text-lg mb-0.5 xs:mb-1 sm:mb-2">
                    Temperature Resilience
                  </p>
                  <p className="text-base xs:text-lg sm:text-xl font-bold text-primary">
                    -0.35% / °C
                  </p>
                  <p className="text-xs xs:text-sm text-foreground/70 mt-1 xs:mt-2">Superior heat performance</p>
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
                        className={`${isSmallDevice || isIOS ? "w-6 xs:w-7 h-6 xs:h-7" : "w-8 xs:w-9 h-8 xs:h-9"} sm:w-9 md:w-12 lg:w-14 sm:h-9 md:h-12 lg:h-14 text-primary`}
                        strokeWidth={2}
                      />
                    </PremiumIcon>
                  </motion.div>
                  <p className="font-semibold text-foreground/80 text-sm xs:text-base sm:text-lg mb-0.5 xs:mb-1 sm:mb-2">
                    Premium Warranty
                  </p>
                  <p className="text-base xs:text-lg sm:text-xl font-bold text-primary">
                    25 Years
                  </p>
                  <p className="text-xs xs:text-sm text-foreground/70 mt-1 xs:mt-2">
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

