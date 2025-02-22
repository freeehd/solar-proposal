"use client"

import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sun, Zap, BarChart2, Thermometer, Shield } from "lucide-react"
import { motion } from "framer-motion"

interface SolarDesignSectionProps {
  proposalData: {
    numberOfSolarPanels?: string
    yearlyEnergyProduced?: string
    yearlyEnergyUsage?: string
    energyOffset?: string
    solarPanelDesign?: string
    solarPanelSize?: string
  }
}

const CircularProgress = ({ percentage }: { percentage: number }) => {
  const circumference = 2 * Math.PI * 40
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  return (
      <div className="relative w-44 h-44">
        <svg className="w-full h-full" viewBox="0 0 100 100">
          <circle className="text-gray-300 stroke-current" strokeWidth="10" cx="50" cy="50" r="40" fill="transparent" />
          <circle
              className="text-primary stroke-current"
              strokeWidth="10"
              strokeLinecap="round"
              cx="50"
              cy="50"
              r="40"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              transform="rotate(-90 50 50)"
          />
          <text
              x="50"
              y="50"
              fontFamily="Verdana"
              fontSize="18"
              textAnchor="middle"
              alignmentBaseline="central"
              fill="currentColor"
          >
            {percentage}%
          </text>
        </svg>
      </div>
  )
}

export default function SolarDesignSection({ proposalData }: SolarDesignSectionProps) {
  const energyOffset = Number.parseInt(proposalData.energyOffset || "0", 10)

  return (
      <section className="relative z-10 py-20 sky-gradient">
        <div className="container mx-auto px-4 relative sky-gradient">
          <motion.h2
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-4xl font-bold mb-12 text-center accent-text"
          >
            Your Solar Design Breakdown
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="relative w-full aspect-[16/9] rounded-lg overflow-hidden shadow-lg"
            >
              <Image
                  src={proposalData.solarPanelDesign || "/placeholder.svg"}
                  alt="Solar panel layout"
                  fill
                  className="object-cover"
                  priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute bottom-4 left-4 text-white">
                <p className="text-sm font-semibold">Roof Layout Design</p>
                <p className="text-xs opacity-75">Optimized panel placement for maximum efficiency</p>
              </div>
            </motion.div>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="bg-card/50 backdrop-blur border-primary/10">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-center">Solar System Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative min-h-[400px]">
                    {/* Top Row */}
                    <div className="absolute top-0 w-full flex justify-between">
                      {/* Top Left - Solar Panels */}
                      <div className="text-center">
                        <div className="flex flex-col items-center">
                          <Sun className="w-12 h-12 mb-2 text-primary" />
                          <p className="text-sm text-muted-foreground">Solar Panels</p>
                          <p className="text-2xl font-bold text-primary">{proposalData.numberOfSolarPanels || "0"}</p>
                        </div>
                      </div>

                      {/* Top Right - Year 1 Usage */}
                      <div className="text-center">
                        <div className="flex flex-col items-center">
                          <Zap className="w-12 h-12 mb-2 text-primary" />
                          <p className="text-sm text-muted-foreground">Year 1 Usage</p>
                          <p className="text-2xl font-bold text-primary">{proposalData.yearlyEnergyUsage || "0"}</p>
                          <p className="text-sm text-muted-foreground">kWh/year</p>
                        </div>
                      </div>
                    </div>

                    {/* Center - Energy Offset */}
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                      <div className="flex flex-col items-center" >
                        <p className="text-sm text-muted-foreground mb-2">Energy Offset</p>
                        <CircularProgress  percentage={energyOffset} />
                      </div>
                    </div>

                    {/* Bottom Row */}
                    <div className="absolute bottom-0 w-full flex justify-between">
                      {/* Bottom Left - Solar Panel Size */}
                      <div className="text-center">
                        <div className="flex flex-col items-center">
                          <BarChart2 className="w-12 h-12 mb-2 text-primary" />
                          <p className="text-sm text-muted-foreground">Solar Panel Size</p>
                          <p className="text-2xl font-bold text-primary">{proposalData.solarPanelSize || "0"}</p>
                          <p className="text-sm text-muted-foreground">kW</p>
                        </div>
                      </div>

                      {/* Bottom Right - Year 1 Production */}
                      <div className="text-center">
                        <div className="flex flex-col items-center">
                          <Zap className="w-12 h-12 mb-2 text-primary" />
                          <p className="text-sm text-muted-foreground">Year 1 Production</p>
                          <p className="text-2xl font-bold text-primary">{proposalData.yearlyEnergyProduced || "0"}</p>
                          <p className="text-sm text-muted-foreground">kWh/year</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-12"
          >
            <Card className="bg-card/50 backdrop-blur border-primary/10">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-center">Advanced Solar Technology</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center mb-6">
                  Our solar panels use advanced photovoltaic technology to convert sunlight into electricity. They are
                  designed to withstand various weather conditions and have an expected lifespan of 25-30 years.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex flex-col items-center text-center">
                    <BarChart2 className="w-12 h-12 mb-2 text-primary" />
                    <p className="font-semibold">Panel Efficiency</p>
                    <p className="text-lg text-primary">20-22%</p>
                  </div>
                  <div className="flex flex-col items-center text-center">
                    <Thermometer className="w-12 h-12 mb-2 text-primary" />
                    <p className="font-semibold">Temperature Coefficient</p>
                    <p className="text-lg text-primary">-0.35% / °C</p>
                  </div>
                  <div className="flex flex-col items-center text-center">
                    <Shield className="w-12 h-12 mb-2 text-primary" />
                    <p className="font-semibold">Warranty</p>
                    <p className="text-lg text-primary">25 years performance</p>
                    <p className="text-lg text-primary">10 years product</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>
  )
}

