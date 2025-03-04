"use client"

import React from "react"
import { BarChart2, Sun, Battery, Zap } from "lucide-react"
import { PremiumIcon } from "./premium-icon"
import { CircularProgress } from "./ui/circular-progress"

interface IconPortalLayerProps {
  icon1Ref: React.RefObject<HTMLDivElement>
  icon2Ref: React.RefObject<HTMLDivElement>
  icon3Ref: React.RefObject<HTMLDivElement>
  icon4Ref: React.RefObject<HTMLDivElement>
  circleRef: React.RefObject<HTMLDivElement>
  chargingStates: {
    icon1: boolean
    icon2: boolean
    icon3: boolean
    icon4: boolean
    circle: boolean
  }
  onChargingComplete: (key: string) => void
  energyOffset: number
  containerRef: React.RefObject<HTMLElement>
  shouldAnimate: boolean
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
  React.useEffect(() => {
    const updatePosition = () => {
      const cardsSection = document.getElementById("cards-section")
      if (cardsSection) {
        const rect = cardsSection.getBoundingClientRect()
        const portalContainer = document.querySelector("[data-portal-container]")
        if (portalContainer) {
          portalContainer.style.top = `${rect.top + window.scrollY}px`
        }
      }
    }

    updatePosition()
    window.addEventListener("resize", updatePosition)
    window.addEventListener("scroll", updatePosition)

    return () => {
      window.removeEventListener("resize", updatePosition)
      window.removeEventListener("scroll", updatePosition)
    }
  }, [])

  return (
    <div
      className="absolute inset-0 pointer-events-none"
      data-portal-container
      style={
        {
          "--portal-z-index": "100",
          zIndex: "var(--portal-z-index)",
        } as React.CSSProperties
      }
    >
      {/* Position relative to the cards section */}
      <div className="absolute top-[calc(50vh+18rem)] left-0 right-0">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* Left card with icons */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center justify-center min-h-[320px]">
                <div className="grid grid-cols-2 md:grid-cols-4  gap-y-12 w-full px-4">
                  {/* Premium Icons */}
                  <div className="flex pl-2 flex-col items-center justify-center">
                    <div ref={icon1Ref} className="flex items-center justify-center h-[112px]">
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

                  <div className="flex pl-2 flex-col items-center justify-center">
                    <div ref={icon2Ref} className="flex items-center justify-center h-[112px]">
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

                  <div className="flex flex-col items-center justify-center">
                    <div ref={icon3Ref} className="flex items-center justify-center h-[112px]">
                      <PremiumIcon
                        className="w-28 h-28"
                        isCharging={chargingStates.icon3 && shouldAnimate}
                        onChargingComplete={() => onChargingComplete("icon3")}
                        delay={1.5}
                      >
                        <Battery className="w-14 h-14 text-blue-600" />
                      </PremiumIcon>
                    </div>
                  </div>

                  <div className="flex flex-col items-center justify-center">
                    <div ref={icon4Ref} className="flex items-center justify-center h-[112px]">
                      <PremiumIcon
                        className="w-28 h-28"
                        isCharging={chargingStates.icon4 && shouldAnimate}
                        onChargingComplete={() => onChargingComplete("icon4")}
                        delay={2}
                      >
                        <Zap className="w-14 h-14 text-blue-600" />
                      </PremiumIcon>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right card with circle */}
            <div className="pointer-events-auto">
              <div className="flex items-center justify-center min-h-[320px]">
                <div ref={circleRef} className="flex items-center justify-center h-[208px]">
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
      </div>
    </div>
  )
}

