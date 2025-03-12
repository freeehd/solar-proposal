"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { DollarSign, Lightbulb, Zap, TrendingUp } from "lucide-react"
import { motion } from "framer-motion"
import { useMediaQuery } from "@/hooks/use-media-query"

interface EnergyUsageSectionProps {
  proposalData: {
    monthlyBill: string
    averageRateKWh: string
    escalation: string
    energyData: string
  }
}

interface ChartData {
  month: string
  usage: number
  production: number
}

export default function EnergyUsageSection({ proposalData }: EnergyUsageSectionProps) {
  const [utilityData, setUtilityData] = useState<Array<{ year: number; amount: number }>>([])
  const [totalPayments, setTotalPayments] = useState(0)
  const [finalMonthlyPayment, setFinalMonthlyPayment] = useState(0)
  const [data, setData] = useState<ChartData[]>([])

  // Media queries for responsive design
  const isMobile = useMediaQuery("(max-width: 640px)")
  const isTablet = useMediaQuery("(min-width: 641px) and (max-width: 1024px)")

  useEffect(() => {
    if (!proposalData) {
      console.error("proposalData is undefined or null")
      return
    }

    try {
      const monthlyBill = Number.parseFloat(proposalData.monthlyBill || "0")
      const escalation = Number.parseFloat(proposalData.escalation || "0")

      if (isNaN(monthlyBill) || isNaN(escalation)) {
        throw new Error("Invalid monthlyBill or escalation value")
      }

      const newUtilityData = Array.from({ length: 30 }, (_, i) => ({
        year: i + 1,
        amount: Number((monthlyBill * Math.pow(1 + escalation / 100, i)).toFixed(2)),
      }))

      setUtilityData(newUtilityData)

      const newTotalPayments = newUtilityData.reduce((sum, year) => sum + year.amount * 12, 0)
      setTotalPayments(newTotalPayments)

      setFinalMonthlyPayment(newUtilityData[newUtilityData.length - 1].amount)
    } catch (error) {
      console.error("Error calculating utility data:", error)
      setUtilityData([])
      setTotalPayments(0)
      setFinalMonthlyPayment(0)
    }
  }, [proposalData])

  useEffect(() => {
    if (proposalData.energyData) {
      const lines = proposalData.energyData.trim().split("\n")
      if (lines.length === 3) {
        const months = lines[0].split("\t").filter((item) => item.trim())
        const usage = lines[1]
          .split("\t")
          .filter((item) => item.trim())
          .slice(1)
          .map((v) => Number.parseFloat(v.replace(",", "")))
        const production = lines[2]
          .split("\t")
          .filter((item) => item.trim())
          .slice(1)
          .map((v) => Number.parseFloat(v.replace(",", "")))

        const chartData = months.map((month, index) => ({
          month,
          usage: usage[index],
          production: production[index],
        }))

        setData(chartData)
      }
    }
  }, [proposalData.energyData])

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  // Adjust bar size based on device
  const getBarSize = () => {
    if (isMobile) {
      return 10 // Increased from 8
    } else if (isTablet) {
      return 12 // Increased from 10
    }
    return 14 // Increased from 12
  }

  // Adjust comparison chart bar size based on device
  const getComparisonBarSize = () => {
    if (isMobile) {
      return 14 // Increased from 12
    } else if (isTablet) {
      return 18 // Increased from 16
    }
    return 22 // Increased from 20
  }

  // Format large numbers with commas
  const formatLargeNumber = (num: number) => {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num)
  }

  return (
    <section className="relative z-10 py-12 sm:py-16 md:py-20 bg-white">
      <div className="container mx-auto px-4">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight mb-8 sm:mb-10 md:mb-12 text-center text-indigo-dye-600"
        >
          Your Energy Usage
        </motion.h2>

        {/* Energy Cost Overview Card */}
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="bg-white shadow-lg border-indigo-dye/20">
            <CardHeader className="pb-2 sm:pb-4">
              <CardTitle className="text-xl sm:text-2xl font-semibold leading-tight text-center text-smoky-black">
                Energy Cost Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                {/* Current Monthly Bill */}
                <div className="flex flex-col items-center">
                  <DollarSign className="w-8 h-8 sm:w-10 sm:h-10 mb-2 sm:mb-3 text-indigo-dye-600" strokeWidth={2.5} />
                  <p className="text-xs sm:text-sm font-medium text-smoky-black/80 text-center">Current Monthly Bill</p>
                  <p className="text-lg sm:text-xl md:text-2xl font-bold leading-tight text-indigo-dye-600">
                    ${Number(proposalData.monthlyBill || 0).toFixed(2)}
                  </p>
                </div>

                {/* Estimated in 30 years */}
                <div className="flex flex-col items-center">
                  <TrendingUp className="w-8 h-8 sm:w-10 sm:h-10 mb-2 sm:mb-3 text-indigo-dye-600" strokeWidth={2.5} />
                  <p className="text-xs sm:text-sm font-medium text-smoky-black/80 text-center">
                    Estimated in 30 years
                  </p>
                  <p className="text-lg sm:text-xl md:text-2xl font-bold leading-tight text-indigo-dye-600">
                    ${finalMonthlyPayment.toFixed(2)}
                  </p>
                </div>

                {/* Total payments after 30 years */}
                <div className="flex flex-col items-center">
                  <Lightbulb className="w-8 h-8 sm:w-10 sm:h-10 mb-2 sm:mb-3 text-indigo-dye-600" strokeWidth={2.5} />
                  <p className="text-xs sm:text-sm font-medium text-smoky-black/80 text-center">
                    Total payments (30 yrs)
                  </p>
                  <p className="text-lg sm:text-xl md:text-2xl font-bold leading-tight text-indigo-dye-600">
                    ${formatLargeNumber(totalPayments)}
                  </p>
                </div>

                {/* Average Rate/kWh */}
                <div className="flex flex-col items-center">
                  <Zap className="w-8 h-8 sm:w-10 sm:h-10 mb-2 sm:mb-3 text-indigo-dye-600" strokeWidth={2.5} />
                  <p className="text-xs sm:text-sm font-medium text-smoky-black/80 text-center">Average Rate/kWh</p>
                  <p className="text-lg sm:text-xl md:text-2xl font-bold leading-tight text-indigo-dye-600">
                    ${proposalData.averageRateKWh || "0"}/kWh
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Monthly Utility Costs Chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-8 sm:mt-10 md:mt-12"
        >
          <Card className="bg-white shadow-lg border-indigo-dye/20">
            <CardHeader className="pb-2 sm:pb-4">
              <CardTitle className="text-lg sm:text-xl md:text-2xl font-semibold text-smoky-black">
                Monthly Utility Costs Over 30 Years
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] sm:h-[350px] md:h-[400px] w-full">
                {utilityData.length > 0 ? (
                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                    debounce={50}
                    key={`chart-container-${isMobile ? "mobile" : isTablet ? "tablet" : "desktop"}`}
                  >
                    <BarChart
                      data={utilityData}
                      margin={{
                        top: 20,
                        right: isMobile ? 10 : 20,
                        bottom: isMobile ? 50 : 40,
                        left: isMobile ? 40 : 50,
                      }}
                      barSize={getBarSize()}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#c2cadc" opacity={0.3} />
                      <XAxis
                        dataKey="year"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        stroke="#0b0a08"
                        opacity={0.7}
                        fontSize={isMobile ? 10 : 11}
                        // Show fewer ticks on mobile
                        ticks={isMobile ? [1, 10, 20, 30] : [1, 5, 10, 15, 20, 25, 30]}
                        height={isMobile ? 40 : 30}
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        tickMargin={5}
                        stroke="#0b0a08"
                        opacity={0.7}
                        fontSize={isMobile ? 9 : 11}
                        tickFormatter={(value) => `$${value}`}
                        // On mobile, reduce the number of ticks
                        tick={isMobile ? { fontSize: 9 } : { fontSize: 11 }}
                        width={isMobile ? 40 : 50}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "white",
                          border: "1px solid #c2cadc",
                          borderRadius: "0.5rem",
                          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                          fontSize: isMobile ? "12px" : "14px",
                          padding: isMobile ? "6px" : "8px",
                        }}
                        formatter={(value) => [`$${value}`, "Monthly Cost"]}
                      />
                      <Bar dataKey="amount" fill="#1a7aaa" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-smoky-black/70 font-medium">No data available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Energy Usage vs. Production Chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-8 sm:mt-10 md:mt-12"
        >
          <Card className="bg-white shadow-lg border-indigo-dye/20">
            <CardHeader className="pb-2 sm:pb-4">
              <CardTitle className="text-lg sm:text-xl md:text-2xl font-semibold text-smoky-black">
                Energy Usage vs. New System Production
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] sm:h-[350px] md:h-[400px] w-full">
                {data.length > 0 ? (
                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                    debounce={50}
                    key={`chart-container-${isMobile ? "mobile" : isTablet ? "tablet" : "desktop"}`}
                  >
                    <BarChart
                      data={data}
                      margin={{
                        top: 20,
                        right: isMobile ? 15 : 25,
                        bottom: isMobile ? 60 : 50,
                        left: isMobile ? 40 : 50,
                      }}
                      barGap={0}
                      barSize={getComparisonBarSize()}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#c2cadc" opacity={0.3} />
                      <XAxis
                        dataKey="month"
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: "#0b0a08", fontSize: isMobile ? 10 : 11 }}
                        opacity={0.7}
                        tickFormatter={(value) => value.slice(0, 3)}
                        padding={{ left: isMobile ? 15 : 20, right: isMobile ? 15 : 20 }}
                        height={isMobile ? 40 : 30}
                        tickMargin={8}
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: "#0b0a08", fontSize: isMobile ? 9 : 11 }}
                        opacity={0.7}
                        tickFormatter={(value) => (isMobile ? `${value}` : `${value} kWh`)}
                        width={isMobile ? 35 : 50}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "white",
                          border: "1px solid #c2cadc",
                          borderRadius: "0.5rem",
                          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                          fontSize: isMobile ? "12px" : "14px",
                          padding: isMobile ? "6px" : "8px",
                        }}
                        formatter={(value) => `${value} kWh`}
                        labelFormatter={(label) => `Month: ${label}`}
                      />
                      <Legend
                        wrapperStyle={{
                          fontSize: isMobile ? "10px" : "12px",
                          marginTop: isMobile ? "5px" : "10px",
                        }}
                      />
                      <Bar name="Energy Usage" dataKey="usage" fill="#1a7aaa" radius={[4, 4, 0, 0]} />
                      <Bar name="New System Production" dataKey="production" fill="#97a12f" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-smoky-black/70 font-medium">No data available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  )
}

