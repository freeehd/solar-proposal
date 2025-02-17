"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import { Star, Award, MapPin, ThumbsUp } from "lucide-react"
import React from "react"

export default function WhySunStudios() {
  const reasons: Array<{
    type?: "image"
    image?: string
    icon?: React.ElementType
    text: string
  }> = [
    {
      type: "image",
      image: "/bbb.png",
      text: "Accredited by Better Business Bureau",
    },
    { icon: Star, text: "5 star rating on Google" },
    { icon: Award, text: "5 star rating on Consumer Affairs" },
    { icon: MapPin, text: "The best solar in 36 states" },
    { icon: ThumbsUp, text: "Only solar company that offers customer satisfaction guarantee" },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { x: -20, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10,
      },
    },
  }

  return (
      <section className="relative py-52 bg-white overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,165,0,0.1),transparent_70%)]" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row items-start justify-between max-w-7xl mx-auto">
            <div className="md:w-1/2 lg:w-4/5 mb-16 md:mb-0 pr-10">
              <div className="mb-12">
                <Image src="/icon.png" alt="Sun Studios Logo" width={400} height={80} className="mb-12" />
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-5xl font-extrabold mb-10 text-gray-800"
                >
                  Why Choose Sun Studios?
                </motion.h2>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="text-xl leading-relaxed text-gray-600"
                >
                  Sun Studios is a leading provider of solar energy solutions, committed to powering a sustainable future.
                  With our innovative technology and expert team, we're transforming how homes and businesses harness the
                  sun's energy.
                </motion.p>
              </div>
            </div>
            <motion.div
                className="md:w-1/2 lg:w-3/5 pl-16"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
              <ul className="space-y-8">
                {reasons.map((reason, index) => (
                    <motion.li key={index} className="flex items-center gap-8" variants={itemVariants}>
                      {reason.type === "image" ? (
                          <div className="flex-shrink-0">
                            <Image
                                src={reason.image || "/placeholder.svg"}
                                alt="BBB Accredited Business Seal"
                                width={50}
                                height={74}
                                className="object-contain"
                            />
                          </div>
                      ) : reason.icon ? (
                          <div className="flex-shrink-0 w-[50px] h-[50px] flex items-center justify-center">
                            {React.createElement(reason.icon, { className: "w-10 h-10 text-orange-500" })}
                          </div>
                      ) : null}
                      <span className="text-xl text-gray-700">{reason.text}</span>
                    </motion.li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>
  )
}

