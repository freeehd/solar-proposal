"use client";

import type { RefObject } from "react";
import { AnimatedBeam } from "./ui/animated-beam";

interface BeamOverlayProps {
  containerRef: RefObject<HTMLElement>;
  icon1Ref: RefObject<HTMLElement>;
  icon2Ref: RefObject<HTMLElement>;
  icon3Ref: RefObject<HTMLElement>;
  icon4Ref: RefObject<HTMLElement>;
  circleRef: RefObject<HTMLElement>;
  onBeamProgress: (beamId: string, progress: number) => void;
}

export function BeamOverlay({
  containerRef,
  icon1Ref,
  icon2Ref,
  icon3Ref,
  icon4Ref,
  circleRef,
  onBeamProgress,
}: BeamOverlayProps) {
  return (
    <div
      className="relative w-full h-full isolate"
      style={{
        zIndex: "var(--z-index-beams)",
        transform: "translate3d(0,0,0)",
      }}
    >
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={icon1Ref}
        toRef={icon2Ref}
        circleRef={circleRef}
        duration={2}
        delay={0.5} // Reduced initial delay since we're controlling visibility at section level
        pathColor="#9eff96"
        glowColor="rgba(113, 255, 102,  0.4)"
        pattern="straight"
        pathWidth={3}
        glowWidth={12}
        onProgress={(progress) => onBeamProgress("beam1", progress)}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={icon2Ref}
        toRef={icon3Ref}
        circleRef={circleRef}
        duration={2}
        delay={3.5}
        pathColor="#9eff96"
        glowColor="rgba(113, 255, 102,  0.4)"
        pattern="straight"
        pathWidth={3}
        glowWidth={12}
        onProgress={(progress) => onBeamProgress("beam2", progress)}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={icon3Ref}
        toRef={icon4Ref}
        circleRef={circleRef}
        duration={2}
        delay={6.5}
        pathColor="#9eff96"
        glowColor="rgba(113, 255, 102,  0.4)"
        pattern="straight"
        pathWidth={3}
        glowWidth={12}
        onProgress={(progress) => onBeamProgress("beam3", progress)}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={icon4Ref}
        toRef={circleRef}
        circleRef={circleRef}
        duration={2}
        delay={9.5}
        pathColor="#9eff96"
        glowColor="rgba(113, 255, 102,  0.4)"
        pattern="straight"
        pathWidth={3}
        glowWidth={12}
        onProgress={(progress) => onBeamProgress("beam4", progress)}
      />
    </div>
  );
}
