"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import type { AnimationConfig } from "../types/animations";

interface AnimationSequenceConfig extends AnimationConfig {
  onProgress?: (progress: number) => void;
  onComplete?: () => void;
}

export function useAnimationSequence({
  duration = 1500,
  delay = 0,
  ease = "easeInOut",
  onProgress,
  onComplete,
}: AnimationSequenceConfig) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [progress, setProgress] = useState(0);
  const rafRef = useRef<number>();
  const startTimeRef = useRef<number>();

  const cancelAnimation = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = undefined;
    }
  }, []);

  const animate = useCallback(() => {
    if (!startTimeRef.current) {
      startTimeRef.current = performance.now();
    }

    const elapsed = performance.now() - startTimeRef.current;
    const rawProgress = Math.min(elapsed / duration, 1);

    // Apply easing
    const easedProgress =
      ease === "linear"
        ? rawProgress
        : ease === "easeInOut"
        ? rawProgress < 0.5
          ? 2 * rawProgress * rawProgress
          : 1 - Math.pow(-2 * rawProgress + 2, 2) / 2
        : rawProgress;

    setProgress(easedProgress);
    onProgress?.(easedProgress);

    if (rawProgress < 1) {
      rafRef.current = requestAnimationFrame(animate);
    } else {
      setIsAnimating(false);
      onComplete?.();
    }
  }, [duration, ease, onProgress, onComplete]);

  const startAnimation = useCallback(() => {
    if (!isAnimating) {
      setIsAnimating(true);
      setProgress(0);
      startTimeRef.current = undefined;
      cancelAnimation();

      if (delay) {
        setTimeout(() => {
          rafRef.current = requestAnimationFrame(animate);
        }, delay);
      } else {
        rafRef.current = requestAnimationFrame(animate);
      }
    }
  }, [isAnimating, delay, animate, cancelAnimation]);

  useEffect(() => {
    return () => {
      cancelAnimation();
    };
  }, [cancelAnimation]);

  return {
    isAnimating,
    progress,
    startAnimation,
    cancelAnimation,
  };
}
