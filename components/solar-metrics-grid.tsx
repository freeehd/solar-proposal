"use client"
import type React from "react"

import { motion } from "framer-motion"
import { BarChart2, Sun, Battery, Home, Zap, TrendingUp } from "lucide-react"
import { PremiumIcon } from "@/components/premium-icon"
import { CircularProgress } from "@/components/ui/circular-progress"
import { CountUp } from "@/components/count-up"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface SolarMetricsGridProps {
  proposalData: {
    solar_panel_size?: string
    number_of_solar_panels?: string
    capacity?: string
    yearly_energy_usage?: string
    yearly_energy_produced?: string
    energy_offset?: string
    lifetime_savings?: string
  }
  isInView: boolean
  chargingStates: {
    icon1: boolean
    icon2: boolean
    batteryCapacity: boolean
    icon3: boolean
    icon4: boolean
    circle: boolean
  }
  textRevealStates: {
    text1: boolean
    text2: boolean
    batteryCapacityText: boolean
    text3: boolean
    text4: boolean
    circleText: boolean
  }
  handleChargingComplete: (iconKey: "circle" | "icon1" | "icon2" | "batteryCapacity" | "icon3" | "icon4") => void
  icon1Ref: React.RefObject<HTMLDivElement>
  icon2Ref: React.RefObject<HTMLDivElement>
  batteryCapacityRef: React.RefObject<HTMLDivElement>
  icon3Ref: React.RefObject<HTMLDivElement>
  icon4Ref: React.RefObject<HTMLDivElement>
  circleRef: React.RefObject<HTMLDivElement>
  metricsCardRef?: React.RefObject<HTMLDivElement>
  circleCardRef?: React.RefObject<HTMLDivElement>
  isSimplifiedView?: boolean
  enabledBatteryFields?: {
    batteryName: boolean
    inverterName: boolean
    capacity: boolean
    outputKW: boolean
    cost: boolean
    batteryImage: boolean
  }
}

export function SolarMetricsGrid({
  proposalData,
  isInView,
  chargingStates,
  textRevealStates,
  handleChargingComplete,
  icon1Ref,
  icon2Ref,
  batteryCapacityRef,
  icon3Ref,
  icon4Ref,
  circleRef,
  metricsCardRef,
  circleCardRef,
  isSimplifiedView,
  enabledBatteryFields,
}: SolarMetricsGridProps) {
  const energyOffset = Number.parseInt(proposalData.energy_offset || "0", 10)
  const lifetimeSavings = Number.parseInt(proposalData.lifetime_savings?.replace(/,/g, "") || "0", 10)

  return (
    <div className={`${isSimplifiedView ? "space-y-6" : "space-y-8"}`}>
      {/* Main metrics grid in its own card */}
      <Card className="bg-gradient-to-r from-teal-50 to-blue-100 border-none  shadow-xl overflow-visible rounded-xl" ref={metricsCardRef}>
        <CardHeader
          className={`pb-0 ${isSimplifiedView ? "pt-3 px-3 xs:pt-4 xs:px-4" : "pt-4 px-4 xs:pt-5 xs:px-5"} sm:pt-6 sm:px-6`}
        >
          <CardTitle className="text-xl sm:text-2xl font-bold text-primary">System Specifications</CardTitle>
        </CardHeader>
        <CardContent className={`${isSimplifiedView ? "p-3 xs:p-4" : "p-4 xs:p-5"} sm:p-6`}>
          <div className={`grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 ${enabledBatteryFields?.capacity ? 'lg:grid-cols-5' : 'lg:grid-cols-4'} gap-4 xs:gap-6 sm:gap-8 md:gap-10 pb-5 justify-items-center ${!enabledBatteryFields?.capacity ? 'lg:justify-center' : ''}`}>
            {/* System Size */}
            <div
              ref={icon1Ref}
              className="relative flex flex-col items-center text-center w-full max-w-[160px] xs:col-span-1 "
            >
              <motion.div
                className={`${isSimplifiedView ? "h-[70px] xs:h-[80px]" : "h-[60px] xs:h-[70px]"} sm:h-[80px] md:h-[100px] lg:h-[112px] w-full flex items-center justify-center mb-2 xs:mb-3 sm:mb-4 md:mb-5`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{
                  opacity: isInView ? 1 : 0,
                  scale: isInView ? 1 : 0.8,
                }}
                transition={{ duration: isSimplifiedView ? 0.3 : 0.5, delay: isSimplifiedView ? 0 : 0.2 }}
              >
                <PremiumIcon
                  className={`${isSimplifiedView ? "w-16 h-16 xs:w-18 xs:h-18" : "w-12 xs:w-14 h-12 xs:h-14"} sm:w-18 md:w-24 lg:w-28 sm:h-18 md:h-24 lg:h-28 `}
                  isCharging={chargingStates.icon1}
                  onChargingComplete={() => handleChargingComplete("icon1")}
                  delay={isSimplifiedView ? 0 : 0.5}
                >
                  <BarChart2
                    className={`${isSimplifiedView ? "w-8 h-8 xs:w-9 xs:h-9" : "w-6 xs:w-7 h-6 xs:h-7"} sm:w-9 md:w-12 lg:w-14 sm:h-9 md:h-12 lg:h-14 text-primary`}
                  />
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
                  opacity: { duration: isSimplifiedView ? 0.3 : 0.8, ease: "easeOut" },
                  y: { duration: isSimplifiedView ? 0.3 : 0.8, ease: "easeOut" },
                  scale: { duration: 0.3 },
                }}
                className="text-center w-full"
              >
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: textRevealStates.text1 ? 1 : 0 }}
                  transition={{ duration: isSimplifiedView ? 0.2 : 0.5, delay: isSimplifiedView ? 0 : 0.1 }}
                  className={`${isSimplifiedView ? "text-[11px] xs:text-xs" : "text-[10px] xs:text-[11px]"} sm:text-xs font-medium text-primary uppercase tracking-wider mb-0.5`}
                >
                  System Size
                </motion.p>
                <motion.p
                  initial={{ opacity: 0, y: 5 }}
                  animate={{
                    opacity: textRevealStates.text1 ? 1 : 0,
                    y: textRevealStates.text1 ? 0 : 5,
                  }}
                  transition={{ duration: isSimplifiedView ? 0.2 : 0.5, delay: isSimplifiedView ? 0 : 0.2 }}
                  className={`${isSimplifiedView ? "text-lg xs:text-xl" : "text-base xs:text-lg"} sm:text-xl md:text-2xl font-bold text-primary`}
                >
                  {proposalData.solar_panel_size || "0"} kW
                </motion.p>
              </motion.div>
            </div>

            {/* Solar Panels */}
            <div
              ref={icon2Ref}
              className="relative flex flex-col items-center text-center w-full max-w-[160px] xs:col-span-1"
            >
              <motion.div
                className={`${isSimplifiedView ? "h-[70px] xs:h-[80px]" : "h-[60px] xs:h-[70px]"} sm:h-[80px] md:h-[100px] lg:h-[112px] w-full flex items-center justify-center mb-2 xs:mb-3 sm:mb-4 md:mb-5`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{
                  opacity: isInView ? 1 : 0,
                  scale: isInView ? 1 : 0.8,
                }}
                transition={{ duration: isSimplifiedView ? 0.3 : 0.5, delay: isSimplifiedView ? 0.1 : 0.3 }}
              >
                <PremiumIcon
                  className={`${isSimplifiedView ? "w-16 h-16 xs:w-18 xs:h-18" : "w-12 xs:w-14 h-12 xs:h-14"} sm:w-18 md:w-24 lg:w-28 sm:h-18 md:h-24 lg:h-28`}
                  isCharging={chargingStates.icon2}
                  onChargingComplete={() => handleChargingComplete("icon2")}
                  delay={isSimplifiedView ? 0 : 1}
                >
                  <Sun
                    className={`${isSimplifiedView ? "w-8 h-8 xs:w-9 xs:h-9" : "w-6 xs:w-7 h-6 xs:h-7"} sm:w-9 md:w-12 lg:w-14 sm:h-9 md:h-12 lg:h-14 text-amber-500`}
                  />
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
                  opacity: { duration: isSimplifiedView ? 0.3 : 0.8, ease: "easeOut" },
                  y: { duration: isSimplifiedView ? 0.3 : 0.8, ease: "easeOut" },
                  scale: { duration: 0.3 },
                }}
                className="text-center w-full"
              >
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: textRevealStates.text2 ? 1 : 0 }}
                  transition={{ duration: isSimplifiedView ? 0.2 : 0.5, delay: isSimplifiedView ? 0 : 0.1 }}
                  className={`${isSimplifiedView ? "text-[11px] xs:text-xs" : "text-[10px] xs:text-[11px]"} sm:text-xs font-medium text-primary uppercase tracking-wider mb-0.5`}
                >
                  Solar Panels
                </motion.p>
                <motion.p
                  initial={{ opacity: 0, y: 5 }}
                  animate={{
                    opacity: textRevealStates.text2 ? 1 : 0,
                    y: textRevealStates.text2 ? 0 : 5,
                  }}
                  transition={{ duration: isSimplifiedView ? 0.2 : 0.5, delay: isSimplifiedView ? 0 : 0.2 }}
                  className={`${isSimplifiedView ? "text-lg xs:text-xl" : "text-base xs:text-lg"} sm:text-xl md:text-2xl font-bold text-primary`}
                >
                  {proposalData.number_of_solar_panels || "0"}
                </motion.p>
              </motion.div>
            </div>

            {/* Battery Capacity - Only show if enabled */}
            {enabledBatteryFields?.capacity && (
              <div
                ref={batteryCapacityRef}
                className="relative flex flex-col items-center text-center w-full max-w-[160px] xs:col-span-1"
              >
                <motion.div
                  className={`${isSimplifiedView ? "h-[70px] xs:h-[80px]" : "h-[60px] xs:h-[70px]"} sm:h-[80px] md:h-[100px] lg:h-[112px] w-full flex items-center justify-center mb-2 xs:mb-3 sm:mb-4 md:mb-5`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{
                    opacity: isInView ? 1 : 0,
                    scale: isInView ? 1 : 0.8,
                  }}
                  transition={{ duration: isSimplifiedView ? 0.3 : 0.5, delay: isSimplifiedView ? 0.2 : 0.4 }}
                >
                  <PremiumIcon
                    className={`${isSimplifiedView ? "w-16 h-16 xs:w-18 xs:h-18" : "w-12 xs:w-14 h-12 xs:h-14"} sm:w-18 md:w-24 lg:w-28 sm:h-18 md:h-24 lg:h-28`}
                    isCharging={chargingStates.batteryCapacity}
                    onChargingComplete={() => handleChargingComplete("batteryCapacity")}
                    delay={isSimplifiedView ? 0 : 1.5}
                  >
                    <Battery
                      className={`${isSimplifiedView ? "w-8 h-8 xs:w-9 xs:h-9" : "w-6 xs:w-7 h-6 xs:h-7"} sm:w-9 md:w-12 lg:w-14 sm:h-9 md:h-12 lg:h-14 text-green-600`}
                    />
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
                    opacity: { duration: isSimplifiedView ? 0.3 : 0.8, ease: "easeOut" },
                    y: { duration: isSimplifiedView ? 0.3 : 0.8, ease: "easeOut" },
                    scale: { duration: 0.3 },
                  }}
                  className="text-center w-full"
                >
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: textRevealStates.batteryCapacityText ? 1 : 0 }}
                    transition={{ duration: isSimplifiedView ? 0.2 : 0.5, delay: isSimplifiedView ? 0 : 0.1 }}
                    className={`${isSimplifiedView ? "text-[11px] xs:text-xs" : "text-[10px] xs:text-[11px]"} sm:text-xs font-medium text-primary uppercase tracking-wider mb-0.5`}
                  >
                    Battery Capacity
                  </motion.p>
                  <motion.p
                    initial={{ opacity: 0, y: 5 }}
                    animate={{
                      opacity: textRevealStates.batteryCapacityText ? 1 : 0,
                      y: textRevealStates.batteryCapacityText ? 0 : 5,
                    }}
                    transition={{ duration: isSimplifiedView ? 0.2 : 0.5, delay: isSimplifiedView ? 0 : 0.2 }}
                    className={`${isSimplifiedView ? "text-lg xs:text-xl" : "text-base xs:text-lg"} sm:text-xl md:text-2xl font-bold text-primary`}
                  >
                    {proposalData.capacity || "13.5"} kWh
                  </motion.p>
                </motion.div>
              </div>
            )}

            {/* Annual Consumption */}
            <div
              ref={icon3Ref}
              className="relative flex flex-col items-center text-center w-full max-w-[160px] xs:col-span-1"
            >
              <motion.div
                className={`${isSimplifiedView ? "h-[70px] xs:h-[80px]" : "h-[60px] xs:h-[70px]"} sm:h-[80px] md:h-[100px] lg:h-[112px] w-full flex items-center justify-center mb-2 xs:mb-3 sm:mb-4 md:mb-5`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{
                  opacity: isInView ? 1 : 0,
                  scale: isInView ? 1 : 0.8,
                }}
                transition={{ duration: isSimplifiedView ? 0.3 : 0.5, delay: isSimplifiedView ? 0.3 : 0.5 }}
              >
                <PremiumIcon
                  className={`${isSimplifiedView ? "w-16 h-16 xs:w-18 xs:h-18" : "w-12 xs:w-14 h-12 xs:h-14"} sm:w-18 md:w-24 lg:w-28 sm:h-18 md:h-24 lg:h-28`}
                  isCharging={chargingStates.icon3}
                  onChargingComplete={() => handleChargingComplete("icon3")}
                  delay={isSimplifiedView ? 0 : 2}
                >
                  <Home
                    className={`${isSimplifiedView ? "w-8 h-8 xs:w-9 xs:h-9" : "w-6 xs:w-7 h-6 xs:h-7"} sm:w-9 md:w-12 lg:w-14 sm:h-9 md:h-12 lg:h-14 text-primary`}
                  />
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
                  opacity: { duration: isSimplifiedView ? 0.3 : 0.8, ease: "easeOut" },
                  y: { duration: isSimplifiedView ? 0.3 : 0.8, ease: "easeOut" },
                  scale: { duration: 0.3 },
                }}
                className="text-center w-full"
              >
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: textRevealStates.text3 ? 1 : 0 }}
                  transition={{ duration: isSimplifiedView ? 0.2 : 0.5, delay: isSimplifiedView ? 0 : 0.1 }}
                  className={`${isSimplifiedView ? "text-[11px] xs:text-xs" : "text-[10px] xs:text-[11px]"} sm:text-xs font-medium text-primary uppercase tracking-wider mb-0.5`}
                >
                  Annual Consumption
                </motion.p>
                <motion.p
                  initial={{ opacity: 0, y: 5 }}
                  animate={{
                    opacity: textRevealStates.text3 ? 1 : 0,
                    y: textRevealStates.text3 ? 0 : 5,
                  }}
                  transition={{ duration: isSimplifiedView ? 0.2 : 0.5, delay: isSimplifiedView ? 0 : 0.2 }}
                  className={`${isSimplifiedView ? "text-lg xs:text-xl" : "text-base xs:text-lg"} sm:text-xl md:text-2xl font-bold text-primary`}
                >
                  {proposalData.yearly_energy_usage || "0"} kWh
                </motion.p>
              </motion.div>
            </div>

            {/* Annual Production */}
            <div
              ref={icon4Ref}
              className="relative flex flex-col items-center text-center w-full max-w-[160px] xs:col-span-1"
            >
              <motion.div
                className={`${isSimplifiedView ? "h-[70px] xs:h-[80px]" : "h-[60px] xs:h-[70px]"} sm:h-[80px] md:h-[100px] lg:h-[112px] w-full flex items-center justify-center mb-2 xs:mb-3 sm:mb-4 md:mb-5`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{
                  opacity: isInView ? 1 : 0,
                  scale: isInView ? 1 : 0.8,
                }}
                transition={{ duration: isSimplifiedView ? 0.3 : 0.5, delay: isSimplifiedView ? 0.4 : 0.6 }}
              >
                <PremiumIcon
                  className={`${isSimplifiedView ? "w-16 h-16 xs:w-18 xs:h-18" : "w-12 xs:w-14 h-12 xs:h-14"} sm:w-18 md:w-24 lg:w-28 sm:h-18 md:h-24 lg:h-28`}
                  isCharging={chargingStates.icon4}
                  onChargingComplete={() => handleChargingComplete("icon4")}
                  delay={isSimplifiedView ? 0 : 2.5}
                >
                  <Zap
                    className={`${isSimplifiedView ? "w-8 h-8 xs:w-9 xs:h-9" : "w-6 xs:w-7 h-6 xs:h-7"} sm:w-9 md:w-12 lg:w-14 sm:h-9 md:h-12 lg:h-14 text-primary`}
                  />
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
                  opacity: { duration: isSimplifiedView ? 0.3 : 0.8, ease: "easeOut" },
                  y: { duration: isSimplifiedView ? 0.3 : 0.8, ease: "easeOut" },
                  scale: { duration: 0.3 },
                }}
                className="text-center w-full"
              >
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: textRevealStates.text4 ? 1 : 0 }}
                  transition={{ duration: isSimplifiedView ? 0.2 : 0.5, delay: isSimplifiedView ? 0 : 0.1 }}
                  className={`${isSimplifiedView ? "text-[11px] xs:text-xs" : "text-[10px] xs:text-[11px]"} sm:text-xs font-medium text-primary uppercase tracking-wider mb-0.5`}
                >
                  Annual Production
                </motion.p>
                <motion.p
                  initial={{ opacity: 0, y: 5 }}
                  animate={{
                    opacity: textRevealStates.text4 ? 1 : 0,
                    y: textRevealStates.text4 ? 0 : 5,
                  }}
                  transition={{ duration: isSimplifiedView ? 0.2 : 0.5, delay: isSimplifiedView ? 0 : 0.2 }}
                  className={`${isSimplifiedView ? "text-lg xs:text-xl" : "text-base xs:text-lg"} sm:text-xl md:text-2xl font-bold text-primary`}
                >
                  {proposalData.yearly_energy_produced || "0"} kWh
                </motion.p>
              </motion.div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Circle Progress in its own card - ENLARGED */}
      <Card
        className="bg-gradient-to-r from-teal-50 to-blue-100 border-none  border-blue/20 shadow-xl overflow-visible rounded-xl mx-auto"
        ref={circleCardRef}
        style={{ maxWidth: "800px" }} // Increased max width for the card
      >
        <CardHeader className={`pb-0 ${isSimplifiedView ? "pt-4 px-4" : "pt-5 px-5"} sm:pt-6 sm:px-6`}>
          <CardTitle className="text-xl sm:text-2xl md:text-3xl font-bold text-primary flex items-center justify-center gap-2">
           
          </CardTitle>
        </CardHeader>
        <CardContent
          className={`${isSimplifiedView ? "p-4 xs:p-5" : "p-5 xs:p-6"} sm:p-8 flex-grow flex flex-col justify-center`}
        >
          <div className="flex flex-col items-center justify-center h-full py-2 sm:py-4">
            <motion.div
              ref={circleRef}
              id="circle"
              className="h-[200px] xs:h-[240px] sm:h-[280px] md:h-[320px] lg:h-[280px] flex items-center justify-center mb-2 xs:mb-3 sm:mb-4 md:mb-5"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{
                opacity: isInView ? 1 : 0,
                scale: isInView ? 1 : 0.8,
              }}
              transition={{ duration: isSimplifiedView ? 0.3 : 0.5, delay: isSimplifiedView ? 0.5 : 0.7 }}
            >
              <CircularProgress
                percentage={energyOffset}
                isCharging={chargingStates.circle}
                onChargingComplete={() => handleChargingComplete("circle")}
                size={isSimplifiedView ? 240 : 320} // Increased size for the circular progress
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{
                opacity: textRevealStates.circleText ? 1 : 0,
                y: textRevealStates.circleText ? 0 : 20,
              }}
              transition={{
                opacity: { duration: isSimplifiedView ? 0.3 : 0.8, ease: "easeOut" },
                y: { duration: isSimplifiedView ? 0.3 : 0.8, ease: "easeOut" },
              }}
              className="mt-4 sm:mt-6 md:mt-8 text-center"
            >
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: textRevealStates.circleText ? 1 : 0 }}
                transition={{ duration: isSimplifiedView ? 0.2 : 0.5, delay: isSimplifiedView ? 0 : 0.1 }}
                className="text-xs sm:text-sm md:text-base font-medium text-primary uppercase tracking-wider mb-1 sm:mb-2"
              >
                Lifetime Savings
              </motion.p>
              <motion.p
                initial={{ opacity: 0, y: 5 }}
                animate={{
                  opacity: textRevealStates.circleText ? 1 : 0,
                  y: textRevealStates.circleText ? 0 : 5,
                }}
                transition={{ duration: isSimplifiedView ? 0.2 : 0.5, delay: isSimplifiedView ? 0 : 0.2 }}
                className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold"
              >
                <span className="text-primary">$</span>
                <CountUp
                  value={lifetimeSavings}
                  isActive={textRevealStates.circleText}
                  duration={2}
                  className="font-bold text-primary"
                />
              </motion.p>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

