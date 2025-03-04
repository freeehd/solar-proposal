"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";

interface SystemSummarySectionProps {
  proposalData: {
    solarSystemModel: string;
    solarSystemQuantity: string;
    solarSystemPrice: string;
    storageSystemModel: string;
    storageSystemQuantity: string;
    storageSystemPrice: string;
    incentives: string;
  };
}

export default function SystemSummarySection({
  proposalData,
}: SystemSummarySectionProps) {
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
          System Summary
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-card/50 backdrop-blur border-primary/10">
              <CardHeader>
                <CardTitle>Solar System</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Model:</p>
                    <p className="text-xl font-normal leading-tight leading-tight text-primary">
                      {proposalData.solarSystemModel}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Quantity:</p>
                    <p className="text-xl font-normal leading-tight leading-tight text-primary">
                      {proposalData.solarSystemQuantity}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Price:</p>
                    <p className="text-xl font-normal leading-tight leading-tight text-primary">
                      ${proposalData.solarSystemPrice}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-card/50 backdrop-blur border-primary/10">
              <CardHeader>
                <CardTitle>Storage System</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Model:</p>
                    <p className="text-xl font-normal leading-tight leading-tight text-primary">
                      {proposalData.storageSystemModel}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Quantity:</p>
                    <p className="text-xl font-normal leading-tight leading-tight text-primary">
                      {proposalData.storageSystemQuantity}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Price:</p>
                    <p className="text-xl font-normal leading-tight leading-tight text-primary">
                      ${proposalData.storageSystemPrice}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-card/50 backdrop-blur border-primary/10">
            <CardHeader>
              <CardTitle>Incentives</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-normal leading-tight leading-tight text-center text-primary">
                ${proposalData.incentives}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
