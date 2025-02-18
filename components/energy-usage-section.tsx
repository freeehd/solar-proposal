"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { DollarSign, Lightbulb, Zap } from "lucide-react"
import { motion } from "framer-motion"

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
  const [inputText, setInputText] = useState(proposalData.energyData || "")
  const [error, setError] = useState("")

  useEffect(() => {
    if (!proposalData) {
      console.error("proposalData is undefined or null")
      return
    }

    try {
      const monthlyBill = Number.parseFloat(proposalData.monthlyBill || "0")
      const escalation = Number.parseFloat(proposalData.escalation || "0")
      const averageRateKWh = Number.parseFloat(proposalData.averageRateKWh || "0")

      if (isNaN(monthlyBill) || isNaN(escalation) || isNaN(averageRateKWh)) {
        throw new Error("Invalid monthlyBill, escalation, or averageRateKWh value")
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

  const parseData = useCallback((text: string) => {
    try {
      const lines = text.split("\n").filter((line) => line.trim())
      if (lines.length !== 3) {
        throw new Error(`Expected 3 lines of data, but got ${lines.length}`)
      }

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

      if (months.length !== 12 || usage.length !== 12 || production.length !== 12) {
        throw new Error(
            `Invalid data length. Expected 12 entries each, but got: Months: ${months.length}, Usage: ${usage.length}, Production: ${production.length}`,
        )
      }

      const chartData = months.map((month, index) => ({
        month,
        usage: usage[index],
        production: production[index],
      }))

      setData(chartData)
      setError("")
    } catch (err) {
      setError(`Invalid data format: ${err.message}`)
      setData([])
    }
  }, [])

  const yAxisDomain = useMemo(() => {
    if (data.length === 0) return [0, 100]
    const maxValue = Math.max(...data.map((d) => Math.max(d.usage, d.production)))
    const upperLimit = Math.ceil(maxValue / 500) * 500
    return [0, upperLimit]
  }, [data])

  const yAxisTicks = useMemo(() => {
    const [, upperLimit] = yAxisDomain
    const tickCount = 5
    const tickInterval = upperLimit / tickCount
    return Array.from({ length: tickCount + 1 }, (_, i) => i * tickInterval)
  }, [yAxisDomain])

  useEffect(() => {
    if (proposalData.energyData) {
      parseData(proposalData.energyData)
    }
  }, [proposalData.energyData, parseData])

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  return (
      <section id="energy-usage" className="relative z-10 py-20 mb-20 bg-gradient-to-b from-gray-900 to-background">
        <div className="container mx-auto px-4">
          <motion.h2
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-4xl font-bold mb-12 text-center accent-text"
          >
            Your Energy Usage
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.1 }}>
              <Card className="bg-card/50 backdrop-blur border-primary/10">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <DollarSign className="w-6 h-6 mr-2 text-primary" />
                    Current Monthly Bill
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-primary">${Number(proposalData?.monthlyBill || 0).toFixed(2)}</p>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.2 }}>
              <Card className="bg-card/50 backdrop-blur border-primary/10">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Lightbulb className="w-6 h-6 mr-2 text-primary" />
                    Estimated in 30 years
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-primary">${finalMonthlyPayment.toFixed(2)}</p>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.3 }}>
              <Card className="bg-card/50 backdrop-blur border-primary/10">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <DollarSign className="w-6 h-6 mr-2 text-primary" />
                    Total payments after 30 years
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-primary">${totalPayments.toFixed(2)}</p>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.4 }}>
              <Card className="bg-card/50 backdrop-blur border-primary/10">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Zap className="w-6 h-6 mr-2 text-primary" />
                    Average Rate/kWh
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-primary">${proposalData?.averageRateKWh || "0"}/kWh</p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
          <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Card className="bg-card/50 backdrop-blur border-primary/10 relative z-20 mb-12">
              <CardHeader>
                <CardTitle>Monthly Utility Costs Over 30 Years</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] w-full">
                  {utilityData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={utilityData} margin={{ top: 10, right: 10, bottom: 20, left: 40 }} barSize={12}>
                          <CartesianGrid
                              strokeDasharray="3 3"
                              horizontal={true}
                              vertical={false}
                              stroke="hsl(var(--muted-foreground))"
                              opacity={0.2}
                          />
                          <XAxis
                              dataKey="year"
                              tickLine={false}
                              axisLine={false}
                              tickMargin={5}
                              stroke="hsl(var(--muted-foreground))"
                              fontSize={10}
                          />
                          <YAxis
                              tickLine={false}
                              axisLine={false}
                              tickMargin={5}
                              stroke="hsl(var(--muted-foreground))"
                              fontSize={10}
                              tickFormatter={(value) => `$${value}`}
                          />
                          <Tooltip
                              contentStyle={{
                                backgroundColor: "hsl(var(--background))",
                                border: "1px solid hsl(var(--border))",
                                borderRadius: "var(--radius)",
                              }}
                              formatter={(value) => [`$${value}`, "Monthly Cost"]}
                          />
                          <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                  ) : (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-muted-foreground">No data available</p>
                      </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
          >
            <Card className="bg-card/50 backdrop-blur border-primary/10 relative z-20">
              <CardHeader>
                <CardTitle>Energy Usage vs. New System Production</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="h-[400px] w-full">
                    {data.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                              data={data}
                              margin={{
                                top: 20,
                                right: 20,
                                bottom: 40,
                                left: 40,
                              }}
                              barGap={0}
                              barSize={20}
                          >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
                            <XAxis
                                dataKey="month"
                                tickLine={false}
                                axisLine={false}
                                tick={{ fill: "#666" }}
                                tickFormatter={(value) => value.slice(0, 3)}
                                padding={{ left: 20, right: 20 }}
                            />
                            <YAxis
                                tickLine={false}
                                axisLine={false}
                                tick={{ fill: "#666" }}
                                tickFormatter={(value) => `${value} kWh`}
                                domain={yAxisDomain}
                                ticks={yAxisTicks}
                            />
                            <Tooltip formatter={(value) => `${value} kWh`} labelFormatter={(label) => `Month: ${label}`} />
                            <Legend />
                            <Bar name="Energy Usage" dataKey="usage" fill="#FF6B4A" radius={[0, 0, 0, 0]} />
                            <Bar name="New System Production" dataKey="production" fill="#FFB84D" radius={[0, 0, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-full">
                          <p className="text-muted-foreground">No data available</p>
                        </div>
                    )}
                  </div>
                  <div className="space-y-2">{error && <p className="text-red-500 text-sm">{error}</p>}</div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>
  )
}

