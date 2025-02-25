"use client";

import type React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sun, Zap, BarChart2, Thermometer, Shield } from "lucide-react";
import { motion } from "framer-motion";
import { useRef } from "react";
import { cn } from "@/lib/utils";
import { AnimatedLightning } from "@/components/ui/animated-lightning";

// Circle component for wrapping icons
const Circle = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => {
  return (
    <motion.div
      className={cn("relative flex items-center justify-center", className)}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
    >
      {children}
    </motion.div>
  );
};

const CircularProgress = ({ percentage }: { percentage: number }) => {
  const circumference = 2 * Math.PI * 60;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative w-48 h-48 flex items-center justify-center">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 140 140">
        <defs>
          <linearGradient
            id="progressGradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#22c55e" />
            <stop offset="100%" stopColor="#15803d" />
          </linearGradient>
        </defs>
        <circle
          className="text-gray-200"
          strokeWidth="8"
          stroke="currentColor"
          fill="none"
          r="60"
          cx="70"
          cy="70"
        />
        <circle
          stroke="url(#progressGradient)"
          strokeWidth="8"
          strokeLinecap="round"
          fill="none"
          r="60"
          cx="70"
          cy="70"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold text-green-600">{percentage}%</span>
        <span className="text-sm text-gray-600 font-medium">Energy Offset</span>
      </div>
    </div>
  );
};

interface SolarDesignSectionProps {
  proposalData: {
    numberOfSolarPanels?: string;
    yearlyEnergyProduced?: string;
    yearlyEnergyUsage?: string;
    energyOffset?: string;
    solarPanelDesign?: string;
    solarPanelSize?: string;
    lifetimeSavings?: string;
  };
}

export default function SolarDesignSection({
  proposalData,
}: SolarDesignSectionProps) {
  const energyOffset = Number.parseInt(proposalData.energyOffset || "0", 10);

  // Refs for the icons
  const icon1Ref = useRef<HTMLDivElement>(null);
  const icon2Ref = useRef<HTMLDivElement>(null);
  const icon3Ref = useRef<HTMLDivElement>(null);
  const icon4Ref = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Animation variants for sequential appearance
  const iconVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: { scale: 1, opacity: 1 },
  };

  return (
    <section className="relative z-10 py-20 sky-gradient">
      <div className="container mx-auto px-4 relative sky-gradient">
        {/* ... rest of the header content ... */}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start pb-10">
          {/* ... image content ... */}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="col-span-1 md:col-span-2"
          >
            <Card className="bg-card/50 h-[370px] backdrop-blur border-primary/10">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-center">
                  Solar System Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className="grid grid-cols-2 md:grid-cols-4 gap-6 items-center justify-items-center relative"
                  ref={containerRef}
                >
                  <div className="text-center" ref={icon1Ref}>
                    <motion.div
                      variants={iconVariants}
                      initial="hidden"
                      animate="visible"
                      transition={{ delay: 0, duration: 0.8 }}
                    >
                      <BarChart2 className="w-24 h-24 mx-auto mb-2 text-primary" />
                      <p className="text-sm text-muted-foreground">
                        System Size
                      </p>
                      <p className="text-2xl font-bold text-primary">
                        {proposalData.solarPanelSize || "0"} kW
                      </p>
                    </motion.div>
                  </div>

                  <div className="text-center" ref={icon2Ref}>
                    <motion.div
                      variants={iconVariants}
                      initial="hidden"
                      animate="visible"
                      transition={{ delay: 2, duration: 0.8 }}
                    >
                      <Sun className="w-24 h-24 mx-auto mb-2 text-primary" />
                      <p className="text-sm text-muted-foreground">
                        Solar Panels
                      </p>
                      <p className="text-2xl font-bold text-primary">
                        {proposalData.numberOfSolarPanels || "0"}
                      </p>
                    </motion.div>
                  </div>

                  <div className="text-center" ref={icon3Ref}>
                    <motion.div
                      variants={iconVariants}
                      initial="hidden"
                      animate="visible"
                      transition={{ delay: 4, duration: 0.8 }}
                    >
                      <Zap className="w-24 h-24 mx-auto mb-2 text-primary" />
                      <p className="text-sm text-muted-foreground">
                        Annual Consumption
                      </p>
                      <p className="text-2xl font-bold text-primary">
                        {proposalData.yearlyEnergyUsage || "0"} kWh
                      </p>
                    </motion.div>
                  </div>

                  <div className="text-center" ref={icon4Ref}>
                    <motion.div
                      variants={iconVariants}
                      initial="hidden"
                      animate="visible"
                      transition={{ delay: 6, duration: 0.8 }}
                    >
                      <Zap className="w-24 h-24 mx-auto mb-2 text-primary" />
                      <p className="text-sm text-muted-foreground">
                        Annual Production
                      </p>
                      <p className="text-2xl font-bold text-primary">
                        {proposalData.yearlyEnergyProduced || "0"} kWh
                      </p>
                    </motion.div>
                  </div>

                  {/* Animated Beams */}
                  <AnimatedLightning
                    containerRef={containerRef}
                    fromRef={icon1Ref}
                    toRef={icon2Ref}
                    duration={2}
                    delay={0.8}
                    uniqueId="beam1"
                  />

                  <AnimatedLightning
                    containerRef={containerRef}
                    fromRef={icon2Ref}
                    toRef={icon3Ref}
                    duration={2}
                    delay={2.8}
                    uniqueId="beam2"
                  />

                  <AnimatedLightning
                    containerRef={containerRef}
                    fromRef={icon3Ref}
                    toRef={icon4Ref}
                    duration={2}
                    delay={4.8}
                    uniqueId="beam3"
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card className="bg-card/50 backdrop-blur border-primary/10">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-center">
                  Energy Offset & Savings
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <CircularProgress percentage={energyOffset} />
                <div className="mt-6 text-center">
                  <p className="text-sm text-muted-foreground">
                    Lifetime Savings
                  </p>
                  <p className="text-2xl font-bold text-primary">
                    $
                    {Number(proposalData.lifetimeSavings || 0).toLocaleString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-12"
        >
          <Card className="bg-card/50 backdrop-blur border-primary/10">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center">
                Advanced Solar Technology
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center mb-6">
                Our solar panels use advanced photovoltaic technology to convert
                sunlight into electricity. They are designed to withstand
                various weather conditions and have an expected lifespan of
                25-30 years.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex flex-col items-center text-center">
                  <BarChart2 className="w-24 h-24 mb-2 text-primary" />
                  <p className="font-semibold">Panel Efficiency</p>
                  <p className="text-lg text-primary">20-22%</p>
                </div>
                <div className="flex flex-col items-center text-center">
                  <Thermometer className="w-24 h-24 mb-2 text-primary" />
                  <p className="font-semibold">Temperature Coefficient</p>
                  <p className="text-lg text-primary">-0.35% / °C</p>
                </div>
                <div className="flex flex-col items-center text-center">
                  <Shield className="w-24 h-24 mb-2 text-primary" />
                  <p className="font-semibold">Warranty</p>
                  <p className="text-lg text-primary">25 years performance</p>
                  <p className="text-lg text-primary">10 years product</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
