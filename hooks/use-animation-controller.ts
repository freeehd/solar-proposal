"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import type { AnimationState, BeamConfig } from "../types/animations";

export function useAnimationController(beamConfigs: BeamConfig[]) {
  const [animationState, setAnimationState] = useState<AnimationState>({
    beams: {},
    charging: {},
  });

  // Keep track of active timeouts for cleanup
  const timeoutRefs = useRef<number[]>([]);

  // Reset all animations
  const resetAnimations = useCallback(() => {
    // Clear all timeouts
    timeoutRefs.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
    timeoutRefs.current = [];

    // Reset state
    setAnimationState({
      beams: {},
      charging: {},
    });
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      timeoutRefs.current.forEach((timeoutId) =>
        window.clearTimeout(timeoutId)
      );
    };
  }, []);

  const updateBeamProgress = useCallback(
    (beamId: string, progress: number) => {
      try {
        setAnimationState((prev) => ({
          ...prev,
          beams: {
            ...prev.beams,
            [beamId]: {
              ...prev.beams[beamId],
              progress,
            },
          },
        }));

        // Find the current and next beam configs
        const currentBeamIndex = beamConfigs.findIndex(
          (config) => config.id === beamId
        );
        const currentBeam = beamConfigs[currentBeamIndex];
        const nextBeam = beamConfigs[currentBeamIndex + 1];

        if (!currentBeam) {
          console.error(`Beam with id ${beamId} not found in configs`);
          return;
        }

        // Update charging states based on progress
        if (progress > 0.05) {
          // Start charging the source icon
          setAnimationState((prev) => ({
            ...prev,
            charging: {
              ...prev.charging,
              [currentBeam.fromRef.current?.id ?? ""]: {
                isCharging: true,
                progress: Math.min(progress * 2, 1),
                hasCompleted: false,
              },
            },
          }));
        }

        if (progress > 0.8) {
          // Start charging the target icon
          setAnimationState((prev) => ({
            ...prev,
            charging: {
              ...prev.charging,
              [currentBeam.toRef.current?.id ?? ""]: {
                isCharging: true,
                progress: Math.min((progress - 0.8) * 5, 1),
                hasCompleted: false,
              },
            },
          }));
        }

        if (progress === 1) {
          // Complete the current beam animation
          setAnimationState((prev) => ({
            ...prev,
            beams: {
              ...prev.beams,
              [beamId]: {
                ...prev.beams[beamId],
                isComplete: true,
              },
            },
          }));

          // Mark the source icon charging as complete
          const sourceTimeout = window.setTimeout(() => {
            setAnimationState((prev) => ({
              ...prev,
              charging: {
                ...prev.charging,
                [currentBeam.fromRef.current?.id ?? ""]: {
                  isCharging: false,
                  progress: 0,
                  hasCompleted: true,
                },
              },
            }));
          }, 1000);
          timeoutRefs.current.push(sourceTimeout);

          // If there's no next beam, mark the target icon charging as complete
          if (!nextBeam) {
            const targetTimeout = window.setTimeout(() => {
              setAnimationState((prev) => ({
                ...prev,
                charging: {
                  ...prev.charging,
                  [currentBeam.toRef.current?.id ?? ""]: {
                    isCharging: false,
                    progress: 0,
                    hasCompleted: true,
                  },
                },
              }));
            }, 1000);
            timeoutRefs.current.push(targetTimeout);
          }
        }
      } catch (error) {
        console.error("Error updating beam progress:", error);
        resetAnimations();
      }
    },
    [beamConfigs, resetAnimations]
  );

  return {
    animationState,
    updateBeamProgress,
    resetAnimations,
  };
}
