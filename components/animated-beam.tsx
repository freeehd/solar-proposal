"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface AnimatedBeamProps {
  containerRef: React.RefObject<HTMLElement>;
  fromRef: React.RefObject<HTMLElement>;
  toRef: React.RefObject<HTMLElement>;
  duration?: number;
  delay?: number;
}

export const AnimatedBeam = ({
  containerRef,
  fromRef,
  toRef,
  duration = 2,
  delay = 0,
}: AnimatedBeamProps) => {
  const [path, setPath] = useState<string | null>(null);

  useEffect(() => {
    const updatePosition = () => {
      if (!containerRef.current || !fromRef.current || !toRef.current) return;

      const container = containerRef.current.getBoundingClientRect();
      const from = fromRef.current.getBoundingClientRect();
      const to = toRef.current.getBoundingClientRect();

      const x1 = from.left - container.left + from.width / 2;
      const y1 = from.top - container.top + from.height / 2;
      const x2 = to.left - container.left + to.width / 2;
      const y2 = to.top - container.top + to.height / 2;

      // Calculate control points for the curve
      const dx = x2 - x1;
      const dy = y2 - y1;
      const midX = (x1 + x2) / 2;

      // Create a more pronounced curve by adjusting these values
      const curveHeight = Math.min(Math.abs(dx), Math.abs(dy)) * 0.5;
      const cp1x = x1 + dx * 0.25;
      const cp1y = y1 - curveHeight;
      const cp2x = x1 + dx * 0.75;
      const cp2y = y1 + curveHeight;

      // Create cubic Bezier curve path
      const pathData = `M ${x1} ${y1} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x2} ${y2}`;
      setPath(pathData);
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    return () => window.removeEventListener("resize", updatePosition);
  }, [containerRef, fromRef, toRef]);

  if (!path) return null;

  return (
    <svg
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
      }}
    >
      <motion.path
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{
          duration,
          delay,
          ease: "easeInOut",
        }}
        d={path}
        fill="none"
        stroke="hsl(var(--primary))"
        strokeWidth={2}
        strokeLinecap="round"
        style={{
          filter: "drop-shadow(0 0 8px hsl(var(--primary)))",
        }}
      />
    </svg>
  );
};
