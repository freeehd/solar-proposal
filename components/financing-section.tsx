"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { motion } from "framer-motion";

interface FinancingSectionProps {
  proposalData: {
    paybackPeriod: string;
    totalSystemCost: string;
    lifetimeSavings: string;
    netCost: string;
    monthlyBill: string;
    escalation: string;
  };
}

export default function FinancingSection({
  proposalData,
}: FinancingSectionProps) {
  const cashflowData = Array.from({ length: 30 }, (_, i) => ({
    year: i + 1,
    cashflow:
      -Number.parseFloat(proposalData.netCost) +
      Number.parseFloat(proposalData.monthlyBill) *
        12 *
        Math.pow(1 + Number.parseFloat(proposalData.escalation) / 100, i),
  }));

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <section className="py-20 sky-gradient">
      <div className="container mx-auto px-4">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl font-normal leading-tight leading-tight mb-12 text-center accent-text"
        >
          Your Financing Option
        </motion.h2>
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-card/50 backdrop-blur border-primary/10 mb-8">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  {
                    label: "Payback period",
                    value: `${proposalData.paybackPeriod} years`,
                  },
                  {
                    label: "Total system cost",
                    value: `$${proposalData.totalSystemCost}`,
                  },
                  {
                    label: "Lifetime savings",
                    value: `$${proposalData.lifetimeSavings}`,
                  },
                  { label: "Net cost", value: `$${proposalData.netCost}` },
                ].map((item, index) => (
                  <div key={item.label}>
                    <p className="text-sm text-muted-foreground">
                      {item.label}
                    </p>
                    <p className="text-2xl font-normal leading-tight leading-tight text-primary">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="bg-card/50 backdrop-blur border-primary/10">
            <CardHeader>
              <CardTitle>Your Cumulative Cashflow</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] w-full">
                {cashflowData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={cashflowData}>
                      <XAxis dataKey="year" stroke="#6B7280" />
                      <YAxis stroke="#6B7280" />
                      <Tooltip
                        contentStyle={{
                          background: "rgba(0, 0, 0, 0.8)",
                          border: "none",
                          borderRadius: "4px",
                        }}
                        labelStyle={{ color: "#fff" }}
                        itemStyle={{ color: "#fff" }}
                      />
                      <Line
                        type="monotone"
                        dataKey="cashflow"
                        stroke="url(#lineGradient)"
                        strokeWidth={3}
                        dot={false}
                      />
                      <defs>
                        <linearGradient
                          id="lineGradient"
                          x1="0"
                          y1="0"
                          x2="1"
                          y2="0"
                        >
                          <stop offset="0%" stopColor="#3B82F6" />
                          <stop offset="100%" stopColor="#8B5CF6" />
                        </linearGradient>
                      </defs>
                    </LineChart>
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
      </div>
    </section>
  );
}
