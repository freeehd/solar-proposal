"use client";

import type React from "react";
import { BarChart2, Sun, Battery, Zap } from "lucide-react";
import { PremiumIcon } from "./premium-icon";
import { CircularProgress } from "./ui/circular-progress";

interface IconPortalLayerProps {
  icon1Ref: React.RefObject<HTMLDivElement>;
  icon2Ref: React.RefObject<HTMLDivElement>;
  icon3Ref: React.RefObject<HTMLDivElement>;
  icon4Ref: React.RefObject<HTMLDivElement>;
  circleRef: React.RefObject<HTMLDivElement>;
  chargingStates: {
    icon1: boolean;
    icon2: boolean;
    icon3: boolean;
    icon4: boolean;
    circle: boolean;
  };
  onChargingComplete: (
    key: "circle" | "icon1" | "icon2" | "icon3" | "icon4"
  ) => void;
  energyOffset: number;
  containerRef: React.RefObject<HTMLElement>;
  shouldAnimate: boolean;
}

export function IconPortalLayer({
  icon1Ref,
  icon2Ref,
  icon3Ref,
  icon4Ref,
  circleRef,
  chargingStates,
  onChargingComplete,
  energyOffset,
  containerRef,
  shouldAnimate,
}: IconPortalLayerProps) {
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={
        {
          "--portal-z-index": "100",
          zIndex: "var(--portal-z-index)",
        } as React.CSSProperties
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mt-[47rem]">
        {/* Updated margin-top to account for images */}
        <div className="col-span-1 md:col-span-2">
          <div className="pt-10 pb-8 px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-12">
              {/* Premium Icons */}
              <div className="pointer-events-auto flex flex-col items-center">
                <div ref={icon1Ref}>
                  <PremiumIcon
                    className="w-28 h-28"
                    isCharging={chargingStates.icon1 && shouldAnimate}
                    onChargingComplete={() => onChargingComplete("icon1")}
                    delay={0.5}
                  >
                    <BarChart2 className="w-14 h-14 text-blue-600" />
                  </PremiumIcon>
                </div>
              </div>

              <div className="pointer-events-auto flex flex-col items-center">
                <div ref={icon2Ref}>
                  <PremiumIcon
                    className="w-28 h-28"
                    isCharging={chargingStates.icon2 && shouldAnimate}
                    onChargingComplete={() => onChargingComplete("icon2")}
                    delay={1}
                  >
                    <Sun className="w-14 h-14 text-amber-500" />
                  </PremiumIcon>
                </div>
              </div>

              <div className="pointer-events-auto flex flex-col items-center">
                <div ref={icon3Ref}>
                  <PremiumIcon
                    className="w-28 h-28"
                    isCharging={chargingStates.icon3 && shouldAnimate}
                    onChargingComplete={() => onChargingComplete("icon3")}
                    delay={1.5}
                  >
                    <Battery className="w-14 h-14 text-blue-500" />
                  </PremiumIcon>
                </div>
              </div>

              <div className="pointer-events-auto flex flex-col items-center">
                <div ref={icon4Ref}>
                  <PremiumIcon
                    className="w-28 h-28"
                    isCharging={chargingStates.icon4 && shouldAnimate}
                    onChargingComplete={() => onChargingComplete("icon4")}
                    delay={2}
                  >
                    <Zap className="w-14 h-14 text-blue-500" />
                  </PremiumIcon>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Circle */}
        <div className="pointer-events-auto">
          <div className="pt-8 pr-6 flex justify-center">
            <div ref={circleRef}>
              <CircularProgress
                percentage={energyOffset}
                isCharging={chargingStates.circle && shouldAnimate}
                onChargingComplete={() => onChargingComplete("circle")}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
