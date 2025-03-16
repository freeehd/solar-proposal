"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
  LabelList,
} from "recharts"
import { DollarSign, Lightbulb, Zap, TrendingUp, ArrowDown, ArrowUp } from "lucide-react"
import { motion } from "framer-motion"
import { useMediaQuery } from "@/hooks/use-media-query"

interface EnergyUsageSectionProps {
  proposalData: {
    // Only use snake_case properties to match API response
    monthly_bill?: string
    average_rate_kwh?: string
    escalation?: string
    energy_data?: string
  }
}

interface ChartData {
  month: string
  usage: number
  production: number
  difference: number
  isPositive: boolean
}

// Custom tooltip component for the comparison chart
const CustomComparisonTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const usage = payload[0].value
    const production = payload[1].value
    const difference = production - usage
    const isPositive = difference >= 0

    return (
      <div className="custom-tooltip bg-white p-3 rounded-lg border border-indigo-dye/20 shadow-lg">
        <p className="font-medium text-sm mb-2">{label}</p>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between gap-4">
            <span className="text-smoky-black/70">Usage:</span>
            <span className="font-medium">{usage.toLocaleString()} kWh</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-smoky-black/70">Production:</span>
            <span className="font-medium">{production.toLocaleString()} kWh</span>
          </div>
          <div className="flex justify-between gap-4 pt-1 border-t border-gray-200 mt-1">
            <span className="text-smoky-black/70">Difference:</span>
            <span className={`font-medium ${isPositive ? "text-green-600" : "text-amber-600"}`}>
              {isPositive ? "+" : ""}
              {difference.toLocaleString()} kWh
            </span>
          </div>
        </div>
      </div>
    )
  }

  return null
}

export default function EnergyUsageSection({ proposalData }: EnergyUsageSectionProps) {
  const [utilityData, setUtilityData] = useState<Array<{ year: number; amount: number }>>([])
  const [totalPayments, setTotalPayments] = useState(0)
  const [finalMonthlyPayment, setFinalMonthlyPayment] = useState(0)
  const [data, setData] = useState<ChartData[]>([])
  const [annualTotals, setAnnualTotals] = useState({ usage: 0, production: 0, offset: 0 })

  // Media queries for responsive design
  const isMobile = useMediaQuery("(max-width: 640px)")
  const isTablet = useMediaQuery("(min-width: 641px) and (max-width: 1024px)")

  // Get values from props with defaults
  const monthly_bill = proposalData.monthly_bill || "0"
  const average_rate_kwh = proposalData.average_rate_kwh || "0"
  const escalation = proposalData.escalation || "0"
  const energy_data = proposalData.energy_data || ""

  useEffect(() => {
    if (!proposalData) {
      console.error("proposalData is undefined or null")
      return
    }

    try {
      const monthlyBillValue = Number.parseFloat(monthly_bill)
      const escalationValue = Number.parseFloat(escalation)

      if (isNaN(monthlyBillValue) || isNaN(escalationValue)) {
        throw new Error("Invalid monthly_bill or escalation value")
      }

      const newUtilityData = Array.from({ length: 30 }, (_, i) => ({
        year: i + 1,
        amount: Number((monthlyBillValue * Math.pow(1 + escalationValue / 100, i)).toFixed(2)),
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
  }, [monthly_bill, escalation, proposalData])

  useEffect(() => {
    if (energy_data) {
      const lines = energy_data.trim().split("\n")
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

        const chartData = months.map((month, index) => {
          const usageVal = usage[index]
          const productionVal = production[index]
          const difference = productionVal - usageVal

          return {
            month,
            usage: usageVal,
            production: productionVal,
            difference,
            isPositive: difference >= 0,
          }
        })

        setData(chartData)

        // Calculate annual totals
        const totalUsage = usage.reduce((sum, val) => sum + val, 0)
        const totalProduction = production.reduce((sum, val) => sum + val, 0)
        const offset = (totalProduction / totalUsage) * 100

        setAnnualTotals({
          usage: totalUsage,
          production: totalProduction,
          offset: Math.round(offset),
        })
      }
    }
  }, [energy_data])

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

  // Calculate max value for chart scaling
  const maxChartValue = useMemo(() => {
    if (data.length === 0) return 1000
    const maxUsage = Math.max(...data.map((d) => d.usage))
    const maxProduction = Math.max(...data.map((d) => d.production))
    return Math.max(maxUsage, maxProduction) * 1.1 // Add 10% padding
  }, [data])

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
                    ${Number(monthly_bill).toFixed(2)}
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
                    ${average_rate_kwh}/kWh
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

        {/* Energy Usage vs. Production Chart - IMPROVED */}
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
              <CardDescription className="text-sm text-smoky-black/70">
                {annualTotals.offset > 0 && (
                  <span>
                    Your system offsets approximately{" "}
                    <span className="font-semibold text-indigo-dye-600">{annualTotals.offset}%</span> of your annual
                    energy usage
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Annual summary cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                <Card className="bg-indigo-50 border-indigo-dye/10">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-smoky-black/70">Annual Usage</p>
                        <p className="text-lg font-bold text-smoky-black">{annualTotals.usage.toLocaleString()} kWh</p>
                      </div>
                      <ArrowUp className="h-5 w-5 text-amber-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-indigo-50 border-indigo-dye/10">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-smoky-black/70">Annual Production</p>
                        <p className="text-lg font-bold text-indigo-dye-600">
                          {annualTotals.production.toLocaleString()} kWh
                        </p>
                      </div>
                      <ArrowDown className="h-5 w-5 text-indigo-dye-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-indigo-50 border-indigo-dye/10">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-smoky-black/70">Energy Offset</p>
                        <p className="text-lg font-bold text-green-600">{annualTotals.offset}%</p>
                      </div>
                      <div className="h-5 w-5 rounded-full bg-green-600 flex items-center justify-center">
                        <span className="text-white text-xs font-bold">✓</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

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
                      barCategoryGap={isMobile ? "15%" : "20%"}
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
                        domain={[0, maxChartValue]}
                      />
                      <Tooltip content={<CustomComparisonTooltip />} />
                      <Legend
                        verticalAlign="top"
                        height={36}
                        wrapperStyle={{
                          fontSize: isMobile ? "10px" : "12px",
                          marginTop: isMobile ? "5px" : "10px",
                        }}
                        formatter={(value) => {
                          if (value === "usage") return "Energy Usage"
                          if (value === "production") return "Solar Production"
                          return value
                        }}
                      />

                      {/* Reference line for average usage */}
                      <ReferenceLine
                        y={annualTotals.usage / 12}
                        stroke="#EDAE49"
                        strokeDasharray="3 3"
                        strokeWidth={1.5}
                        label={{
                          value: "Avg Usage",
                          position: "right",
                          fill: "#EDAE49",
                          fontSize: 10,
                        }}
                      />

                      {/* Reference line for average production */}
                      <ReferenceLine
                        y={annualTotals.production / 12}
                        stroke="#1a7aaa"
                        strokeDasharray="3 3"
                        strokeWidth={1.5}
                        label={{
                          value: "Avg Production",
                          position: "right",
                          fill: "#1a7aaa",
                          fontSize: 10,
                        }}
                      />

                      <Bar
                        name="usage"
                        dataKey="usage"
                        fill="#EDAE49"
                        radius={[4, 4, 0, 0]}
                        barSize={getComparisonBarSize()}
                      >
                        {data.map((entry, index) => (
                          <Cell key={`usage-${index}`} fill="#EDAE49" />
                        ))}
                      </Bar>

                      <Bar
                        name="production"
                        dataKey="production"
                        fill="#1a7aaa"
                        radius={[4, 4, 0, 0]}
                        barSize={getComparisonBarSize()}
                      >
                        {data.map((entry, index) => (
                          <Cell key={`production-${index}`} fill={entry.isPositive ? "#1a7aaa" : "#1a7aaa"} />
                        ))}

                        {/* Only show labels on non-mobile */}
                        {!isMobile && (
                          <LabelList
                            dataKey="difference"
                            position="top"
                            formatter={(value: number) => {
                              if (value === 0) return ""
                              return value > 0 ? `+${value}` : value
                            }}
                            style={{
                              fontSize: 10,
                              fill: (value: number) => (value >= 0 ? "#047857" : "#b45309"),
                              fontWeight: "bold",
                            }}
                          />
                        )}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-smoky-black/70 font-medium">No data available</p>
                  </div>
                )}
              </div>

              {/* Legend explanation */}
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-smoky-black/70">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-amber-500 rounded-sm"></div>
                  <span>Energy Usage: Your home's monthly electricity consumption</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-indigo-dye-600 rounded-sm"></div>
                  <span>Solar Production: Energy generated by your new solar system</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  )
}

