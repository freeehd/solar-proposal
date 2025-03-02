"use client";

import {
  motion,
  useInView,
  AnimatePresence,
  useScroll,
  useTransform,
} from "framer-motion";
import { StarAnimation } from "./ui/star-animation";
import { useRef, useState } from "react";

const TextReveal = ({ text, delay = 0, className = "" }) => {
  return (
    <span className="inline-block overflow-hidden">
      <motion.span
        className={`inline-block ${className}`}
        initial={{ clipPath: "inset(0 100% 0 0)" }}
        animate={{ clipPath: "inset(0 0% 0 0)" }}
        transition={{
          duration: 0.8,
          delay,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        {text}
      </motion.span>
    </span>
  );
};

const reasons = [
  {
    text: "Accredited by Better Business Bureau",
    description:
      "Our commitment to excellence has earned us accreditation from the Better Business Bureau.",
  },
  {
    text: "5 star rating on Google",
    description:
      "Join thousands of satisfied customers who have rated us 5 stars on Google.",
  },
  {
    text: "5 star rating on Consumer Affairs",
    description:
      "Consistently rated 5 stars by Consumer Affairs for our exceptional service.",
  },
  {
    text: "The best solar in 36 states",
    description:
      "Providing top-quality solar solutions across 36 states nationwide.",
  },
  {
    text: "Only solar company that offers customer satisfaction guarantee",
    description:
      "We stand behind our work with an industry-leading customer satisfaction guarantee.",
  },
];

export default function WhySunStudios() {
  const [completedAnimations, setCompletedAnimations] = useState(new Set());
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  const scale = useTransform(
    scrollYProgress,
    [0, 0.2, 0.8, 1],
    [0.95, 1, 1, 0.95]
  );

  const handleStarComplete = (index) => {
    setCompletedAnimations((prev) => {
      const newSet = new Set(prev);
      newSet.add(index);
      return newSet;
    });
  };

  return (
    <section className="relative min-h-screen py-32 overflow-hidden bg-gradient-to-b from-white to-gray-50/80">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.8),rgba(255,255,255,0))]" />
      <motion.div
        className="container mx-auto px-4 relative z-10"
        style={{ opacity, scale }}
      >
        <div className="flex flex-col md:flex-row items-start justify-between max-w-full mx-auto">
          <div className="md:w-1/2 lg:w-full mb-16 md:mb-0 pr-10 ">
            <div className="mb-12 max-w-4xl sticky top-32 ">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
              >
                <h2 className="text-4xl md:text-5xl lg:text-[5.5rem] font-light  tracking-tight text-gray-900 mb-12 leading-[1.1]">
                  <TextReveal
                    text="Why Choose"
                    delay={0.3}
                    className="block mb-4"
                  />
                  <span className="font-normal relative inline-block">
                    <TextReveal
                      text="Sun Studios"
                      delay={0.6}
                      className="bg-gradient-to-r from-[#FFB800] to-[#FF8A00] bg-clip-text text-transparent"
                    />
                    <motion.div
                      className="absolute -bottom-2 left-0 w-full h-[2px]"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: 1.2, delay: 1.2 }}
                    >
                      <div className="h-full bg-gradient-to-r from-[#FFB800] to-[#FF8A00]" />
                    </motion.div>
                    <motion.div
                      className="absolute -bottom-2 left-0 w-full h-6"
                      initial={{ scaleX: 0, opacity: 0 }}
                      animate={{ scaleX: 1, opacity: 1 }}
                      transition={{ duration: 1.2, delay: 1.3 }}
                    >
                      <div className="h-full bg-gradient-to-r from-[#FFB800]/20 to-[#FF8A00]/20 blur-lg" />
                    </motion.div>
                  </span>
                  <TextReveal text="?" delay={0.9} className="text-gray-900" />
                </h2>
                <div className="relative overflow-hidden">
                  <motion.p
                    className="text-xl md:text-2xl leading-relaxed text-gray-500 font-light tracking-wide"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 1.5 }}
                  >
                    <TextReveal
                      text="Sun Studios is a leading provider of solar energy solutions, committed to powering a sustainable future. With our innovative technology and expert team, we're transforming how homes and businesses harness the sun's energy."
                      delay={1.5}
                    />
                  </motion.p>
                </div>
              </motion.div>
            </div>
          </div>
          <div className=" lg:w-full pl-2" ref={containerRef}>
            <ul className="space-y-4">
              <AnimatePresence>
                {reasons.map((reason, index) => {
                  const previousCompleted =
                    index === 0 || completedAnimations.has(index - 1);
                  const shouldAnimate = isInView && previousCompleted;
                  const hasCompleted = completedAnimations.has(index);

                  return (
                    <motion.li
                      key={index}
                      className="flex items-start gap-6 group relative"
                      initial={{ opacity: 0, y: 60 }}
                      animate={{
                        opacity: previousCompleted ? 1 : 0,
                        y: previousCompleted ? 0 : 60,
                      }}
                      transition={{
                        duration: 0.8,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                    >
                      <div className="flex-shrink-0 mt-2">
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
                      <div className="flex-grow overflow-hidden">
                        <motion.div
                          className="relative py-8"
                          initial={{ opacity: 0 }}
                          animate={{
                            opacity: hasCompleted ? 1 : 0,
                          }}
                          transition={{
                            duration: 0.6,
                            ease: "easeOut",
                          }}
                        >
                          <div className="overflow-hidden">
                            <TextReveal
                              text={reason.text}
                              delay={0.2}
                              className="text-xl md:text-2xl font-normal text-gray-900 block mb-3"
                            />
                          </div>

                          <div className="overflow-hidden">
                            <TextReveal
                              text={reason.description}
                              delay={0.3}
                              className="text-base text-gray-500 font-light tracking-wide"
                            />
                          </div>

                          <motion.div
                            className="absolute bottom-0 left-0 h-[1px] w-full"
                            initial={{ scaleX: 0 }}
                            animate={{
                              scaleX: hasCompleted ? 1 : 0,
                            }}
                            transition={{
                              duration: 1.2,
                              delay: 0.4,
                              ease: [0.22, 1, 0.36, 1],
                            }}
                          >
                            <div className="h-full bg-gradient-to-r from-[#FFB800]/30 via-[#FF8A00]/30 to-transparent" />
                          </motion.div>
                        </motion.div>
                      </div>
                    </motion.li>
                  );
                })}
              </AnimatePresence>
            </ul>
          </div>
        </div>
      </motion.div>

      {/* Enhanced subtle background gradient */}
      <div className="absolute top-0 right-0 w-full h-full overflow-hidden -z-10 opacity-40 pointer-events-none">
        <motion.div
          className="absolute top-[5%] right-[5%] w-[800px] h-[800px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(255,184,0,0.08) 0%, rgba(255,184,0,0) 70%)",
            filter: "blur(100px)",
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{
            duration: 8,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
          }}
        />
      </div>
    </section>
  );
}
