"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts"
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

// Custom tooltip with theme variables
const CustomComparisonTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const usage = payload[0].value
    const production = payload[1].value
    const difference = production - usage
    const isPositive = difference >= 0

    return (
      <div className="custom-tooltip bg-white p-3 rounded-lg border border-gray-200 shadow-lg">
        <p className="font-medium text-sm mb-2">{label}</p>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between gap-4">
            <span className="text-gray-600">Usage:</span>
            <span className="font-medium">{usage.toLocaleString()} kWh</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-gray-600">Production:</span>
            <span className="font-medium">{production.toLocaleString()} kWh</span>
          </div>
          <div className="flex justify-between gap-4 pt-1 border-t border-gray-200 mt-1">
            <span className="text-gray-600">Difference:</span>
            <span className={`font-medium ${isPositive ? "text-green-600" : "text-red-600"}`}>
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
      return 10
    } else if (isTablet) {
      return 14
    }
    return 18
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

  // Calculate the max y-axis value rounded up to the nearest 500
  const maxYAxisValue = useMemo(() => {
    return Math.ceil(maxChartValue / 500) * 500
  }, [maxChartValue])

  return (
    <section className="relative z-10   bg-background">
      <div className="container mx-auto px-4">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight mb-8 sm:mb-10 md:mb-12 text-center text-primary"
        >
        </motion.h2>

        {/* Energy Usage vs. Production Chart - IMPROVED */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-8 sm:mt-10 md:mt-12"
        >
          <Card className="bg-card shadow-lg border-border">
            <CardHeader className="pb-2 sm:pb-4">
              {/* <CardTitle className="text-lg sm:text-xl md:text-2xl font-semibold text-foreground">
                Energy Usage vs. New System Production
              </CardTitle> */}
              {/* <CardDescription className="text-sm text-foreground/70">
                {annualTotals.offset > 0 && (
                  <span>
                    Your system offsets approximately{" "}
                    <span className="font-semibold text-primary">{annualTotals.offset}%</span> of your annual
                    energy usage
                  </span>
                )}
              </CardDescription> */}
            </CardHeader>
            <CardContent className="p-0">
              {/* Annual summary cards
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                <Card className="bg-secondary/20 border-border/20">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-foreground/70">Annual Usage</p>
                        <p className="text-lg font-bold text-foreground">{annualTotals.usage.toLocaleString()} kWh</p>
                      </div>
                      <ArrowUp className="h-5 w-5 text-[hsl(var(--chart-usage))]" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-secondary/20 border-border/20">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-foreground/70">Annual Production</p>
                        <p className="text-lg font-bold text-primary">
                          {annualTotals.production.toLocaleString()} kWh
                        </p>
                      </div>
                      <ArrowDown className="h-5 w-5 text-[hsl(var(--chart-production))]" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-secondary/20 border-border/20">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-foreground/70">Energy Offset</p>
                        <p className="text-lg font-bold text-[hsl(var(--chart-production))]">{annualTotals.offset}%</p>
                      </div>
                      <div className="h-5 w-5 rounded-full bg-[hsl(var(--chart-production))] flex items-center justify-center">
                        <span className="text-white text-xs font-bold">✓</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div> */}

              <div className="h-[350px] sm:h-[450px] md:h-[550px] w-full bg-white rounded-lg">
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
                        top: 30,
                        right: isMobile ? 10 : 15,
                        bottom: isMobile ? 40 : 30,
                        left: isMobile ? 0 : 30,
                      }}
                      barGap={0}
                      barCategoryGap={isMobile ? "30%" : "40%"}
                    >
                      <defs>
                        {/* Sunset gradient for usage */}
                        <linearGradient id="sunsetGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#9C21f0" stopOpacity={1} /> {/* Light yellow */}
                          
                          <stop offset="100%" stopColor="#64B5F6" stopOpacity={1} /> {/* Deep red-orange */}
                        </linearGradient>

                        {/* Pearlescent green gradient for production */}
                        <linearGradient id="greenGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="30%" stopColor="#66BB6A" stopOpacity={1} /> {/* Lightest green */}
                          
                          <stop offset="100%" stopColor="#64B5F6" stopOpacity={1} /> {/* Pearl green */}
                        </linearGradient>
                      </defs>

                      <CartesianGrid vertical={false} stroke="#e5e7eb" opacity={0.7} />
                      <XAxis
                        dataKey="month"
                        tickLine={false}
                        axisLine={{ stroke: "#e5e7eb" }}
                        tick={{ fill: "#374151", fontSize: isMobile ? 10 : 12 }}
                        tickFormatter={(value) => value.slice(0, 3)}
                        padding={{ left: isMobile ? 5 : 10, right: isMobile ? 5 : 10 }}
                        height={isMobile ? 40 : 30}
                        tickMargin={8}
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={{ stroke: "#e5e7eb" }}
                        tick={{ fill: "#374151", fontSize: isMobile ? 9 : 11 }}
                        tickFormatter={(value) => (isMobile ? `${value}` : `${value} kwh`.replace(/\s+/g, " "))} // Ensure text is in one line
                        width={isMobile ? 25 : 80}
                        domain={[0, maxYAxisValue]}
                        ticks={Array.from({ length: Math.floor(maxYAxisValue / 500) + 1 }, (_, i) => i * 500)}
                        className="text-current"
                      />
                      <Tooltip content={<CustomComparisonTooltip />} />
                      <Legend
                        verticalAlign="bottom"
                        height={36}
                        iconType="square"
                        iconSize={10}
                        wrapperStyle={{
                          fontSize: isMobile ? "11px" : "13px",
                          fontWeight: "500",
                        }}
                        formatter={(value) => {
                          if (value === "usage") return "Energy Usage"
                          if (value === "production") return "Solar Production"
                          return value
                        }}
                      />

                      <Bar
                        name="usage"
                        dataKey="usage"
                        fill="url(#sunsetGradient)"
                        radius={[4, 4, 0, 0]}
                        barSize={getComparisonBarSize()}
                      />

                      <Bar
                        name="production"
                        dataKey="production"
                        fill="url(#greenGradient)"
                        radius={[4, 4, 0, 0]}
                        barSize={getComparisonBarSize()}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-foreground/70 font-medium">No data available</p>
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

