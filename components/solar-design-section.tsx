"use client"

import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sun, Zap, Percent } from "lucide-react"
import { motion } from "framer-motion"

interface SolarDesignSectionProps {
  proposalData: {
    numberOfSolarPanels?: string
    yearlyEnergyProduced?: string
    energyOffset?: string
    solarPanelDesign?: string
  }
}

export default function SolarDesignSection({ proposalData }: SolarDesignSectionProps) {
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <section className="py-20 bg-gradient-to-b from-background to-gray-900">
      <div className="container mx-auto px-4">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl font-bold mb-12 text-center accent-text"
        >
          Your Solar Design Breakdown
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="relative w-full aspect-[16/9] rounded-lg overflow-hidden shadow-lg order-2 md:order-1"
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 order-1 md:order-2">
            <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.1 }}>
              <Card className="bg-card/50 backdrop-blur border-primary/10">
                <CardHeader>
                  <CardTitle className="flex flex-col items-center">
                    <Sun className="w-12 h-12 mb-4 text-primary" />
                    Solar panels
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-4xl font-bold text-primary">{proposalData.numberOfSolarPanels || "0"}</p>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.2 }}>
              <Card className="bg-card/50 backdrop-blur border-primary/10">
                <CardHeader>
                  <CardTitle className="flex flex-col items-center">
                    <Zap className="w-12 h-12 mb-4 text-primary" />
                    kWh/year
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-4xl font-bold text-primary">{proposalData.yearlyEnergyProduced || "0"}</p>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.3 }}>
              <Card className="bg-card/50 backdrop-blur border-primary/10">
                <CardHeader>
                  <CardTitle className="flex flex-col items-center">
                    <Percent className="w-12 h-12 mb-4 text-primary" />
                    Energy offset
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-4xl font-bold text-primary">{proposalData.energyOffset || "0"}%</p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}

