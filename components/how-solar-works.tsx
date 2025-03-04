"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";

export const StarAnimation = ({
  className = "",
  delay = 0,
  onAnimationComplete,
}) => {
  const [uniqueId] = useState(() => Math.random().toString(36).substr(2, 9));
  const [isHovered, setIsHovered] = useState(false);
  const [hasCompletedEntrance, setHasCompletedEntrance] = useState(false);

  useEffect(() => {
    if (!hasCompletedEntrance) {
      const timer = setTimeout(() => {
        setHasCompletedEntrance(true);
        onAnimationComplete?.();
      }, 1800);
      return () => clearTimeout(timer);
    }
  }, [hasCompletedEntrance, onAnimationComplete]);

  return (
    <motion.div
      initial={{ y: 50, scale: 0, opacity: 0 }}
      animate={{ y: 0, scale: 1, opacity: 1 }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 20,
        duration: 0.5,
        delay,
      }}
      onAnimationComplete={() => {
        setTimeout(() => {
          setHasCompletedEntrance(true);
          onAnimationComplete?.();
        }, 1800);
      }}
      className="w-[100px] h-[100px] relative"
      style={{
        perspective: "800px",
        transformStyle: "preserve-3d",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div
        className="w-full h-full"
        animate={
          !hasCompletedEntrance
            ? {
                rotateY: [0, 720],
                scale: [1, 1.2, 1],
              }
            : {
                scale: isHovered ? 1.1 : 1,
              }
        }
        transition={
          !hasCompletedEntrance
            ? {
                duration: 1.8,
                ease: [0.34, 1.56, 0.64, 1],
                scale: {
                  times: [0, 0.5, 1],
                  ease: "easeInOut",
                },
              }
            : {
                scale: {
                  duration: 0.3,
                  ease: "easeOut",
                },
              }
        }
        style={{
          transformStyle: "preserve-3d",
        }}
      >
        {/* Sparkles */}
        <motion.div
          className="absolute inset-0"
          initial={false}
          animate={
            isHovered
              ? {
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5],
                }
              : {}
          }
          transition={{
            duration: 1,
            repeat: Number.POSITIVE_INFINITY,
          }}
        >
          <svg className="w-full h-full" viewBox="0 0 100 100">
            <defs>
              <radialGradient id={`sparkle-${uniqueId}`}>
                <stop offset="0%" stopColor="white" stopOpacity="0.8" />
                <stop offset="100%" stopColor="white" stopOpacity="0" />
              </radialGradient>
            </defs>
            <circle cx="50" cy="50" r="40" fill={`url(#sparkle-${uniqueId})`} />
          </svg>
        </motion.div>

        {/* Front glow */}
        <svg
          className="absolute inset-0 w-full h-full"
          style={{ transform: "translateZ(1px)" }}
        >
          <defs>
            <filter
              id={`glow1-${uniqueId}`}
              x="-20%"
              y="-20%"
              width="140%"
              height="140%"
            >
              <feGaussianBlur in="SourceGraphic" stdDeviation="4" />
              <feComposite operator="out" in2="SourceGraphic" />
              <feBlend in="SourceGraphic" />
            </filter>
            <linearGradient
              id={`star-gradient-${uniqueId}`}
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#E2E8F0" />
              <stop offset="50%" stopColor="#CBD5E1" />
              <stop offset="100%" stopColor="#94A3B8" />
            </linearGradient>
            <linearGradient
              id={`star-highlight-${uniqueId}`}
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="white" stopOpacity="0.8" />
              <stop offset="100%" stopColor="white" stopOpacity="0.2" />
            </linearGradient>
          </defs>
          <motion.polygon
            points="25,20 45,20 50,5 55,20 75,20 60,32.5 65,55 50,40 35,55 40,32.5"
            fill={`url(#star-gradient-${uniqueId})`}
            stroke="#E2E8F0"
            strokeWidth="1"
            filter={`url(#glow1-${uniqueId})`}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{
              duration: 2.5,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "reverse",
            }}
          />
          <motion.polygon
            points="25,20 45,20 50,5 55,20 75,20 60,32.5 65,55 50,40 35,55 40,32.5"
            fill={`url(#star-highlight-${uniqueId})`}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.5, 0] }}
            transition={{
              duration: 2.5,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "reverse",
            }}
          />
        </svg>

        {/* Side glow */}
        <motion.div
          className="absolute inset-0"
          style={{
            transformStyle: "preserve-3d",
            transform: "rotateY(80deg)",
          }}
        >
          <svg className="w-full h-full">
            <defs>
              <filter
                id={`glow2-${uniqueId}`}
                x="-20%"
                y="-20%"
                width="140%"
                height="140%"
              >
                <feGaussianBlur in="SourceGraphic" stdDeviation="20" />
                <feColorMatrix
                  type="matrix"
                  values="0 0 0 0 1   0 0 0 0 1   0 0 0 0 1   0 0 0 0.5 0"
                />
              </filter>
            </defs>
            <motion.polygon
              points="60,5 40,5 40,55 60,55"
              fill={`url(#star-gradient-${uniqueId})`}
              stroke="#E2E8F0"
              strokeWidth="1"
              filter={`url(#glow2-${uniqueId})`}
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1] }}
              transition={{
                duration: 2.5,
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "reverse",
              }}
            />
          </svg>
        </motion.div>

        {/* Front face */}
        <div
          className="absolute inset-0"
          style={{ transform: "translateZ(5px)" }}
        >
          <svg className="w-full h-full">
            <polygon
              points="25,20 45,20 50,5 55,20 75,20 60,32.5 65,55 50,40 35,55 40,32.5"
              fill={`url(#star-gradient-${uniqueId})`}
              stroke="#E2E8F0"
              strokeWidth="1"
            />
          </svg>
        </div>

        {/* Back face */}
        <div
          className="absolute inset-0"
          style={{ transform: "translateZ(-5px) rotateY(180deg)" }}
        >
          <svg className="w-full h-full">
            <polygon
              points="25,20 45,20 50,5 55,20 75,20 60,32.5 65,55 50,40 35,55 40,32.5"
              fill={`url(#star-gradient-${uniqueId})`}
              stroke="#E2E8F0"
              strokeWidth="1"
            />
          </svg>
        </div>

        {/* 3D edges with gradient */}
        {[
          {
            top: "1px",
            left: "42px",
            height: "20px",
            rotate: "rotateZ(18deg)",
          },
          {
            top: "15px",
            left: "26px",
            height: "21px",
            rotate: "rotateZ(-50deg)",
          },
          {
            top: "30px",
            left: "32px",
            height: "28px",
            rotate: "rotateZ(17deg)",
          },
          {
            top: "33px",
            left: "39px",
            height: "28px",
            rotate: "rotateZ(42deg)",
          },
          {
            top: "1px",
            left: "48px",
            height: "20px",
            rotate: "rotateZ(-18deg)",
          },
          {
            top: "15px",
            left: "65px",
            height: "21px",
            rotate: "rotateZ(50deg)",
          },
          {
            top: "30px",
            left: "59px",
            height: "28px",
            rotate: "rotateZ(-14deg)",
          },
          {
            top: "32px",
            left: "51px",
            height: "28px",
            rotate: "rotateZ(-40deg)",
          },
        ].map((edge, index) => (
          <div
            key={index}
            className="absolute w-[6px] bg-gradient-to-b from-slate-200 to-slate-400 border-l border-r border-slate-300"
            style={{
              top: edge.top,
              left: edge.left,
              height: edge.height,
              transform: `${edge.rotate} rotateY(90deg)`,
            }}
          />
        ))}
      </motion.div>
    </motion.div>
  );
};
