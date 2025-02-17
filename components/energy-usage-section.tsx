"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { DollarSign, Lightbulb, Zap } from "lucide-react"
import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface EnergyUsageSectionProps {
  proposalData: {
    monthlyBill: string
    averageRateKWh: string
    escalation: string
  }
}

export default function EnergyUsageSection({ proposalData }: EnergyUsageSectionProps) {
  const [utilityData, setUtilityData] = useState<Array<{ year: number; amount: number }>>([])
  const [totalPayments, setTotalPayments] = useState(0)
  const [finalMonthlyPayment, setFinalMonthlyPayment] = useState(0)

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
            <Card className="bg-card backdrop-blur border-primary/10 relative z-20">
              <CardHeader>
                <CardTitle>Monthly Utility Costs Over 30 Years</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] w-full">
                  {utilityData.length > 0 ? (
                      <ChartContainer
                          config={{
                            amount: {
                              label: "Monthly Cost",
                              color: "hsl(var(--primary))",
                            },
                          }}
                          className="min-h-[200px]"
                      >
                        <BarChart
                            data={utilityData}
                            margin={{ top: 10, right: 10, bottom: 20, left: 40 }}
                            barSize={12}
                            accessibilityLayer
                        >
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
                          <ChartTooltip
                              content={
                                <ChartTooltipContent
                                    style={{
                                      backgroundColor: "hsl(var(--background))",
                                      border: "1px solid hsl(var(--border))",
                                      borderRadius: "var(--radius)",
                                      padding: "8px",
                                    }}
                                />
                              }
                              cursor={{
                                fill: "hsl(var(--muted))",
                                opacity: 0.1,
                              }}
                          />
                          <Bar dataKey="amount" fill="red" opacity={0.5} radius={[4, 4, 0, 0]}>
                            <defs>
                              <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                              </linearGradient>
                            </defs>
                          </Bar>
                        </BarChart>
                      </ChartContainer>
                  ) : (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-muted-foreground">No data available</p>
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

