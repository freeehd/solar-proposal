"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface Particle {
  id: number;
  angle: number;
  delay: number;
  scale: number;
  opacity: number;
}

interface ChargeParticlesProps {
  progress?: number;
  isCharging?: boolean;
}

export function ChargeParticles({
  progress = 1,
  isCharging = false,
}: ChargeParticlesProps) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const particleCount = 12;
    const newParticles = Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      angle: (i * 2 * Math.PI) / particleCount,
      delay: i * 0.05,
      scale: Math.random() * 0.3 + 0.3,
      opacity: Math.random() * 0.3 + 0.3,
    }));
    setParticles(newParticles);
  }, []);

  if (!isCharging) return null;

  return (
    <div className="absolute inset-0 pointer-events-none">
      {particles.map((particle) => {
        const radius = 28; // Match the icon size (w-14 = 3.5rem = 56px, so radius is 28px)
        const x = Math.cos(particle.angle) * radius * progress;
        const y = Math.sin(particle.angle) * radius * progress;

        return (
          <motion.div
            key={particle.id}
            className="absolute left-1/2 top-1/2 w-1 h-1 bg-blue-400 rounded-full"
            initial={{ x: 0, y: 0, scale: 0, opacity: 0 }}
            animate={{
              x,
              y,
              scale: [0, particle.scale, 0],
              opacity: [0, particle.opacity, 0],
            }}
            transition={{
              duration: 0.6,
              delay: particle.delay,
              repeat: Number.POSITIVE_INFINITY,
              repeatDelay: 0.2,
              ease: "easeInOut",
            }}
          />
        );
      })}
    </div>
  );
}
