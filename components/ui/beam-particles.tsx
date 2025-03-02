"use client";

import { motion } from "framer-motion";
import { useParticleSystem } from "../../hooks/use-particle-system";
import type { ParticleConfig } from "../../types/animations";

interface BeamParticlesProps {
  progress: number;
  pathD: string;
}

const defaultParticleConfig: ParticleConfig = {
  count: 15,
  size: 0.4,
  speed: 0.75,
  opacity: 0.4,
  color: "#60A5FA",
};

export function BeamParticles({ progress, pathD }: BeamParticlesProps) {
  const particles = useParticleSystem(defaultParticleConfig);

  return (
    <g>
      {particles.map((particle) => (
        <motion.circle
          key={particle.id}
          r={2}
          fill={defaultParticleConfig.color}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: progress >= particle.offset ? [0, particle.opacity, 0] : 0,
            scale: progress >= particle.offset ? [0, particle.scale, 0] : 0,
          }}
          transition={{
            duration: 1,
            repeat: 0,
            delay: particle.offset * 0.5,
            ease: "easeInOut",
          }}
        >
          <animateMotion
            dur={`${1.5 / particle.speed}s`}
            repeatCount="1"
            path={pathD}
          />
        </motion.circle>
      ))}
    </g>
  );
}
