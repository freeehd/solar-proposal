"use client";

import Image from "next/image";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Battery, Zap, Sun, Percent } from "lucide-react";
import { motion } from "framer-motion";
import { Corner } from "@radix-ui/react-scroll-area";

interface StorageSectionProps {
  proposalData: {
    batteryName: string;
    inverterName: string;
    capacity: string;
    outputKW: string;
    operatingMode: string;
    backupAllocation: string;
    batteryImage: string;
    essentialsDays: string;
    appliancesDays: string;
    wholeHomeDays: string;
  };
}

export default function StorageSection({ proposalData }: StorageSectionProps) {
  console.log(
    "StorageSection proposalData:",
    JSON.stringify(proposalData, null, 2)
  );
  console.log("StorageSection proposalData:", proposalData);
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
          Your Storage Setup
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-card/50 backdrop-blur border-primary/10">
              <CardHeader>
                <CardTitle>{proposalData.batteryName}</CardTitle>
                <CardDescription>{proposalData.inverterName}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <Battery className="w-12 h-12 mx-auto mb-2 text-primary" />
                    <p className="text-sm text-muted-foreground">Capacity</p>
                    <p className="text-xl font-normal leading-tight leading-tight text-primary">
                      {proposalData.capacity} kWh
                    </p>
                  </div>
                  <div className="text-center">
                    <Zap className="w-12 h-12 mx-auto mb-2 text-primary" />
                    <p className="text-sm text-muted-foreground">Output</p>
                    <p className="text-xl font-normal leading-tight leading-tight text-primary">
                      {proposalData.outputKW} kW
                    </p>
                  </div>
                  <div className="text-center">
                    <Sun className="w-12 h-12 mx-auto mb-2 text-primary" />
                    <p className="text-sm text-muted-foreground">
                      Operating Mode
                    </p>
                    <p className="text-xl font-normal leading-tight leading-tight text-primary">
                      {proposalData.operatingMode}
                    </p>
                  </div>
                  <div className="text-center">
                    <Percent className="w-12 h-12 mx-auto mb-2 text-primary" />
                    <p className="text-sm text-muted-foreground">
                      Backup Allocation
                    </p>
                    <p className="text-xl font-normal leading-tight leading-tight text-primary">
                      {proposalData.backupAllocation}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative w-full h-[400px] sky-gradient rounded-lg overflow-hidden shadow-lg"
          >
            {/* <Image
              src={
                proposalData.batteryImage &&
                proposalData.batteryImage !== "/Batteries/3.jpeg"
                  ? proposalData.batteryImage
                  : "/Batteries/3.jpeg"
              } */}
            <Image
              src={"/Batteries/3.jpeg?height=600&width=800"}
              alt={proposalData.batteryName || "Battery"}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </motion.div>
        </div>
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          {["Essentials", "Appliances", "Whole Home"].map((title, index) => (
            <motion.div
              key={title}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.3 + index * 0.1 }}
            >
              <Card className="bg-card/50 backdrop-blur border-primary/10">
                <CardHeader>
                  <CardTitle className="text-center">{title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-normal leading-tight leading-tight text-center text-primary">
                    {
                      proposalData[
                        `${title
                          .toLowerCase()
                          .replace(" ", "")}Days` as keyof typeof proposalData
                      ]
                    }{" "}
                    days
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
