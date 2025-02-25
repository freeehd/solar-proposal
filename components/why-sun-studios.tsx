"use client";

import { motion, useInView, AnimatePresence } from "framer-motion";
import { StarAnimation } from "./ui/star-animation";
import { useRef, useState } from "react";
import { Particles } from "./ui/particles";

export default function WhySunStudios() {
  const reasons = [
    {
      text: "Accredited by Better Business Bureau",
    },
    { text: "5 star rating on Google" },
    { text: "5 star rating on Consumer Affairs" },
    { text: "The best solar in 36 states" },
    {
      text: "Only solar company that offers customer satisfaction guarantee",
    },
  ];

  const [completedAnimations, setCompletedAnimations] = useState(new Set());
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  const handleStarComplete = (index: unknown) => {
    setCompletedAnimations((prev) => {
      const newSet = new Set(prev);
      newSet.add(index);
      return newSet;
    });
  };

  return (
    <section className="relative min-h-screen py-32 overflow-hidden bg-white">
      <Particles />
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col md:flex-row items-start justify-between max-w-7xl mx-auto">
          <div className="md:w-1/2 lg:w-4/5 mb-16 md:mb-0 pr-10">
            <div className="mb-12 max-w-2xl sticky top-32">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.8,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="text-4xl md:text-5xl lg:text-7xl font-normal tracking-tight text-black mb-8"
                >
                  Why Choose{" "}
                  <span className="font-medium">
                    Sun Studios
                    <motion.span
                      className="absolute -bottom-1 left-0 w-full h-px bg-black/20"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: 0.8, delay: 0.5 }}
                    />
                  </span>
                  ?
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="text-xl leading-relaxed text-black/60"
                >
                  Sun Studios is a leading provider of solar energy solutions,
                  committed to powering a sustainable future. With our
                  innovative technology and expert team, we're transforming how
                  homes and businesses harness the sun's energy.
                </motion.p>
              </motion.div>
            </div>
          </div>
          <div className="md:w-1/2 lg:w-3/5 pl-2" ref={containerRef}>
            <ul className="space-y-2">
              <AnimatePresence>
                {reasons.map((reason, index) => {
                  const previousCompleted =
                    index === 0 || completedAnimations.has(index - 1);
                  const shouldAnimate = isInView && previousCompleted;
                  const hasCompleted = completedAnimations.has(index);

                  return (
                    <motion.li
                      key={index}
                      className="flex items-center gap-2 group"
                      initial={{ opacity: 0, y: 40 }}
                      animate={{
                        opacity: previousCompleted ? 1 : 0,
                        y: previousCompleted ? 0 : 40,
                      }}
                      transition={{
                        duration: 0.6,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                    >
                      <div className="flex-shrink-0">
                        {previousCompleted && (
                          <StarAnimation
                            delay={0}
                            onAnimationComplete={() =>
                              handleStarComplete(index)
                            }
                            key={`star-${index}-${shouldAnimate}`}
                          />
                        )}
                      </div>
                      <div className="flex-grow">
                        <motion.div
                          className="relative py-6"
                          initial={{ opacity: 0 }}
                          animate={{
                            opacity: hasCompleted ? 1 : 0,
                          }}
                          transition={{
                            duration: 0.4,
                            ease: "easeOut",
                          }}
                        >
                          <motion.span
                            className="text-xl md:text-2xl font-normal text-black block"
                            initial={{ y: 20, opacity: 0 }}
                            animate={{
                              y: hasCompleted ? 0 : 20,
                              opacity: hasCompleted ? 1 : 0,
                            }}
                            transition={{
                              duration: 0.5,
                              delay: 0.2,
                              ease: [0.22, 1, 0.36, 1],
                            }}
                          >
                            {reason.text}
                          </motion.span>
                          <motion.div
                            className="absolute bottom-0 left-0 h-px bg-black/10 w-full"
                            initial={{ transform: "scaleX(0)", opacity: 0 }}
                            animate={{
                              transform: hasCompleted
                                ? "scaleX(1)"
                                : "scaleX(0)",
                              opacity: hasCompleted ? 1 : 0,
                            }}
                            transition={{
                              duration: 0.8,
                              delay: 0.4,
                              ease: [0.22, 1, 0.36, 1],
                            }}
                          />
                        </motion.div>
                      </div>
                    </motion.li>
                  );
                })}
              </AnimatePresence>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
