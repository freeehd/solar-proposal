"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  alpha: number;
}

export const AnimatedParticles = ({
  centerX,
  centerY,
  active,
}: {
  centerX: number;
  centerY: number;
  active: boolean;
}) => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const requestRef = useRef<number>();
  const particleCount = 12;

  useEffect(() => {
    if (active) {
      const newParticles: Particle[] = Array.from({
        length: particleCount,
      }).map((_, i) => ({
        id: i,
        x: centerX,
        y: centerY,
        size: Math.random() * 3 + 1,
        alpha: 1,
      }));
      setParticles(newParticles);
    } else {
      setParticles([]);
    }
  }, [active, centerX, centerY]);

  useEffect(() => {
    const animate = () => {
      setParticles((prevParticles) =>
        prevParticles
          .map((particle) => ({
            ...particle,
            x: particle.x + (Math.random() - 0.5) * 2,
            y: particle.y + (Math.random() - 0.5) * 2,
            alpha: particle.alpha - 0.02,
          }))
          .filter((particle) => particle.alpha > 0)
      );
      requestRef.current = requestAnimationFrame(animate);
    };

    if (active && particles.length > 0) {
      requestRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [active, particles.length]);

  return (
    <div className="absolute inset-0 pointer-events-none">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute w-1 h-1 rounded-full bg-primary"
          style={{
            left: particle.x,
            top: particle.y,
            opacity: particle.alpha,
            scale: particle.size,
          }}
        />
      ))}
    </div>
  );
};
