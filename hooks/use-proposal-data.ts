"use client"

import type React from "react"

import { useState, useEffect, useCallback, useRef } from "react"
import { toast } from "@/components/ui/use-toast"

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
export interface ProposalData {
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

// Update default data to use snake_case
export const defaultProposalData: ProposalData = {
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

interface UseProposalDataProps {
  proposalId?: string
  initialData?: Partial<ProposalData>
  onProgress?: (progress: number) => void
}

interface UseProposalDataResult {
  proposalData: ProposalData
  visibleSections: SectionVisibility
  dataLoaded: boolean
  loadingProgress: number
  setProposalData: React.Dispatch<React.SetStateAction<ProposalData>>
  toggleSectionVisibility: (sectionId: keyof SectionVisibility) => void
  refreshProposal: () => Promise<void>
}

export function useProposalData({
  proposalId,
  initialData = {},
  onProgress,
}: UseProposalDataProps): UseProposalDataResult {
  const [proposalData, setProposalData] = useState<ProposalData>(() => {
    return { ...defaultProposalData, ...initialData }
  })
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
  const [dataLoaded, setDataLoaded] = useState(false)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const isMountedRef = useRef(true)
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Update progress and notify parent
  const updateProgress = useCallback(
    (progress: number) => {
      if (!isMountedRef.current) return

      // Ensure progress is a valid number between 0-100
      const validProgress = Math.max(0, Math.min(100, isNaN(progress) ? 0 : progress))

      setLoadingProgress(validProgress)
      if (onProgress) onProgress(validProgress)
    },
    [onProgress],
  )

  // Toggle section visibility
  const toggleSectionVisibility = useCallback((sectionId: keyof SectionVisibility) => {
    setVisibleSections((prev) => {
      const updated = { ...prev, [sectionId]: !prev[sectionId] }

      // Update proposal data with new visibility settings
      setProposalData((current) => ({
        ...current,
        section_visibility: updated,
      }))

      return updated
    })
  }, [])

  // Function to fetch proposal data
  const fetchProposal = useCallback(async () => {
    // Clear any existing timeout
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current)
      loadingTimeoutRef.current = null
    }

    // Reset loading state
    setDataLoaded(false)
    updateProgress(0)

    // Set a timeout to ensure loading eventually completes
    loadingTimeoutRef.current = setTimeout(() => {
      if (!isMountedRef.current) return

      if (!dataLoaded) {
        console.warn("Force completing data loading after timeout")
        setDataLoaded(true)
        updateProgress(100)
      }
    }, 10000)

    if (proposalId) {
      try {
        // Set initial progress for data fetching
        updateProgress(5)

        const response = await fetch(`/api/proposals/${proposalId}`)
        updateProgress(20) // Update progress after fetch starts

        const data = await response.json()
        updateProgress(40) // Update progress after data is received

        if (data.success) {
          console.log("Fetched proposal data:", data.proposal)
          updateProgress(60) // Update progress after data is processed

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

          if (isMountedRef.current) {
            setVisibleSections(sectionVisibility || defaultProposalData.section_visibility)

            // Set proposal data directly from API response (all snake_case)
            setProposalData((prevData) => ({
              ...prevData,
              ...data.proposal,
              section_visibility: sectionVisibility,
            }))

            updateProgress(80) // Update progress after data is set

            // Add a small delay before marking as complete for smoother UX
            setTimeout(() => {
              if (!isMountedRef.current) return

              // Mark data as loaded
              setDataLoaded(true)
              updateProgress(100) // Final progress update
            }, 300)
          }
        } else {
          toast({
            title: "Error",
            description: "Failed to fetch proposal details",
            variant: "destructive",
          })

          if (isMountedRef.current) {
            // Even on error, we should stop showing the loading state
            setDataLoaded(true)
            updateProgress(100) // Final progress update on error
          }
        }
      } catch (error) {
        console.error("Error fetching proposal:", error)
        toast({
          title: "Error",
          description: "Failed to fetch proposal details",
          variant: "destructive",
        })

        if (isMountedRef.current) {
          // Even on error, we should stop showing the loading state
          setDataLoaded(true)
          updateProgress(100) // Final progress update on error
        }
      }
    } else {
      // Set initial progress for local storage loading
      updateProgress(20)

      const storedData = localStorage.getItem("solarProposalData")
      if (storedData) {
        try {
          const parsedData = JSON.parse(storedData)
          console.log("Parsed stored data:", parsedData)

          if (isMountedRef.current) {
            // Extract section visibility if it exists
            if (parsedData.section_visibility) {
              setVisibleSections(parsedData.section_visibility)
            }

            setProposalData((prevData) => ({ ...prevData, ...parsedData }))
            updateProgress(80) // Update progress after data is set
          }
        } catch (error) {
          console.error("Error parsing stored data:", error)
        }
      }

      // Add a small delay for smoother UX
      setTimeout(() => {
        if (!isMountedRef.current) return

        // Mark data as loaded for localStorage case
        setDataLoaded(true)
        updateProgress(100) // Final progress update
      }, 300)
    }
  }, [proposalId, updateProgress])

  // Expose refresh function
  const refreshProposal = useCallback(async () => {
    await fetchProposal()
  }, [fetchProposal])

  // Load proposal data on mount
  useEffect(() => {
    isMountedRef.current = true
    fetchProposal()

    return () => {
      isMountedRef.current = false
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current)
        loadingTimeoutRef.current = null
      }
    }
  }, [fetchProposal])

  // Save proposal data to localStorage when it changes (if not using proposalId)
  useEffect(() => {
    if (!proposalId && dataLoaded) {
      localStorage.setItem("solarProposalData", JSON.stringify(proposalData))
    }
  }, [proposalData, proposalId, dataLoaded])

  return {
    proposalData,
    visibleSections,
    dataLoaded,
    loadingProgress,
    setProposalData,
    toggleSectionVisibility,
    refreshProposal,
  }
}

