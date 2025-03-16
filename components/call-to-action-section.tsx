"use client"

import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { motion, useInView } from "framer-motion"
import { ArrowRight, Sun } from "lucide-react"
import { useMediaQuery } from "@/hooks/use-media-query"

// Simplified list of key benefits - reduced from 15 to 3 core benefits
const keyBenefits = [
  "Save $1,500/year on electricity",
  "Increase home value by $15,000+",
  "25-year warranty & premium support",
]

export default function EnhancedCallToAction() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const isMobile = useMediaQuery("(max-width: 640px)")

  const isInView = useInView(sectionRef, {
    once: true,
    amount: 0.3,
  })

  return (
    <section ref={sectionRef} className="relative py-16 md:py-24 bg-gradient-to-b from-sky-50 to-white overflow-hidden">
      {/* Simple background elements instead of complex grid */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-yellow-100 opacity-60 blur-3xl" />
        <div className="absolute top-1/4 -left-24 w-72 h-72 rounded-full bg-blue-100 opacity-60 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full bg-indigo-100 opacity-50 blur-3xl" />
      </div>

      <div className="container relative mx-auto px-4 z-10">
        <div className="w-full max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8 }}
            className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 md:p-12 border border-white/20"
          >
            <div className="text-center mb-8 md:mb-10">
              {/* Simplified sun icon with reduced animation */}
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <Sun className="h-14 w-14 md:h-16 md:w-16 text-yellow-400" />
                  <motion.div
                    className="absolute inset-0 rounded-full bg-yellow-400/20"
                    animate={{
                      scale: [1, 1.3, 1],
                      opacity: [0.5, 0, 0.5],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Number.POSITIVE_INFINITY,
                      repeatType: "loop",
                    }}
                  />
                </div>
              </div>

              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-900">Your Solar Journey Starts Today</h2>

              <p className="text-base md:text-lg text-slate-600 max-w-xl mx-auto">
                Join thousands of homeowners who have already made the switch to clean, renewable energy.
              </p>
            </div>

            {/* Simplified benefits list */}
            <div className="mb-8 space-y-3">
              {keyBenefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
                  transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                  className="flex items-center"
                >
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                    <svg className="w-3.5 h-3.5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="ml-3 text-slate-700">{benefit}</span>
                </motion.div>
              ))}
            </div>

            {/* Simplified CTA button */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="flex justify-center"
            >
              <Button
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 h-auto w-full md:w-auto md:min-w-[240px] rounded-lg"
              >
                Schedule Your Installation
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              className="text-center mt-6 text-sm text-slate-500"
            >
              Limited time offer: Lock in current incentives before they expire.
            </motion.p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

