"use client";

import type React from "react";

import { type RefObject, useEffect, useId, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface AnimatedLightningProps {
  className?: string;
  containerRef: RefObject<HTMLElement>;
  fromRef: RefObject<HTMLElement>;
  toRef: RefObject<HTMLElement>;
  pattern?: "zigzag" | "wave";
  patternCount?: number;
  patternIntensity?: number;
  pathColor?: string;
  pathWidth?: number;
  pathOpacity?: number;
  glowColor?: string;
  glowWidth?: number;
  delay?: number;
  duration?: number;
  stayAliveTime?: number;
  fromSpeed?: number;
  toSpeed?: number;
  uniqueId: string;
}

export const AnimatedLightning: React.FC<AnimatedLightningProps> = ({
  className,
  containerRef,
  fromRef,
  toRef,
  pattern = "wave",
  patternCount = 1,
  patternIntensity = 0.1,
  pathColor = "#808080",
  pathWidth = 0.4,
  pathOpacity = 0.4,
  glowColor = "#808080",
  glowWidth = 10,
  delay = 0,
  duration = 1.5,
  stayAliveTime = 10,
  fromSpeed = 1,
  toSpeed = 1,
  uniqueId,
}) => {
  const id = useId();
  const [pathD, setPathD] = useState("");
  const [svgDimensions, setSvgDimensions] = useState({ width: 0, height: 0 });

  const updatePath = useMemo(() => {
    return () => {
      if (containerRef.current && fromRef.current && toRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect();
        const rectA = fromRef.current.getBoundingClientRect();
        const rectB = toRef.current.getBoundingClientRect();

        const svgWidth = containerRect.width;
        const svgHeight = containerRect.height;
        setSvgDimensions({ width: svgWidth, height: svgHeight });

        const startX = rectA.left - containerRect.left + rectA.width / 2;
        const startY = rectA.top - containerRect.top + rectA.height / 2;
        const endX = rectB.left - containerRect.left + rectB.width / 2;
        const endY = rectB.top - containerRect.top + rectB.height / 2;

        const dx = endX - startX;
        const dy = endY - startY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        let d = `M ${startX},${startY} `;

        if (pattern === "zigzag") {
          for (let i = 1; i <= patternCount; i++) {
            const t = i / (patternCount + 1);
            const x = startX + dx * t;
            const y = startY + dy * t;
            const perpX =
              (-dy / distance) *
              (i % 2 === 0 ? 1 : -1) *
              distance *
              patternIntensity;
            const perpY =
              (dx / distance) *
              (i % 2 === 0 ? 1 : -1) *
              distance *
              patternIntensity;
            d += `L ${x + perpX},${y + perpY} `;
          }
        } else if (pattern === "wave") {
          const waveFrequency = Math.PI * 2 * patternCount;
          const steps = Math.min(100, Math.floor(distance / 5));
          for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const x = startX + dx * t;
            const y = startY + dy * t;
            const waveOffset =
              Math.sin(t * waveFrequency) * distance * patternIntensity;
            const perpX = (-dy / distance) * waveOffset;
            const perpY = (dx / distance) * waveOffset;
            d += `${i === 0 ? "M" : "L"} ${x + perpX},${y + perpY} `;
          }
        }

        d += `L ${endX},${endY}`;
        setPathD(d);
      }
    };
  }, [containerRef, fromRef, toRef, pattern, patternCount, patternIntensity]);

  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(updatePath);
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    updatePath();

    return () => {
      resizeObserver.disconnect();
    };
  }, [containerRef, updatePath]);

  const getCustomTimes = useMemo(() => {
    return (speed: number) => {
      const animationDuration = duration / Math.max(0.1, speed);
      const totalTime = animationDuration + stayAliveTime;
      return {
        duration: totalTime,
        animationDuration,
        times: [
          0,
          animationDuration / totalTime,
          (totalTime - 0.05) / totalTime,
          1,
        ],
      };
    };
  }, [duration, stayAliveTime]);

  const fromTiming = useMemo(
    () => getCustomTimes(fromSpeed),
    [getCustomTimes, fromSpeed]
  );
  const toTiming = useMemo(
    () => getCustomTimes(toSpeed),
    [getCustomTimes, toSpeed]
  );

  return (
    <svg
      fill="none"
      width={svgDimensions.width}
      height={svgDimensions.height}
      xmlns="http://www.w3.org/2000/svg"
      className={cn(
        "pointer-events-none absolute left-0 top-0 transform-gpu z-[-10]",
        className
      )}
      viewBox={`0 0 ${svgDimensions.width} ${svgDimensions.height}`}
    >
      <defs>
        <filter id={`glow-${id}`}>
          <feGaussianBlur stdDeviation="3.5" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <motion.path
        key={`glow-${uniqueId}`}
        d={pathD}
        stroke={glowColor}
        strokeWidth={glowWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        filter={`url(#glow-${id})`}
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{
          pathLength: [0, 1],
          opacity: [0, pathOpacity, pathOpacity, 0],
        }}
        transition={{
          pathLength: {
            delay,
            duration: fromTiming.animationDuration,
            ease: "linear",
          },
          opacity: {
            delay,
            duration: fromTiming.duration,
            ease: "linear",
            times: fromTiming.times,
          },
        }}
      />
      <motion.path
        key={`path-${uniqueId}`}
        d={pathD}
        stroke={pathColor}
        strokeWidth={pathWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{
          pathLength: [0, 1],
          opacity: [0, 1, 1, 0],
        }}
        transition={{
          pathLength: {
            delay,
            duration: fromTiming.animationDuration,
            ease: "linear",
          },
          opacity: {
            delay,
            duration: fromTiming.duration,
            ease: "linear",
            times: fromTiming.times,
          },
        }}
      />
    </svg>
  );
};

export default AnimatedLightning;
