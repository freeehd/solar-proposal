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
import { ArrowRight, TrendingUp, DollarSign, Percent, Calendar, CreditCard } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import type { EnabledFinanceFields } from "@/hooks/use-proposal-data"
import Image from "next/image"

interface FinancingSectionProps {
  proposalData: {
    payback_period?: string
    total_system_cost?: string
    lifetime_savings?: string
    net_cost?: string
    monthly_bill?: string
    escalation?: string
    // New financial fields
    financing_type?: string
    apr?: string
    duration?: string
    down_payment?: string
    financed_amount?: string
    monthly_payments?: string
    solar_rate?: string
    escalation_rate?: string
    year1_monthly_payments?: string
    enabled_finance_fields?: EnabledFinanceFields
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

  // Get enabled finance fields with defaults
  const enabledFields = proposalData.enabled_finance_fields || {
    financingType: true,
    paybackPeriod: true,
    totalSystemCost: true,
    lifetimeSavings: true,
    netCost: true,
    apr: false,
    duration: false,
    downPayment: false,
    financedAmount: false,
    monthlyPayments: false,
    solarRate: false,
    escalationRate: false,
    year1MonthlyPayments: false,
  }

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

  // Get financing type display name and logo
  const getFinancingTypeInfo = (type?: string) => {
    if (!type) return { name: "Cash Purchase", logo: null }

    switch (type) {
      case "Sungage":
        return {
          name: "Sungage Loan",
          logo: "/public/icons/sungage.png",
        }
      case "GoodLeap":
        return {
          name: "GoodLeap Financing",
          logo: "/public/icons/goodleap.png",
        }
      case "LightReach":
        return {
          name: `Light Reach Predictable PPA - ${proposalData.escalation_rate || 0}%`,
          logo: "/public/icons/lightreach.png",
        }
      case "Aurora Custom Financing":
        return { name: "Aurora Custom Financing", logo: null }
      case "Cash":
        return { name: "Cash Purchase", logo: null }
      default:
        return { name: type, logo: null }
    }
  }

  const financingInfo = getFinancingTypeInfo(proposalData.financing_type)

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

        {/* Overview Section */}
       

        {/* Financing Type Badge */}
        {enabledFields.financingType && proposalData.financing_type && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex justify-center mb-8"
          >
            <Badge variant="outline" className="px-4 py-2 text-base bg-primary/10 border-primary/20">
              {financingInfo.logo ? (
                <div className="flex items-center gap-2">
                  <div className="relative w-6 h-6 mr-2">
                    <Image
                      src={financingInfo.logo.replace("/public", "") || "/placeholder.svg"}
                      alt={financingInfo.name}
                      width={24}
                      height={24}
                      className="object-contain"
                    />
                  </div>
                  {financingInfo.name}
                </div>
              ) : (
                <>
                  <CreditCard className="h-4 w-4 mr-2" />
                  {financingInfo.name}
                </>
              )}
            </Badge>
          </motion.div>
        )}

        {/* Financing Details Section */}
        <div className="mt-16">
      

          <motion.div variants={cardVariants} initial="hidden" animate="visible">
            {/* Single Financial Details Card */}
            <Card className="bg-card/50 backdrop-blur border-primary/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {financingInfo.logo ? (
                    <div className="relative w-5 h-5">
                      <Image
                        src={financingInfo.logo.replace("/public", "") || "/placeholder.svg"}
                        alt={financingInfo.name}
                        width={20}
                        height={20}
                        className="object-contain"
                      />
                    </div>
                  ) : (
                    <CreditCard className="h-5 w-5" />
                  )}
                  Financial Details
                </CardTitle>
                <CardDescription>Complete financial information for your solar investment</CardDescription>
              </CardHeader>

              <CardContent>
                {/* Calculate how many sections are visible */}
                {(() => {
                  const hasSystemCosts =
                    (enabledFields.totalSystemCost && proposalData.total_system_cost) ||
                    (enabledFields.netCost && proposalData.net_cost)

                  const hasFinancing =
                    (enabledFields.financingType && proposalData.financing_type) ||
                    (proposalData.financing_type !== "Cash" &&
                      ((enabledFields.apr && proposalData.apr) ||
                        (enabledFields.duration && proposalData.duration) ||
                        (enabledFields.downPayment && proposalData.down_payment) ||
                        (enabledFields.financedAmount && proposalData.financed_amount) ||
                        (enabledFields.monthlyPayments && proposalData.monthly_payments)))

                  const hasSavings =
                    (enabledFields.solarRate && proposalData.solar_rate) ||
                    (enabledFields.escalationRate && proposalData.escalation_rate) ||
                    (enabledFields.year1MonthlyPayments && proposalData.year1_monthly_payments) ||
                    (enabledFields.paybackPeriod && proposalData.payback_period) ||
                    (enabledFields.lifetimeSavings && proposalData.lifetime_savings)

                  const visibleSections = [hasSystemCosts, hasFinancing, hasSavings].filter(Boolean).length

                  // Determine grid columns based on visible sections
                  const gridCols =
                    visibleSections === 1
                      ? "md:grid-cols-1"
                      : visibleSections === 2
                        ? "md:grid-cols-2"
                        : "md:grid-cols-3"

                  return (
                    <div className={`grid grid-cols-1 ${gridCols} gap-6`}>
                      {/* System Costs Column - Only show if at least one field is enabled */}
                      {hasSystemCosts && (
                        <div className="space-y-4">
                          <h4 className="font-medium text-primary">System Costs</h4>
                          <div className="space-y-3">
                            {enabledFields.totalSystemCost && proposalData.total_system_cost && (
                              <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Total System Cost</p>
                                <p className="text-lg font-medium">{formatCurrency(proposalData.total_system_cost)}</p>
                              </div>
                            )}

                            {enabledFields.netCost && proposalData.net_cost && (
                              <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Net System Cost</p>
                                <p className="text-lg font-medium">{formatCurrency(proposalData.net_cost)}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Financing Details Column - Only show if at least one field is enabled */}
                      {hasFinancing && (
                        <div className="space-y-4">
                          <h4 className="font-medium text-primary">Financing</h4>
                          <div className="space-y-3">
                            {enabledFields.financingType && proposalData.financing_type && (
                              <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Financing Type</p>
                                <p className="text-lg font-medium">{financingInfo.name}</p>
                              </div>
                            )}

                            {/* Only show these fields for non-cash purchases */}
                            {proposalData.financing_type !== "Cash" && (
                              <>
                                {enabledFields.apr && proposalData.apr && (
                                  <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground">Annual Percentage Rate (APR)</p>
                                    <p className="text-lg font-medium">{proposalData.apr}%</p>
                                  </div>
                                )}

                                {enabledFields.duration && proposalData.duration && (
                                  <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground">Loan Term</p>
                                    <p className="text-lg font-medium">{proposalData.duration} years</p>
                                  </div>
                                )}

                                {enabledFields.downPayment && proposalData.down_payment && (
                                  <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground">Down Payment</p>
                                    <p className="text-lg font-medium">{formatCurrency(proposalData.down_payment)}</p>
                                  </div>
                                )}

                                {enabledFields.financedAmount && proposalData.financed_amount && (
                                  <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground">Financed Amount</p>
                                    <p className="text-lg font-medium">
                                      {formatCurrency(proposalData.financed_amount)}
                                    </p>
                                  </div>
                                )}

                                {enabledFields.monthlyPayments && proposalData.monthly_payments && (
                                  <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground">Monthly Payments</p>
                                    <p className="text-lg font-medium">
                                      {formatCurrency(proposalData.monthly_payments)}/month
                                    </p>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Savings Column - Only show if at least one field is enabled */}
                      {hasSavings && (
                        <div className="space-y-4">
                          <h4 className="font-medium text-primary">Savings & Benefits</h4>
                          <div className="space-y-3">
                            {enabledFields.solarRate && proposalData.solar_rate && (
                              <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Solar Rate</p>
                                <p className="text-lg font-medium">${proposalData.solar_rate}/kWh</p>
                              </div>
                            )}

                            {enabledFields.escalationRate && proposalData.escalation_rate && (
                              <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Escalation Rate</p>
                                <p className="text-lg font-medium">{proposalData.escalation_rate}% per year</p>
                              </div>
                            )}

                            {enabledFields.year1MonthlyPayments && proposalData.year1_monthly_payments && (
                              <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Year 1 Monthly Payments</p>
                                <p className="text-lg font-medium">
                                  {formatCurrency(proposalData.year1_monthly_payments)}/month
                                </p>
                              </div>
                            )}

                            {enabledFields.paybackPeriod && proposalData.payback_period && (
                              <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Payback Period</p>
                                <p className="text-lg font-medium">{proposalData.payback_period} years</p>
                              </div>
                            )}

                            {enabledFields.lifetimeSavings && proposalData.lifetime_savings && (
                              <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Lifetime Savings</p>
                                <p className="text-lg font-medium">{formatCurrency(proposalData.lifetime_savings)}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })()}

                {/* ROI Information */}
                <Separator className="my-6" />
                {/* <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-600">
                      30-Year ROI: <span className="font-bold">{Math.round(roi)}%</span>
                    </span>
                  </div>
                </div> */}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="mt-10 text-center text-sm text-muted-foreground"
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

