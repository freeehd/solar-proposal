"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  CartesianGrid,
  type TooltipProps,
  Area,
  ComposedChart,
  ReferenceArea,
  Label,
} from "recharts"
import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect, useMemo } from "react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowRight, TrendingUp, DollarSign, Percent, Calendar } from "lucide-react"

interface FinancingSectionProps {
  proposalData: {
    payback_period?: string
    total_system_cost?: string
    lifetime_savings?: string
    net_cost?: string
    monthly_bill?: string
    escalation?: string
  }
}

// Custom tooltip component for better formatting
const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    const cashflow = payload[0].value as number

    const formattedCashflow = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(cashflow)

    return (
      <div className="custom-tooltip bg-background/95 backdrop-blur p-4 rounded-lg border border-border shadow-lg">
        <p className="font-medium text-sm mb-2">Year {label}</p>
        <div className="space-y-1">
          <p className="text-sm flex justify-between gap-4">
            <span className="text-muted-foreground">Cumulative Savings:</span>
            <span className={cashflow >= 0 ? "text-green-500 font-semibold" : "text-red-500 font-semibold"}>
              {formattedCashflow}
            </span>
          </p>
        </div>
      </div>
    )
  }

  return null
}

export default function FinancingSection({ proposalData }: FinancingSectionProps) {
  const [breakEvenYear, setBreakEvenYear] = useState<number | null>(null)
  const [activeTimeframe, setActiveTimeframe] = useState<"10" | "20" | "30">("30")
  const [isChartVisible, setIsChartVisible] = useState(false)

  // Calculate cashflow data
  const cashflowData = useMemo(() => {
    // Parse input values with defaults
    const netCost = Number.parseFloat((proposalData.net_cost || "0").replace(/,/g, ""))
    const monthlyBill = Number.parseFloat((proposalData.monthly_bill || "0").replace(/,/g, ""))
    const escalation = Number.parseFloat(proposalData.escalation || "0") / 100

    let breakEvenFound = false

    // Calculate with solar
    return Array.from({ length: 30 }, (_, i) => {
      const year = i + 1
      let cumulativeCashflow = -netCost

      // Add savings for each year up to the current year
      for (let j = 0; j < year; j++) {
        // Annual savings with escalation
        const annualSavings = monthlyBill * 12 * Math.pow(1 + escalation, j)
        cumulativeCashflow += annualSavings
      }

      // Find break-even point
      if (cumulativeCashflow >= 0 && !breakEvenFound) {
        setBreakEvenYear(year)
        breakEvenFound = true
      }

      return {
        year,
        cashflow: Math.round(cumulativeCashflow),
      }
    })
  }, [proposalData])

  // Filter data based on selected timeframe
  const filteredData = useMemo(() => {
    return cashflowData.filter((item) => item.year <= Number.parseInt(activeTimeframe))
  }, [cashflowData, activeTimeframe])

  // Calculate ROI at the end of selected timeframe
  const roi = useMemo(() => {
    const initialInvestment = Number.parseFloat((proposalData.net_cost || "0").replace(/,/g, ""))
    if (initialInvestment === 0) return 0

    const finalValue = filteredData[filteredData.length - 1]?.cashflow || 0
    return ((finalValue + initialInvestment) / initialInvestment) * 100
  }, [filteredData, proposalData.net_cost])

  // Format currency for display
  const formatCurrency = (value = "0") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(Number.parseFloat(value.replace(/,/g, "")))
  }

  // Find min and max values for better axis scaling
  const minValue = Math.min(...filteredData.map((item) => item.cashflow))
  const maxValue = Math.max(...filteredData.map((item) => item.cashflow))

  // Add padding to the domain
  const yDomain = [Math.floor(minValue * 1.1), Math.ceil(maxValue * 1.1)]

  // Animation to reveal chart
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsChartVisible(true)
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  // Card animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  }

  // Staggered animation for metrics
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  }

  return (
    <section className="py-20 sky-gradient">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-normal leading-tight mb-3 accent-text">Your Financial Journey</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            See how your investment in solar energy transforms into significant savings over time
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          {[
            {
              label: "Payback Period",
              value: `${proposalData.payback_period || "0"} years`,
              icon: <Calendar className="h-5 w-5 text-blue-500" />,
              description: "Time to recoup your investment",
            },
            {
              label: "System Cost",
              value: formatCurrency(proposalData.total_system_cost),
              icon: <DollarSign className="h-5 w-5 text-green-500" />,
              description: "Total cost before incentives",
            },
            {
              label: "Lifetime Savings",
              value: formatCurrency(proposalData.lifetime_savings),
              icon: <TrendingUp className="h-5 w-5 text-purple-500" />,
              description: "Estimated 30-year savings",
            },
            {
              label: "ROI",
              value: `${Math.round(roi)}%`,
              icon: <Percent className="h-5 w-5 text-amber-500" />,
              description: `${activeTimeframe}-year return on investment`,
            },
          ].map((item) => (
            <motion.div key={item.label} variants={itemVariants}>
              <Card className="bg-card/50 backdrop-blur border-primary/10 h-full">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-full bg-background/80">{item.icon}</div>
                    <div>
                      <p className="text-sm text-muted-foreground">{item.label}</p>
                      <p className="text-2xl font-normal text-primary">{item.value}</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">{item.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <motion.div variants={cardVariants} initial="hidden" animate="visible">
          <Card className="bg-card/50 backdrop-blur border-primary/10">
            <CardHeader className="pb-2">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle>Cumulative Cashflow</CardTitle>
                  <CardDescription>Track your savings over time</CardDescription>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Tabs
                    value={activeTimeframe}
                    onValueChange={(v) => setActiveTimeframe(v as "10" | "20" | "30")}
                    className="w-auto"
                  >
                    <TabsList className="bg-background/50">
                      <TabsTrigger value="10">10 Years</TabsTrigger>
                      <TabsTrigger value="20">20 Years</TabsTrigger>
                      <TabsTrigger value="30">30 Years</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </div>

              {breakEvenYear && (
                <div className="mt-4 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                  <div className="flex items-center gap-2">
                    <ArrowRight className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-600">
                      Break-even point: <span className="font-bold">Year {breakEvenYear}</span>
                    </span>
                  </div>
                </div>
              )}
            </CardHeader>

            <CardContent>
              <AnimatePresence>
                {isChartVisible && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7 }}
                    className="h-[450px] w-full"
                  >
                    {filteredData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={filteredData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                          <defs>
                            <linearGradient id="colorCashflow" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                              <stop offset="0%" stopColor="#3B82F6" />
                              <stop offset="100%" stopColor="#8B5CF6" />
                            </linearGradient>
                          </defs>

                          <CartesianGrid strokeDasharray="3 3" stroke="#6B7280/30" />

                          <XAxis
                            dataKey="year"
                            stroke="#6B7280"
                            label={{
                              value: "Years",
                              position: "insideBottomRight",
                              offset: -10,
                            }}
                          />

                          <YAxis
                            stroke="#6B7280"
                            domain={yDomain}
                            tickFormatter={(value) =>
                              new Intl.NumberFormat("en-US", {
                                style: "currency",
                                currency: "USD",
                                notation: "compact",
                                maximumFractionDigits: 1,
                              }).format(value)
                            }
                          />

                          <Tooltip content={<CustomTooltip />} />

                          <ReferenceLine y={0} stroke="#6B7280" strokeWidth={1.5} strokeDasharray="3 3" />

                          {/* Highlight break-even area */}
                          {breakEvenYear && breakEvenYear <= Number.parseInt(activeTimeframe) && (
                            <ReferenceArea
                              x1={breakEvenYear - 1}
                              x2={breakEvenYear}
                              y1={yDomain[0]}
                              y2={0}
                              fill="#22C55E"
                              fillOpacity={0.1}
                              stroke="#22C55E"
                              strokeOpacity={0.3}
                              strokeDasharray="3 3"
                            >
                              <Label value="Break-even" position="insideTopRight" fill="#22C55E" fontSize={12} />
                            </ReferenceArea>
                          )}

                          {/* Area and line for cashflow */}
                          <Area
                            type="monotone"
                            dataKey="cashflow"
                            fill="url(#colorCashflow)"
                            fillOpacity={0.3}
                            stroke="none"
                          />

                          <Line
                            type="monotone"
                            dataKey="cashflow"
                            name="Savings"
                            stroke="url(#lineGradient)"
                            strokeWidth={3}
                            dot={false}
                            activeDot={{
                              r: 6,
                              stroke: "#3B82F6",
                              strokeWidth: 2,
                              fill: "white",
                            }}
                          />
                        </ComposedChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-muted-foreground">No data available</p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="mt-6 text-center text-sm text-muted-foreground"
        >
          <p>
            Projections based on current utility rates with {proposalData.escalation || "0"}% annual escalation. Actual
            savings may vary based on energy usage and future utility rates.
          </p>
        </motion.div>
      </div>
    </section>
  )
}

