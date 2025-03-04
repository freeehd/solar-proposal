"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Droplet, TreePine } from "lucide-react";
import { motion } from "framer-motion";

export default function EnvironmentalImpactSection() {
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
          Your Decision Matters
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-xl mb-12 text-center text-muted-foreground max-w-3xl mx-auto"
        >
          Going solar is good for your wallet and the planet. Install solar
          panels and save as much CO2 as:
        </motion.p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-card/50 backdrop-blur border-primary/10">
              <CardContent className="flex flex-col items-center justify-center p-8">
                <Droplet className="w-16 h-16 mb-4 text-primary" />
                <p className="text-5xl font-normal leading-tight leading-tight mb-2 text-primary">
                  390
                </p>
                <p className="text-2xl text-muted-foreground">barrels of oil</p>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-card/50 backdrop-blur border-primary/10">
              <CardContent className="flex flex-col items-center justify-center p-8">
                <TreePine className="w-16 h-16 mb-4 text-primary" />
                <p className="text-5xl font-normal leading-tight leading-tight mb-2 text-primary">
                  4,305
                </p>
                <p className="text-2xl text-muted-foreground">trees planted</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
