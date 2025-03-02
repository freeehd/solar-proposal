"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { DollarSign, Lightbulb, Zap, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

interface EnergyUsageSectionProps {
  proposalData: {
    monthlyBill: string;
    averageRateKWh: string;
    escalation: string;
    energyData: string;
  };
}

interface ChartData {
  month: string;
  usage: number;
  production: number;
}

export default function EnergyUsageSection({
  proposalData,
}: EnergyUsageSectionProps) {
  const [utilityData, setUtilityData] = useState<
    Array<{ year: number; amount: number }>
  >([]);
  const [totalPayments, setTotalPayments] = useState(0);
  const [finalMonthlyPayment, setFinalMonthlyPayment] = useState(0);
  const [data, setData] = useState<ChartData[]>([]);

  useEffect(() => {
    if (!proposalData) {
      console.error("proposalData is undefined or null");
      return;
    }

    try {
      const monthlyBill = Number.parseFloat(proposalData.monthlyBill || "0");
      const escalation = Number.parseFloat(proposalData.escalation || "0");

      if (isNaN(monthlyBill) || isNaN(escalation)) {
        throw new Error("Invalid monthlyBill or escalation value");
      }

      const newUtilityData = Array.from({ length: 30 }, (_, i) => ({
        year: i + 1,
        amount: Number(
          (monthlyBill * Math.pow(1 + escalation / 100, i)).toFixed(2)
        ),
      }));

      setUtilityData(newUtilityData);

      const newTotalPayments = newUtilityData.reduce(
        (sum, year) => sum + year.amount * 12,
        0
      );
      setTotalPayments(newTotalPayments);

      setFinalMonthlyPayment(newUtilityData[newUtilityData.length - 1].amount);
    } catch (error) {
      console.error("Error calculating utility data:", error);
      setUtilityData([]);
      setTotalPayments(0);
      setFinalMonthlyPayment(0);
    }
  }, [proposalData]);

  useEffect(() => {
    if (proposalData.energyData) {
      const lines = proposalData.energyData.trim().split("\n");
      if (lines.length === 3) {
        const months = lines[0].split("\t").filter((item) => item.trim());
        const usage = lines[1]
          .split("\t")
          .filter((item) => item.trim())
          .slice(1)
          .map((v) => Number.parseFloat(v.replace(",", "")));
        const production = lines[2]
          .split("\t")
          .filter((item) => item.trim())
          .slice(1)
          .map((v) => Number.parseFloat(v.replace(",", "")));

        const chartData = months.map((month, index) => ({
          month,
          usage: usage[index],
          production: production[index],
        }));

        setData(chartData);
      }
    }
  }, [proposalData.energyData]);

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <section className="relative z-10 py-20 sky-gradient">
      <div className="container mx-auto px-4">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl font-normal leading-tight mb-12 text-center accent-text"
        >
          Your Energy Usage
        </motion.h2>
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="bg-card/50 backdrop-blur border-primary/10">
            <CardHeader>
              <CardTitle className="text-2xl font-normal leading-tight leading-tight text-center">
                Energy Cost Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="flex flex-col items-center">
                  <DollarSign className="w-8 h-8 mb-2 text-primary" />
                  <p className="text-sm text-muted-foreground">
                    Current Monthly Bill
                  </p>
                  <p className="text-2xl font-normal leading-tight leading-tight text-primary">
                    ${Number(proposalData.monthlyBill || 0).toFixed(2)}
                  </p>
                </div>
                <div className="flex flex-col items-center">
                  <TrendingUp className="w-8 h-8 mb-2 text-primary" />
                  <p className="text-sm text-muted-foreground">
                    Estimated in 30 years
                  </p>
                  <p className="text-2xl font-normal leading-tight leading-tight text-primary">
                    ${finalMonthlyPayment.toFixed(2)}
                  </p>
                </div>
                <div className="flex flex-col items-center">
                  <Lightbulb className="w-8 h-8 mb-2 text-primary" />
                  <p className="text-sm text-muted-foreground">
                    Total payments after 30 years
                  </p>
                  <p className="text-2xl font-normal leading-tight leading-tight text-primary">
                    ${totalPayments.toFixed(2)}
                  </p>
                </div>
                <div className="flex flex-col items-center">
                  <Zap className="w-8 h-8 mb-2 text-primary" />
                  <p className="text-sm text-muted-foreground">
                    Average Rate/kWh
                  </p>
                  <p className="text-2xl font-normal leading-tight leading-tight text-primary">
                    ${proposalData.averageRateKWh || "0"}/kWh
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-12"
        >
          <Card className="bg-card/50 backdrop-blur border-primary/10">
            <CardHeader>
              <CardTitle>Monthly Utility Costs Over 30 Years</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] w-full">
                {utilityData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={utilityData}
                      margin={{ top: 10, right: 10, bottom: 20, left: 40 }}
                      barSize={12}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
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
                      <Bar
                        dataKey="amount"
                        fill="hsl(var(--primary))"
                        radius={[4, 4, 0, 0]}
                      />
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
          className="mt-12"
        >
          <Card className="bg-card/50 backdrop-blur border-primary/10">
            <CardHeader>
              <CardTitle>Energy Usage vs. New System Production</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] w-full">
                {data.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={data}
                      margin={{ top: 20, right: 20, bottom: 40, left: 40 }}
                      barGap={0}
                      barSize={20}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#e0e0e0"
                      />
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
                      />
                      <Tooltip
                        formatter={(value) => `${value} kWh`}
                        labelFormatter={(label) => `Month: ${label}`}
                      />
                      <Legend />
                      <Bar
                        name="Energy Usage"
                        dataKey="usage"
                        fill="#FF6B4A"
                        radius={[0, 0, 0, 0]}
                      />
                      <Bar
                        name="New System Production"
                        dataKey="production"
                        fill="#FFB84D"
                        radius={[0, 0, 0, 0]}
                      />
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
      </div>
    </section>
  );
}
