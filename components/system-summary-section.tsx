"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"

interface SystemSummarySectionProps {
  proposalData: {
    solar_system_model?: string
    solar_system_quantity?: string
    solar_system_price?: string
    storage_system_model?: string
    storage_system_quantity?: string
    storage_system_price?: string
    incentives?: string
  }
}

export default function SystemSummarySection({
  proposalData = {
    solar_system_model: "",
    solar_system_quantity: "0",
    solar_system_price: "0",
    storage_system_model: "",
    storage_system_quantity: "0",
    storage_system_price: "0",
    incentives: "0",
  },
}: SystemSummarySectionProps) {
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  // Format currency for display
  const formatCurrency = (value = "0") => {
    if (!value) return "$0"

    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(Number.parseFloat(value.replace(/,/g, "")))
  }

  return (
    <section className="py-20 sky-gradient">
      <div className="container mx-auto px-4">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl font-normal leading-tight mb-12 text-center accent-text"
        >
          System Summary
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.1 }}>
            <Card className="bg-card/50 backdrop-blur border-primary/10">
              <CardHeader>
                <CardTitle>Solar System</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Model:</p>
                    <p className="text-xl font-normal leading-tight text-primary">
                      {proposalData.solar_system_model || "Not specified"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Quantity:</p>
                    <p className="text-xl font-normal leading-tight text-primary">
                      {proposalData.solar_system_quantity || "0"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Price:</p>
                    <p className="text-xl font-normal leading-tight text-primary">
                      {formatCurrency(proposalData.solar_system_price)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.2 }}>
            <Card className="bg-card/50 backdrop-blur border-primary/10">
              <CardHeader>
                <CardTitle>Storage System</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Model:</p>
                    <p className="text-xl font-normal leading-tight text-primary">
                      {proposalData.storage_system_model || "Not specified"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Quantity:</p>
                    <p className="text-xl font-normal leading-tight text-primary">
                      {proposalData.storage_system_quantity || "0"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Price:</p>
                    <p className="text-xl font-normal leading-tight text-primary">
                      {formatCurrency(proposalData.storage_system_price)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
        <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.3 }}>
          <Card className="bg-card/50 backdrop-blur border-primary/10">
            <CardHeader>
              <CardTitle>Incentives</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-normal leading-tight text-center text-primary">
                {formatCurrency(proposalData.incentives)}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  )
}

