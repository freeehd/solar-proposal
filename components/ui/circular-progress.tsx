"use client";

import React from "react";
import { motion, useAnimation } from "framer-motion";
import { ChargeParticles } from "./charge-particles";

interface CircularProgressProps {
  percentage: number;
  isCharging?: boolean;
  onChargingComplete?: () => void;
}

export function CircularProgress({
  percentage,
  isCharging,
  onChargingComplete,
}: CircularProgressProps) {
  const controls = useAnimation();
  const [currentPercentage, setCurrentPercentage] = React.useState(0);
  const circumference = 2 * Math.PI * 60;
  const [showRipple, setShowRipple] = React.useState(false);
  const [showParticles, setShowParticles] = React.useState(false);

  // Helper function to get color based on percentage
  const getColorGradient = (percentage: number) => {
    if (percentage <= 25) {
      return {
        start: "rgb(239, 68, 68)", // red-500
        end: "rgb(249, 115, 22)", // orange-500
      };
    } else if (percentage <= 50) {
      return {
        start: "rgb(249, 115, 22)", // orange-500
        end: "rgb(234, 179, 8)", // yellow-500
      };
    } else if (percentage <= 75) {
      return {
        start: "rgb(234, 179, 8)", // yellow-500
        end: "rgb(34, 197, 94)", // green-500
      };
    } else {
      return {
        start: "rgb(34, 197, 94)", // green-500
        end: "rgb(21, 128, 61)", // green-700
      };
    }
  };

  const colors = getColorGradient(currentPercentage);

  React.useEffect(() => {
    if (isCharging) {
      setShowRipple(true);
      setShowParticles(true);

      const duration = 2000;
      const startTime = Date.now();
      const startPercentage = currentPercentage;

      controls.start({
        scale: [1, 1.05, 1],
        transition: {
          duration: 0.5,
          ease: "easeInOut",
        },
      });

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const newPercentage =
          startPercentage + (percentage - startPercentage) * progress;

        setCurrentPercentage(Math.round(newPercentage));

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          controls
            .start({
              scale: [1, 1.1, 1],
              transition: {
                duration: 0.6,
                ease: "easeInOut",
              },
            })
            .then(() => {
              setTimeout(() => {
                setShowRipple(false);
                setShowParticles(false);
                onChargingComplete?.();
              }, 500);
            });
        }
      };

      requestAnimationFrame(animate);
    }
  }, [isCharging, percentage, currentPercentage, controls, onChargingComplete]);

  return (
    <div
      className="relative w-52 h-52 bg-gradient-to-br from-blue-50 to-white flex bg-blur rounded-full items-center justify-center"
      data-circle="true"
    >
      <motion.div
        className="absolute inset-0"
        animate={controls}
        style={{ zIndex: 30 }}
      >
        <svg className="w-full h-full -rotate-90" viewBox="0 0 140 140">
          <defs>
            <linearGradient
              id={`progressGradient-${currentPercentage}`}
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor={colors.start} />
              <stop offset="100%" stopColor={colors.end} />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <filter
              id="enhanced-glow"
              x="-50%"
              y="-50%"
              width="200%"
              height="200%"
            >
              <feGaussianBlur stdDeviation="8" result="coloredBlur" />
              <feColorMatrix
                in="coloredBlur"
                type="matrix"
                values="1 0 0 0 0
                        0 1 0 0 0
                        0 0 2 0 0
                        0 0 0 3 0"
              />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <circle
            className="text-slate-100"
            strokeWidth="10"
            stroke="currentColor"
            fill="none"
            r="60"
            cx="70"
            cy="70"
          />

          <motion.circle
            stroke={`url(#progressGradient-${currentPercentage})`}
            strokeWidth="15"
            strokeLinecap="round"
            fill="white"
            r="60"
            cx="70"
            cy="70"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{
              strokeDashoffset:
                circumference - (currentPercentage / 100) * circumference,
            }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            filter={isCharging ? "url(#enhanced-glow)" : "url(#glow)"}
          />

          {showRipple && (
            <motion.circle
              r="60"
              cx="70"
              cy="70"
              fill="none"
              stroke={`url(#progressGradient-${currentPercentage})`}
              strokeWidth="2"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{
                opacity: [0, 0.5, 0],
                scale: [0.8, 1.2, 1],
              }}
              transition={{
                duration: 1,
                ease: "easeOut",
                repeat: 0,
              }}
            />
          )}
        </svg>
      </motion.div>

      {showParticles && (
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{ zIndex: 35 }}
        >
          <ChargeParticles progress={currentPercentage / 100} />
        </motion.div>
      )}

      <div
        className="absolute inset-0 flex flex-col items-center justify-center"
        style={{ zIndex: 40 }}
      >
        <motion.span
          className="text-5xl font-medium  leading-tight"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          style={{
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: colors.start,
          }}
        >
          {currentPercentage}%
        </motion.span>
        <motion.span
          className="text-sm text-slate-500 font-normal leading-tight"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          Energy Offset
        </motion.span>
      </div>

      {showRipple && (
        <motion.div
          className="absolute inset-0"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{
            scale: [0.8, 1.2, 1],
            opacity: [0, 0.3, 0],
          }}
          transition={{
            duration: 1.5,
            ease: "easeInOut",
            repeat: 0,
          }}
          style={{ zIndex: 35 }}
        >
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: colors.start,
              opacity: 0.2,
            }}
          />
        </motion.div>
      )}
    </div>
  );
}
