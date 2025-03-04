"use client";

import type React from "react";
import { type RefObject, useEffect, useId, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { BeamParticles } from "./beam-particles";

export interface AnimatedBeamProps {
  className?: string;
  containerRef: RefObject<HTMLElement>;
  fromRef: RefObject<HTMLElement>;
  toRef: RefObject<HTMLElement>;
  circleRef?: RefObject<HTMLElement>;
  pattern?: "straight" | "wave";
  patternCount?: number;
  patternIntensity?: number;
  pathColor?: string;
  pathWidth?: number;
  pathOpacity?: number;
  glowColor?: string;
  glowWidth?: number;
  delay?: number;
  duration?: number;
  onProgress?: (progress: number) => void;
  onComplete?: () => void;
}

export const AnimatedBeam: React.FC<AnimatedBeamProps> = ({
  className,
  containerRef,
  fromRef,
  toRef,
  circleRef,
  pattern = "wave",
  patternCount = 3,
  patternIntensity = 0.05,
  pathColor = "rgba(59, 130, 246, 0.6)",
  pathWidth = 1,
  pathOpacity = 1,
  glowColor = "rgba(59, 130, 246, 0.3)",
  glowWidth = 16,
  delay = 0,
  duration = 2.5,
  onProgress,
  onComplete,
}) => {
  const id = useId();
  const [pathD, setPathD] = useState("");
  const [svgDimensions, setSvgDimensions] = useState({ width: 0, height: 0 });
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  // Calculate center points
  const calculateCenter = useCallback(
    (element: HTMLElement, containerRect: DOMRect, isCircle = false) => {
      try {
        const rect = element.getBoundingClientRect();
        const iconSize = 112; // 28 * 4 (w-28 class)
        const circleSize = 208; // 52 * 4 (w-52 class)
        const size = isCircle ? circleSize : iconSize;
        return {
          x: rect.left - containerRect.left + size / 2,
          y: rect.top - containerRect.top + size / 2,
        };
      } catch (error) {
        console.error("Error calculating center:", error);
        return { x: 0, y: 0 };
      }
    },
    []
  );

  // Update path and dimensions
  const updatePath = useCallback(() => {
    try {
      if (!containerRef?.current || !fromRef?.current || !toRef?.current) {
        console.warn("Missing required refs");
        return;
      }

      const containerRect = containerRef.current.getBoundingClientRect();
      setSvgDimensions({
        width: containerRect.width,
        height: containerRect.height,
      });

      const isTargetCircle =
        circleRef?.current && toRef.current === circleRef.current;
      const start = calculateCenter(fromRef.current, containerRect);
      const end = calculateCenter(
        toRef.current,
        containerRect,
        !!isTargetCircle
      );

      const dx = end.x - start.x;
      const dy = end.y - start.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance === 0) {
        console.warn("Zero distance between points");
        return;
      }

      let d = `M ${start.x},${start.y} `;

      if (pattern === "straight") {
        d += `L ${end.x},${end.y}`;
      } else if (pattern === "wave") {
        const waveFrequency = Math.PI * 2 * patternCount;
        const steps = Math.min(100, Math.floor(distance / 5));

        if (steps < 2) {
          d += `L ${end.x},${end.y}`;
        } else {
          for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const x = start.x + dx * t;
            const y = start.y + dy * t;
            const waveOffset =
              Math.sin(t * waveFrequency) * distance * patternIntensity;
            const perpX = (-dy / distance) * waveOffset;
            const perpY = (dx / distance) * waveOffset;
            d += `${i === 0 ? "M" : "L"} ${x + perpX},${y + perpY} `;
          }
        }
      }

      d += `L ${end.x},${end.y}`;
      setPathD(d);
    } catch (error) {
      console.error("Error updating beam path:", error);
      setPathD("");
    }
  }, [
    containerRef,
    fromRef,
    toRef,
    circleRef,
    pattern,
    patternCount,
    patternIntensity,
    calculateCenter,
  ]);

  useEffect(() => {
    try {
      const resizeObserver = new ResizeObserver(() => {
        requestAnimationFrame(updatePath);
      });

      if (containerRef?.current) {
        resizeObserver.observe(containerRef.current);
      }

      updatePath();

      return () => {
        resizeObserver.disconnect();
      };
    } catch (error) {
      console.error("Error setting up resize observer:", error);
    }
  }, [containerRef, updatePath]);

  const handleComplete = () => {
    setIsComplete(true);
    onComplete?.();
  };

  if (!pathD) {
    return null;
  }

  return (
    <svg
      fill="none"
      width={svgDimensions.width}
      height={svgDimensions.height}
      xmlns="http://www.w3.org/2000/svg"
      className="pointer-events-none absolute left-0 top-0"
      style={{ zIndex: 25 }} // Set a z-index that's higher than cards (10) but lower than premium icons (30)
      viewBox={`0 0 ${svgDimensions.width} ${svgDimensions.height}`}
    >
      <defs>
        <filter id={`glow-${id}`} filterUnits="userSpaceOnUse">
          <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur1" />
          <feGaussianBlur in="blur1" stdDeviation="8" result="blur2" />
          <feMerge>
            <feMergeNode in="blur2" />
            <feMergeNode in="blur1" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <g style={{ isolation: "isolate" }}>
        {/* Base beam path */}
        <motion.path
          d={pathD}
          stroke={pathColor}
          strokeWidth={pathWidth * 2}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={0.3}
        />

        {/* Main glow path */}
        <motion.path
          key={`glow-${id}`}
          d={pathD}
          stroke={glowColor}
          strokeWidth={glowWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          filter={`url(#glow-${id})`}
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{
            pathLength: 1,
            opacity: [0, pathOpacity, pathOpacity * 0.8, pathOpacity],
          }}
          transition={{
            delay,
            duration,
            ease: "easeInOut",
            opacity: {
              duration: duration * 2,
              repeat: 0,
              ease: "easeInOut",
            },
          }}
          onUpdate={({ pathLength = 0 }) => {
            const numericPathLength = Number(pathLength);
            setProgress(numericPathLength);
            onProgress?.(numericPathLength);
          }}
          onAnimationComplete={handleComplete}
        />

        {/* Main path */}
        <motion.path
          key={`path-${id}`}
          d={pathD}
          stroke={pathColor}
          strokeWidth={pathWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{
            pathLength: 1,
            opacity: 1,
          }}
          transition={{
            delay,
            duration,
            ease: "easeInOut",
          }}
        />

        {/* Particle effects */}
        <BeamParticles progress={progress} pathD={pathD} />
      </g>
    </svg>
  );
};

export default AnimatedBeam;
