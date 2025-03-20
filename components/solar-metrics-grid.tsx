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
  handleChargingComplete: (iconKey: string) => void
  icon1Ref: React.RefObject<HTMLDivElement>
  icon2Ref: React.RefObject<HTMLDivElement>
  batteryCapacityRef: React.RefObject<HTMLDivElement>
  icon3Ref: React.RefObject<HTMLDivElement>
  icon4Ref: React.RefObject<HTMLDivElement>
  circleRef: React.RefObject<HTMLDivElement>
  metricsCardRef?: React.RefObject<HTMLDivElement>
  circleCardRef?: React.RefObject<HTMLDivElement>
  isSimplifiedView?: boolean
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
}: SolarMetricsGridProps) {
  const energyOffset = Number.parseInt(proposalData.energy_offset || "0", 10)
  const lifetimeSavings = Number.parseInt(proposalData.lifetime_savings?.replace(/,/g, "") || "0", 10)

  return (
    <div className={`${isSimplifiedView ? "space-y-6" : "space-y-8"}`}>
      {/* Main metrics grid in its own card */}
      <Card className="bg-white border border-indigo-dye/20 shadow-xl overflow-visible rounded-xl" ref={metricsCardRef}>
        <CardHeader
          className={`pb-0 ${isSimplifiedView ? "pt-3 px-3 xs:pt-4 xs:px-4" : "pt-4 px-4 xs:pt-5 xs:px-5"} sm:pt-6 sm:px-6`}
        >
          <CardTitle className="text-xl sm:text-2xl font-bold text-indigo-dye-600">System Specifications</CardTitle>
        </CardHeader>
        <CardContent className={`${isSimplifiedView ? "p-3 xs:p-4" : "p-4 xs:p-5"} sm:p-6`}>
          <div
            className={`${isSimplifiedView ? "grid grid-cols-2 gap-x-2 gap-y-4 xs:grid-cols-2 xs:gap-x-3 xs:gap-y-5" : "grid grid-cols-2 gap-x-3 gap-y-5 xs:grid-cols-2 xs:gap-x-4 xs:gap-y-6"} 
  md:grid-cols-3 lg:grid-cols-5 sm:gap-x-4 sm:gap-y-8 md:gap-x-6 md:gap-y-10 lg:gap-x-10
  w-full justify-items-center`}
          >
            {/* System Size */}
            <div
              className={`flex flex-col items-center space-y-1 xs:space-y-2 sm:space-y-4 w-full 
  ${isSimplifiedView ? "max-w-[85px] xs:max-w-[100px]" : "max-w-[70px] xs:max-w-[90px]"} 
  sm:max-w-[120px] md:max-w-[140px] lg:max-w-[160px]`}
            >
              <motion.div
                ref={icon1Ref}
                id="icon1"
                className={`${isSimplifiedView ? "h-[70px] xs:h-[80px]" : "h-[60px] xs:h-[70px]"} sm:h-[80px] md:h-[100px] lg:h-[112px] w-full flex items-center justify-center`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{
                  opacity: isInView ? 1 : 0,
                  scale: isInView ? 1 : 0.8,
                }}
                transition={{ duration: isSimplifiedView ? 0.3 : 0.5, delay: isSimplifiedView ? 0 : 0.2 }}
              >
                <PremiumIcon
                  className={`${isSimplifiedView ? "w-16 h-16 xs:w-18 xs:h-18" : "w-12 xs:w-14 h-12 xs:h-14"} sm:w-18 md:w-24 lg:w-28 sm:h-18 md:h-24 lg:h-28`}
                  isCharging={chargingStates.icon1}
                  onChargingComplete={() => handleChargingComplete("icon1")}
                  delay={isSimplifiedView ? 0 : 0.5}
                >
                  <BarChart2
                    className={`${isSimplifiedView ? "w-8 h-8 xs:w-9 xs:h-9" : "w-6 xs:w-7 h-6 xs:h-7"} sm:w-9 md:w-12 lg:w-14 sm:h-9 md:h-12 lg:h-14 text-indigo-dye-600`}
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
                  className={`${isSimplifiedView ? "text-[11px] xs:text-xs" : "text-[10px] xs:text-[11px]"} sm:text-xs font-medium text-smoky-black/70 uppercase tracking-wider mb-0.5`}
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
                  className={`${isSimplifiedView ? "text-lg xs:text-xl" : "text-base xs:text-lg"} sm:text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-dye-600 to-indigo-dye-700`}
                >
                  {proposalData.solar_panel_size || "0"} kW
                </motion.p>
              </motion.div>
            </div>

            {/* Solar Panels */}
            <div
              className={`flex flex-col items-center space-y-1 xs:space-y-2 sm:space-y-4 w-full 
  ${isSimplifiedView ? "max-w-[85px] xs:max-w-[100px]" : "max-w-[70px] xs:max-w-[90px]"} 
  sm:max-w-[120px] md:max-w-[140px] lg:max-w-[160px]`}
            >
              <motion.div
                ref={icon2Ref}
                id="icon2"
                className={`${isSimplifiedView ? "h-[70px] xs:h-[80px]" : "h-[60px] xs:h-[70px]"} sm:h-[80px] md:h-[100px] lg:h-[112px] w-full flex items-center justify-center`}
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
                  className={`${isSimplifiedView ? "text-[11px] xs:text-xs" : "text-[10px] xs:text-[11px]"} sm:text-xs font-medium text-smoky-black/70 uppercase tracking-wider mb-0.5`}
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
                  className={`${isSimplifiedView ? "text-lg xs:text-xl" : "text-base xs:text-lg"} sm:text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-dye-600 to-indigo-dye-700`}
                >
                  {proposalData.number_of_solar_panels || "0"}
                </motion.p>
              </motion.div>
            </div>

            {/* Battery Capacity */}
            <div
              className={`flex flex-col items-center space-y-1 xs:space-y-2 sm:space-y-4 w-full 
  ${isSimplifiedView ? "max-w-[85px] xs:max-w-[100px]" : "max-w-[70px] xs:max-w-[90px]"} 
  sm:max-w-[120px] md:max-w-[140px] lg:max-w-[160px]`}
            >
              <motion.div
                ref={batteryCapacityRef}
                id="batteryCapacity"
                className={`${isSimplifiedView ? "h-[70px] xs:h-[80px]" : "h-[60px] xs:h-[70px]"} sm:h-[80px] md:h-[100px] lg:h-[112px] w-full flex items-center justify-center`}
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
                  className={`${isSimplifiedView ? "text-[11px] xs:text-xs" : "text-[10px] xs:text-[11px]"} sm:text-xs font-medium text-smoky-black/70 uppercase tracking-wider mb-0.5`}
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
                  className={`${isSimplifiedView ? "text-lg xs:text-xl" : "text-base xs:text-lg"} sm:text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-dye-600 to-indigo-dye-700`}
                >
                  {proposalData.capacity || "13.5"} kWh
                </motion.p>
              </motion.div>
            </div>

            {/* Annual Consumption */}
            <div
              className={`flex flex-col items-center space-y-1 xs:space-y-2 sm:space-y-4 w-full 
  ${isSimplifiedView ? "max-w-[85px] xs:max-w-[100px]" : "max-w-[70px] xs:max-w-[90px]"} 
  sm:max-w-[120px] md:max-w-[140px] lg:max-w-[160px]`}
            >
              <motion.div
                ref={icon3Ref}
                id="icon3"
                className={`${isSimplifiedView ? "h-[70px] xs:h-[80px]" : "h-[60px] xs:h-[70px]"} sm:h-[80px] md:h-[100px] lg:h-[112px] w-full flex items-center justify-center`}
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
                    className={`${isSimplifiedView ? "w-8 h-8 xs:w-9 xs:h-9" : "w-6 xs:w-7 h-6 xs:h-7"} sm:w-9 md:w-12 lg:w-14 sm:h-9 md:h-12 lg:h-14 text-indigo-dye-600`}
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
                  className={`${isSimplifiedView ? "text-[11px] xs:text-xs" : "text-[10px] xs:text-[11px]"} sm:text-xs font-medium text-smoky-black/70 uppercase tracking-wider mb-0.5`}
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
                  className={`${isSimplifiedView ? "text-lg xs:text-xl" : "text-base xs:text-lg"} sm:text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-dye-600 to-indigo-dye-700`}
                >
                  {proposalData.yearly_energy_usage || "0"} kWh
                </motion.p>
              </motion.div>
            </div>

            {/* Annual Production */}
            <div
              className={`flex flex-col items-center space-y-1 xs:space-y-2 sm:space-y-4 w-full 
${isSimplifiedView ? "max-w-[85px] xs:max-w-[100px] col-span-2 mx-auto" : "max-w-[70px] xs:max-w-[90px]"} 
sm:max-w-[120px] md:max-w-[140px] lg:max-w-[160px]`}
            >
              <motion.div
                ref={icon4Ref}
                id="icon4"
                className={`${isSimplifiedView ? "h-[70px] xs:h-[80px]" : "h-[60px] xs:h-[70px]"} sm:h-[80px] md:h-[100px] lg:h-[112px] w-full flex items-center justify-center`}
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
                    className={`${isSimplifiedView ? "w-8 h-8 xs:w-9 xs:h-9" : "w-6 xs:w-7 h-6 xs:h-7"} sm:w-9 md:w-12 lg:w-14 sm:h-9 md:h-12 lg:h-14 text-indigo-dye-600`}
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
                  className={`${isSimplifiedView ? "text-[11px] xs:text-xs" : "text-[10px] xs:text-[11px]"} sm:text-xs font-medium text-smoky-black/70 uppercase tracking-wider mb-0.5`}
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
                  className={`${isSimplifiedView ? "text-lg xs:text-xl" : "text-base xs:text-lg"} sm:text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-dye-600 to-indigo-dye-700`}
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
        className="bg-white border border-indigo-dye/20 shadow-xl overflow-visible rounded-xl mx-auto"
        ref={circleCardRef}
        style={{ maxWidth: "800px" }} // Increased max width for the card
      >
        <CardHeader className={`pb-0 ${isSimplifiedView ? "pt-4 px-4" : "pt-5 px-5"} sm:pt-6 sm:px-6`}>
          <CardTitle className="text-xl sm:text-2xl md:text-3xl font-bold text-indigo-dye-600 flex items-center justify-center gap-2">
            <TrendingUp className="h-6 w-6 sm:h-7 sm:w-7 text-green-600" />
            <span>Financial Impact</span>
          </CardTitle>
        </CardHeader>
        <CardContent
          className={`${isSimplifiedView ? "p-4 xs:p-5" : "p-5 xs:p-6"} sm:p-8 flex-grow flex flex-col justify-center`}
        >
          <div className="flex flex-col items-center justify-center h-full py-2 sm:py-4">
            <motion.div
              ref={circleRef}
              id="circle"
              className="h-[200px] xs:h-[240px] sm:h-[280px] md:h-[320px] lg:h-[280px] flex items-center justify-center"
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
                className="text-xs sm:text-sm md:text-base font-medium text-smoky-black/70 uppercase tracking-wider mb-1 sm:mb-2"
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
        </CardContent>
      </Card>
    </div>
  )
}

