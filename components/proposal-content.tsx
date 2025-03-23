"use client"

import type React from "react"

import { useEffect, useState, useRef, useCallback } from "react"
import HeroSection from "@/components/hero-section"
import EnergyUsageSection from "@/components/energy-usage-section"
import SolarDesignSection from "@/components/solar-design-section"
import EnvironmentalImpactSection from "@/components/environmental-impact-section"
import FinancingSection from "@/components/financing-section"
import SystemSummarySection from "@/components/system-summary-section"
import CallToActionSection from "@/components/call-to-action-section"
import { ThemeToggle } from "@/components/theme-toggle"
import ErrorBoundary from "@/components/error-boundary"
import WhySunStudios from "@/components/why-sun-studios"
import HowSolarWorksx from "@/components/how-solar-worksx"
import AppSection from "@/components/app-section"
import LoadingScreen from "@/components/ui/loading-screen"
import { Sun, EyeOff } from "lucide-react"
import { useProposalData, type ProposalData } from "@/hooks/use-proposal-data"
import { preloadAllAssets, addProgressListener, areAllAssetsLoaded } from "@/utils/asset-preloader"

// Start preloading assets as early as possible
if (typeof window !== "undefined") {
  preloadAllAssets().catch((error) => {
    console.warn("Error during initial asset preloading:", error)
  })
}

interface ProposalContentProps {
  proposalId?: string
  initialData?: Partial<ProposalData>
}

// Define sections with their IDs and titles
const sections = [
  { id: "hero", title: "Home" },
  { id: "whySunStudios", title: "Why Sun Studios" },
  { id: "app", title: "Mobile App" },
  { id: "howSolarWorks", title: "How Solar Works" },
  { id: "energyUsage", title: "Energy Usage" },
  { id: "solarDesign", title: "Solar Design" },
  { id: "storage", title: "Storage" },
  { id: "environmentalImpact", title: "Environmental Impact" },
  { id: "financing", title: "Financing" },
  { id: "systemSummary", title: "System Summary" },
  { id: "callToAction", title: "Call to Action" },
]

export default function ProposalContent({ proposalId, initialData = {} }: ProposalContentProps) {
  const [activeSection, setActiveSection] = useState("hero")
  const sectionRefs = useRef<{ [key: string]: HTMLElement | null }>({})
  const [isLoading, setIsLoading] = useState(true)
  const [assetProgress, setAssetProgress] = useState({
    starModel: 0,
    video: 0,
  })

  // Use our hook for proposal data
  const {
    proposalData,
    visibleSections,
    dataLoaded,
    setProposalData,
    loadingProgress: dataProgress,
  } = useProposalData({
    proposalId,
    initialData,
  })

  // Handle loading completion
  const handleLoadingComplete = useCallback(() => {
    setIsLoading(false)
  }, [])

  // Track asset loading progress
  useEffect(() => {
    const removeListener = addProgressListener((type, progress) => {
      setAssetProgress((prev) => ({
        ...prev,
        [type]: progress,
      }))
    })

    return () => removeListener()
  }, [])

  // Calculate overall progress for loading screen
  const getOverallProgress = useCallback(() => {
    // If data is loaded and assets are loaded, return 100%
    if (dataLoaded && areAllAssetsLoaded()) {
      return 100
    }

    // Weight: 40% data, 30% star model, 30% video
    const dataProgressValue = typeof dataProgress === "number" ? dataProgress : 0
    const starModelProgressValue = typeof assetProgress.starModel === "number" ? assetProgress.starModel : 0
    const videoProgressValue = typeof assetProgress.video === "number" ? assetProgress.video : 0

    // Calculate weighted average
    const calculatedProgress = Math.round(
      dataProgressValue * 0.4 + starModelProgressValue * 0.3 + videoProgressValue * 0.3,
    )

    // Ensure we return a value between 0-100
    return Math.max(0, Math.min(100, calculatedProgress))
  }, [dataProgress, assetProgress.starModel, assetProgress.video, dataLoaded])

  // Check if everything is loaded and hide loading screen
  useEffect(() => {
    // Only hide loading when both data and assets are loaded
    if (dataLoaded && areAllAssetsLoaded()) {
      // We don't immediately set isLoading to false
      // Instead, we let the LoadingScreen component handle its own fade-out
      // The onLoadingComplete callback will set isLoading to false after animation completes

      // Force hide loader after a maximum time (15 seconds) as a fallback
      const forceHideTimeout = setTimeout(() => {
        if (isLoading) {
          console.warn("Force hiding loader after timeout")
          setIsLoading(false)
        }
      }, 15000)

      return () => clearTimeout(forceHideTimeout)
    }
  }, [dataLoaded, isLoading])

  // Handle scroll position for navigation
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight / 2

      // Only check visible sections
      const visibleSectionsList = sections.filter(
        (section) => visibleSections[section.id as keyof typeof visibleSections],
      )

      for (const section of visibleSectionsList) {
        const element = sectionRefs.current[section.id]
        if (element) {
          const { offsetTop, offsetHeight } = element
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section.id)
            break
          }
        }
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [visibleSections])

  const scrollTo = (id: string) => {
    // Special case for storage section - scroll to solar design
    if (id === "storage") {
      const element = sectionRefs.current["solarDesign"]
      if (element) {
        // Scroll to solar design section and add offset to reach the storage part
        element.scrollIntoView({ behavior: "smooth" })
        setTimeout(() => {
          window.scrollBy({ top: 1000, behavior: "smooth" })
        }, 500)
      }
      return
    }

    const element = sectionRefs.current[id]
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setProposalData((prevData) => ({ ...prevData, [name]: value }))
  }

  // Filter visible sections for navigation
  const visibleSectionsList = sections.filter((section) => visibleSections[section.id as keyof typeof visibleSections])

  return (
    <div className="text-foreground bg-background">
      {/* Centralized loading screen - only place we show loading UI */}
      {isLoading && (
        <LoadingScreen
          onLoadingComplete={() => {
            // This callback is triggered after the fade-out animation completes
            setIsLoading(false)
          }}
          progress={getOverallProgress()}
        />
      )}

      {visibleSectionsList.length > 0 && (
        <nav className="fixed top-0 right-0 h-screen z-50 flex items-center">
          <ul className="space-y-4 p-4">
            {visibleSectionsList.map((section) => (
              <li key={section.id}>
                <button
                  onClick={() => scrollTo(section.id)}
                  className="w-6 h-6 flex items-center justify-center transition-all duration-300 relative"
                  aria-label={section.title}
                >
                  <span
                    className={`absolute inset-0 transition-all duration-300 ${
                      activeSection === section.id ? "opacity-100 scale-100" : "opacity-0 scale-0"
                    }`}
                  >
                    <Sun className="w-5 h-5 text-yellow-400" />
                  </span>
                  <span
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      activeSection === section.id
                        ? "opacity-0 scale-0"
                        : "opacity-100 scale-100 bg-gray-400 hover:bg-yellow-200"
                    }`}
                  />
                </button>
              </li>
            ))}
          </ul>
        </nav>
      )}
{/* 
      <div className="fixed top-4 left-4 z-50">
        <ThemeToggle />
      </div> */}

      {/* Render sections based on visibility settings */}
      {visibleSections.hero && (
        <ErrorBoundary fallback={<div>Error loading Hero section</div>}>
          <div
            ref={(el: HTMLDivElement | null) => {
              if (el) sectionRefs.current.hero = el
            }}
          >
            <HeroSection name={proposalData.name} address={proposalData.address} />
          </div>
        </ErrorBoundary>
      )}

      {/* Rest of the sections remain unchanged */}
      {visibleSections.whySunStudios && (
        <ErrorBoundary fallback={<div>Error loading Why Sun Studios section</div>}>
          <div
            ref={(el: HTMLDivElement | null) => {
              if (el) sectionRefs.current.whySunStudios = el
            }}
          >
            <WhySunStudios />
          </div>
        </ErrorBoundary>
      )}

      {visibleSections.app && (
        <ErrorBoundary fallback={<div>Error loading App section</div>}>
          <div
            ref={(el: HTMLDivElement | null) => {
              if (el) sectionRefs.current.app = el
            }}
          >
            <AppSection />
          </div>
        </ErrorBoundary>
      )}

      {visibleSections.howSolarWorks && (
        <ErrorBoundary fallback={<div>Error loading How Solar Works section</div>}>
          <div
            ref={(el: HTMLDivElement | null) => {
              if (el) sectionRefs.current.howSolarWorks = el
            }}
          >
            <HowSolarWorksx />
          </div>
        </ErrorBoundary>
      )}

      {visibleSections.energyUsage && (
        <ErrorBoundary fallback={<div>Error loading Energy Usage section</div>}>
          <div
            ref={(el: HTMLDivElement | null) => {
              if (el) sectionRefs.current.energyUsage = el
            }}
          >
            <EnergyUsageSection
              proposalData={{
                monthly_bill: proposalData.monthly_bill,
                average_rate_kwh: proposalData.average_rate_kwh,
                escalation: proposalData.escalation,
                energy_data: proposalData.energy_data,
              }}
            />
          </div>
        </ErrorBoundary>
      )}

      {visibleSections.solarDesign && (
        <ErrorBoundary fallback={<div>Error loading Solar Design section</div>}>
          <div
            ref={(el: HTMLDivElement | null) => {
              if (el) sectionRefs.current.solarDesign = el
            }}
          >
            <SolarDesignSection
              proposalData={{
                number_of_solar_panels: proposalData.number_of_solar_panels,
                yearly_energy_produced: proposalData.yearly_energy_produced,
                yearly_energy_usage: proposalData.yearly_energy_produced,
                energy_offset: proposalData.energy_offset,
                solar_panel_size: proposalData.number_of_solar_panels,
                lifetime_savings: proposalData.lifetime_savings,
                solar_panel_design: proposalData.solar_panel_design,
                // Add storage section props - only show if storage section is visible
                battery_name: visibleSections.storage ? proposalData.battery_name : "",
                inverter_name: visibleSections.storage ? proposalData.inverter_name : "",
                capacity: visibleSections.storage ? proposalData.capacity : "",
                output_kw: visibleSections.storage ? proposalData.output_kw : "",
                operating_mode: visibleSections.storage ? proposalData.operating_mode : "",
                backup_allocation: visibleSections.storage ? proposalData.backup_allocation : "",
                battery_image: visibleSections.storage ? proposalData.battery_image : "",
                essentials_days: visibleSections.storage ? proposalData.essentials_days : "",
                appliances_days: visibleSections.storage ? proposalData.appliances_days : "",
                whole_home_days: visibleSections.storage ? proposalData.whole_home_days : "",
              }}
            />
          </div>
        </ErrorBoundary>
      )}

      {visibleSections.environmentalImpact && (
        <ErrorBoundary fallback={<div>Error loading Environmental Impact section</div>}>
          <div
            ref={(el: HTMLDivElement | null) => {
              if (el) sectionRefs.current.environmentalImpact = el
            }}
          >
            <EnvironmentalImpactSection />
          </div>
        </ErrorBoundary>
      )}

      {visibleSections.financing && (
        <ErrorBoundary fallback={<div>Error loading Financing section</div>}>
          <div
            ref={(el: HTMLDivElement | null) => {
              if (el) sectionRefs.current.financing = el
            }}
          >
            <FinancingSection
              proposalData={{
                payback_period: proposalData.payback_period,
                total_system_cost: proposalData.total_system_cost,
                lifetime_savings: proposalData.lifetime_savings,
                net_cost: proposalData.net_cost,
                monthly_bill: proposalData.monthly_bill,
                escalation: proposalData.escalation,
              }}
            />
          </div>
        </ErrorBoundary>
      )}

      {visibleSections.systemSummary && (
        <ErrorBoundary fallback={<div>Error loading System Summary section</div>}>
          <div
            ref={(el: HTMLDivElement | null) => {
              if (el) sectionRefs.current.systemSummary = el
            }}
          >
            <SystemSummarySection
              proposalData={{
                solar_system_model: proposalData.solar_system_model,
                solar_system_quantity: proposalData.solar_system_quantity,
                solar_system_price: proposalData.solar_system_price,
                storage_system_model: proposalData.storage_system_model,
                storage_system_quantity: proposalData.storage_system_quantity,
                storage_system_price: proposalData.storage_system_price,
                incentives: proposalData.incentives,
              }}
            />
          </div>
        </ErrorBoundary>
      )}

      {visibleSections.callToAction && (
        <ErrorBoundary fallback={<div>Error loading Call to Action section</div>}>
          <div
            ref={(el: HTMLDivElement | null) => {
              if (el) sectionRefs.current.callToAction = el
            }}
          >
            <CallToActionSection />
          </div>
        </ErrorBoundary>
      )}

      {/* Show message if no sections are visible */}
      {Object.values(visibleSections).every((value) => !value) && (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center p-8 max-w-md">
            <EyeOff className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h2 className="text-2xl font-bold mb-2">No Visible Sections</h2>
            <p className="text-gray-500">
              All sections have been hidden. Please edit the proposal and enable at least one section to display.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

