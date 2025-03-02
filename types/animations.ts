import type React from "react";
export interface AnimationConfig {
  duration?: number;
  delay?: number;
  ease?: string;
}

export interface ChargingState {
  isCharging: boolean;
  progress: number;
  hasCompleted: boolean;
}

export interface ParticleConfig {
  count: number;
  size: number;
  speed: number;
  opacity: number;
  color: string;
}

export interface BeamConfig {
  id: string;
  fromRef: React.RefObject<HTMLElement>;
  toRef: React.RefObject<HTMLElement>;
  delay: number;
  isCircleTarget?: boolean;
}

export interface AnimationState {
  beams: Record<
    string,
    {
      progress: number;
      isComplete: boolean;
    }
  >;
  charging: Record<string, ChargingState>;
}
