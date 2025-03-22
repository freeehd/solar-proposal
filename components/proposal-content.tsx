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
import { toast } from "@/components/ui/use-toast"
import WhySunStudios from "@/components/why-sun-studios"
import HowSolarWorksx from "@/components/how-solar-worksx"
import AppSection from "@/components/app-section"
import Loading from "@/components/ui/loading"
import { Sun, EyeOff } from "lucide-react"

interface SectionVisibility {
  hero: boolean
  whySunStudios: boolean
  app: boolean
  howSolarWorks: boolean
  energyUsage: boolean
  solarDesign: boolean
  storage: boolean
  environmentalImpact: boolean
  financing: boolean
  systemSummary: boolean
  callToAction: boolean
}

// Update interface to use only snake_case properties
interface ProposalData {
  id: number
  name: string
  address: string
  average_rate_kwh: string
  fixed_costs: string
  escalation: string
  monthly_bill: string
  number_of_solar_panels: string
  yearly_energy_produced: string
  energy_offset: string
  solar_panel_design: string
  battery_name: string
  inverter_name: string
  operating_mode: string
  capacity: string
  output_kw: string
  cost: string
  backup_allocation: string
  battery_image: string
  essentials_days: string
  appliances_days: string
  whole_home_days: string
  payback_period: string
  total_system_cost: string
  lifetime_savings: string
  net_cost: string
  incentives: string
  solar_system_model: string
  solar_system_quantity: string
  solar_system_price: string
  storage_system_model: string
  storage_system_quantity: string
  storage_system_price: string
  energy_data: string
  section_visibility?: SectionVisibility
}

interface ProposalContentProps {
  proposalId?: string
  initialData?: Partial<ProposalData>
}

// Update default data to use snake_case
const defaultProposalData: ProposalData = {
  id: 0,
  name: "Guest",
  address: "123 Solar Street, Sunnyville, CA 90210",
  average_rate_kwh: "0.15",
  fixed_costs: "0",
  escalation: "3",
  monthly_bill: "200",
  number_of_solar_panels: "10",
  yearly_energy_produced: "10000",
  energy_offset: "80",
  solar_panel_design: "/placeholder.svg",
  battery_name: "Default Battery",
  inverter_name: "Default Inverter",
  operating_mode: "Standard",
  capacity: "10",
  output_kw: "5",
  cost: "10000",
  backup_allocation: "50",
  battery_image: "/placeholder.svg",
  essentials_days: "3",
  appliances_days: "1",
  whole_home_days: "0.5",
  payback_period: "7",
  total_system_cost: "25000",
  lifetime_savings: "50000",
  net_cost: "15000",
  incentives: "2000",
  solar_system_model: "Default Solar Model",
  solar_system_quantity: "1",
  solar_system_price: "15000",
  storage_system_model: "Default Storage Model",
  storage_system_quantity: "1",
  storage_system_price: "10000",
  energy_data: `Jan	Feb	Mar	Apr	May	Jun	Jul	Aug	Sep	Oct	Nov	Dec
Energy usage (kWh)	973	844	916	932	1,029	1,171	1,521	800	1,700	1,060	1,060	1,440
New system production (kWh)	867	1,128	1,624	1,837	2,006	2,119	2,131	2,034	1,759	1,475	1,093	784`,
  section_visibility: {
    hero: true,
    whySunStudios: true,
    app: true,
    howSolarWorks: true,
    energyUsage: true,
    solarDesign: true,
    storage: true,
    environmentalImpact: true,
    financing: true,
    systemSummary: true,
    callToAction: false,
  },
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
  const [proposalData, setProposalData] = useState<ProposalData>(() => {
    return { ...defaultProposalData, ...initialData }
  })
  const [activeSection, setActiveSection] = useState("hero")
  const sectionRefs = useRef<{ [key: string]: HTMLElement | null }>({})
  const [visibleSections, setVisibleSections] = useState<SectionVisibility>(
    defaultProposalData.section_visibility || {
      hero: true,
      whySunStudios: true,
      app: true,
      howSolarWorks: true,
      energyUsage: true,
      solarDesign: true,
      storage: true,
      environmentalImpact: true,
      financing: true,
      systemSummary: true,
      callToAction: false,
    },
  )

  // Add loading state
  const [isLoading, setIsLoading] = useState(true)
  const [dataLoaded, setDataLoaded] = useState(false)
  const [heroReady, setHeroReady] = useState(false)
  const [videoLoadProgress, setVideoLoadProgress] = useState(0) // New state for video loading progress
  const [starModelLoaded, setStarModelLoaded] = useState(false)

  // Add this function to check if all assets are loaded
  const checkAllAssetsLoaded = useCallback(() => {
    return dataLoaded && heroReady && videoLoadProgress >= 90
  }, [dataLoaded, heroReady, videoLoadProgress])

  useEffect(() => {
    const fetchProposal = async () => {
      if (proposalId) {
        try {
          // Set initial progress for data fetching
          setVideoLoadProgress(5)

          const response = await fetch(`/api/proposals/${proposalId}`)
          setVideoLoadProgress(10) // Update progress after fetch starts

          const data = await response.json()
          if (data.success) {
            console.log("Fetched proposal data:", data.proposal)

            // Extract section visibility if it exists
            let sectionVisibility = defaultProposalData.section_visibility
            try {
              if (data.proposal.section_visibility) {
                if (typeof data.proposal.section_visibility === "string") {
                  sectionVisibility = JSON.parse(data.proposal.section_visibility)
                } else {
                  sectionVisibility = data.proposal.section_visibility
                }
              }
            } catch (error) {
              console.error("Error parsing section visibility:", error)
            }

            setVisibleSections(sectionVisibility || defaultProposalData.section_visibility)

            // Set proposal data directly from API response (all snake_case)
            setProposalData((prevData) => ({
              ...prevData,
              ...data.proposal,
              section_visibility: sectionVisibility,
            }))

            // Mark data as loaded
            setDataLoaded(true)
          } else {
            toast({
              title: "Error",
              description: "Failed to fetch proposal details",
              variant: "destructive",
            })
            // Even on error, we should stop showing the loading state
            setDataLoaded(true)
          }
        } catch (error) {
          console.error("Error fetching proposal:", error)
          toast({
            title: "Error",
            description: "Failed to fetch proposal details",
            variant: "destructive",
          })
          // Even on error, we should stop showing the loading state
          setDataLoaded(true)
        }
      } else {
        const storedData = localStorage.getItem("solarProposalData")
        if (storedData) {
          try {
            const parsedData = JSON.parse(storedData)
            console.log("Parsed stored data:", parsedData)

            // Extract section visibility if it exists
            if (parsedData.section_visibility) {
              setVisibleSections(parsedData.section_visibility)
            }

            setProposalData((prevData) => ({ ...prevData, ...parsedData }))
          } catch (error) {
            console.error("Error parsing stored data:", error)
          }
        }

        // Mark data as loaded for localStorage case
        setDataLoaded(true)
      }
    }

    fetchProposal()
  }, [proposalId])

  // Handle video loading progress updates
  const handleVideoProgress = (progress: number) => {
    // Only update if the new progress is higher than the current one
    setVideoLoadProgress((current) => Math.max(current, progress))
  }

  // Check if both data and hero are ready to hide the loader
  useEffect(() => {
    if (checkAllAssetsLoaded()) {
      // Add a longer delay to ensure everything is rendered
      const timer = setTimeout(() => {
        setIsLoading(false)
      }, 800)

      return () => clearTimeout(timer)
    }
  }, [checkAllAssetsLoaded])

  useEffect(() => {
    console.log("Current proposalData:", proposalData)
    console.log("Visible sections:", visibleSections)
  }, [proposalData, visibleSections])

  useEffect(() => {
    if (!proposalId) {
      localStorage.setItem("solarProposalData", JSON.stringify(proposalData))
    }
  }, [proposalData, proposalId])

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

  // Handle hero section ready state
  const handleHeroReady = () => {
    setHeroReady(true)
  }

  // Filter visible sections for navigation
  const visibleSectionsList = sections.filter((section) => visibleSections[section.id as keyof typeof visibleSections])

  return (
    <div className="text-foreground bg-background">
      {/* Loading overlay - now with progress from video loading */}
      <Loading isLoading={isLoading} progress={videoLoadProgress} />

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

      <div className="fixed top-4 left-4 z-50">
        <ThemeToggle />
      </div>

      {/* Render sections based on visibility settings */}
      {visibleSections.hero && (
        <ErrorBoundary fallback={<div>Error loading Hero section</div>}>
          <div
            ref={(el: HTMLDivElement | null) => {
              if (el) sectionRefs.current.hero = el
            }}
          >
            <HeroSection
              name={proposalData.name}
              address={proposalData.address}
              onReady={handleHeroReady}
              onProgress={handleVideoProgress} // Pass the progress handler
            />
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

