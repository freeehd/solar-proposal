"use client";

import { useState, useEffect, useCallback } from "react";
import type { ParticleConfig } from "../types/animations";

interface Particle {
  id: number;
  scale: number;
  opacity: number;
  speed: number;
  offset: number;
}

export function useParticleSystem(config: ParticleConfig) {
  const [particles, setParticles] = useState<Particle[]>([]);

  const generateParticles = useCallback(() => {
    const newParticles = Array.from({ length: config.count }, (_, i) => ({
      id: i,
      scale: Math.random() * config.size + config.size * 0.5,
      opacity: Math.random() * config.opacity + config.opacity * 0.5,
      speed: Math.random() * config.speed + config.speed * 0.5,
      offset: i / (config.count * 1.5), // Spread particles more evenly along the path
    }));
    setParticles(newParticles);
  }, [config]);

  useEffect(() => {
    generateParticles();
  }, [generateParticles]);

  return particles;
}
