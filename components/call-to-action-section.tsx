"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function CallToActionSection() {
  return (
    <section className="py-20 sky-gradient">
      <div className="container mx-auto px-4 text-center">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl font-normal leading-tight leading-tight mb-8 accent-text"
        >
          Ready to Embrace the Future of Energy?
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-xl mb-12 text-muted-foreground max-w-3xl mx-auto"
        >
          Join thousands of homeowners who have already made the switch to
          clean, renewable solar energy. Your journey to energy independence
          starts here.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Button
            size="lg"
            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
          >
            Schedule Your Free Consultation
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
