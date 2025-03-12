"use client"

import { useRef, useMemo } from "react" // Added useMemo
import { Button } from "@/components/ui/button"
import { motion, useInView } from "framer-motion"
import { ArrowRight, Sun } from "lucide-react"
import GridMotion from "@/components/ui/grid-motion" // Assuming GridMotion is in this path
import { useMediaQuery } from "@/hooks/use-media-query"
import React from "react"; // Import React for memo

const benefits = [
  "Save $1,500/yr",
  "25yr Warranty",
  "+$15k Value",
  "Zero Down",
  "Eco-Friendly",
  "Tax Credits",
  "ROI 12-15%",
  "Smart Home",
  "Power Backup",
  "Net Metering",
  "Premium Panels",
  "24/7 Monitor",
  "2.99% APR",
  "Local Rebates",
  "Satisfaction",
];


const gridItems = Array.from({ length: 36 }, (_, index) => {
  const imageIndex = (index % 13) + 1;
  const imagePath = `/grid/${imageIndex}.jpg`;
  const hasOverlay = index < benefits.length;

  return {
    image: imagePath,
    overlay: hasOverlay ? benefits[index] : undefined,
  };
});


const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
      duration: 0.8,
      ease: "easeOut",
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7 },
  },
};


const EnhancedCallToActionComponent = React.memo(function EnhancedCallToAction() { // Wrapped in React.memo
  const sectionRef = useRef<HTMLDivElement>(null);
  const isMobile = useMediaQuery("(max-width: 640px)");

  const isInView = useInView(sectionRef, {
    once: true,
    amount: 0.1,
    margin: "0px 0px 200px 0px",
  });


  // Memoize gridItems as it's derived data and doesn't change every render if benefits array is constant
  const memoizedGridItems = useMemo(() => gridItems, []);


  return (
    <motion.section
      ref={sectionRef}
      initial={{ opacity: 0, y: 60 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }}
      transition={{ duration: 1.2, ease: "easeOut" }}
      className="relative min-h-screen flex items-center justify-center py-10 sm:py-16 md:py-20 overflow-hidden"
    >

      <div className={`transition-opacity duration-1000 ease-in-out ${isInView ? "opacity-100" : "opacity-0"}`}>
        <GridMotion items={memoizedGridItems} gradientColor="rgba(37, 99, 235, 0.3)" opacity={0.8} />
      </div>

      <div className="container relative mx-auto px-4 z-10">
        <div className="w-full max-w-[90%] sm:max-w-lg md:max-w-2xl lg:max-w-4xl mx-auto">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="bg-white/90 backdrop-blur-md rounded-xl sm:rounded-2xl shadow-xl p-6 sm:p-8 md:p-12 border border-white/20"
          >
            <div className="text-center mb-8 sm:mb-12 md:mb-16">
              <motion.div variants={itemVariants} className="flex justify-center mb-6 sm:mb-8">
                <div className="relative">
                  <Sun className="h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 text-yellow-400 animate-pulse" />
                  <motion.div
                    className="absolute inset-0 rounded-full bg-yellow-400/20"
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.5, 0, 0.5],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Number.POSITIVE_INFINITY,
                      repeatType: "loop",
                    }}
                  />
                </div>
              </motion.div>

              <motion.h2
                variants={itemVariants}
                className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light mb-4 sm:mb-6 text-slate-900 tracking-tight"
              >
                Your Solar Journey <span className="font-bold">Starts Today</span>
              </motion.h2>

              <motion.p
                variants={itemVariants}
                className="text-sm sm:text-base md:text-lg text-slate-600 max-w-2xl mx-auto font-light"
              >
                Join thousands of homeowners who have already made the switch to clean, renewable energy and start
                saving immediately.
              </motion.p>
            </div>

            <motion.div variants={itemVariants} className="flex justify-center">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} className="w-full max-w-md">
                <Button
                  size="lg"
                  className="relative overflow-hidden group bg-blue-600 hover:bg-blue-700 text-white text-sm sm:text-base md:text-lg px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-6 h-auto w-full shadow-lg shadow-blue-500/20 rounded-lg sm:rounded-xl"
                >
                  <span className="relative z-10 flex items-center justify-center">
                    Schedule Your installation                    <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 transition-transform group-hover:translate-x-1" />
                  </span>
                </Button>
              </motion.div>
            </motion.div>

            <motion.p
              variants={itemVariants}
              className="text-center mt-6 sm:mt-8 text-xs sm:text-sm text-slate-500 font-light"
            >
              Limited time offer: Lock in current incentives before they expire.
            </motion.p>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
});

EnhancedCallToActionComponent.displayName = "EnhancedCallToAction"; // Set display name for React.memo

export default EnhancedCallToActionComponent;