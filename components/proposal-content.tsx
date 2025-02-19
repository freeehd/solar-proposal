"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import HeroSection from "@/components/hero-section"
import EnergyUsageSection from "@/components/energy-usage-section"
import SolarDesignSection from "@/components/solar-design-section"
import StorageSection from "@/components/storage-section"
import EnvironmentalImpactSection from "@/components/environmental-impact-section"
import FinancingSection from "@/components/financing-section"
import SystemSummarySection from "@/components/system-summary-section"
import CallToActionSection from "@/components/call-to-action-section"
import { ThemeToggle } from "@/components/theme-toggle"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import ErrorBoundary from "@/components/error-boundary"
import { toast } from "@/components/ui/use-toast"
import WhySunStudios from "@/components/why-sun-studios"
import HowSolarWorksx from "@/components/how-solar-worksx"
import AppSection from "@/components/app-section"
import { Sun } from "lucide-react"

interface ProposalData {
    id: number
    name: string
    address: string
    averageRateKWh: string
    fixedCosts: string
    escalation: string
    monthlyBill: string
    numberOfSolarPanels: string
    yearlyEnergyProduced: string
    energyOffset: string
    solarPanelDesign: string
    batteryName: string
    inverterName: string
    operatingMode: string
    capacity: string
    outputKW: string
    cost: string
    backupAllocation: string
    batteryImage: string
    essentialsDays: string
    appliancesDays: string
    wholeHomeDays: string
    paybackPeriod: string
    totalSystemCost: string
    lifetimeSavings: string
    netCost: string
    incentives: string
    solarSystemModel: string
    solarSystemQuantity: string
    solarSystemPrice: string
    storageSystemModel: string
    storageSystemQuantity: string
    storageSystemPrice: string
    energyData: string
}

interface ProposalContentProps {
    proposalId?: string
    initialData?: Partial<ProposalData>
}

const defaultProposalData: ProposalData = {
    id: 0,
    name: "Guest",
    address: "123 Solar Street, Sunnyville, CA 90210",
    averageRateKWh: "0.15",
    fixedCosts: "0",
    escalation: "3",
    monthlyBill: "200",
    numberOfSolarPanels: "10",
    yearlyEnergyProduced: "10000",
    energyOffset: "80",
    solarPanelDesign: "/placeholder.svg",
    batteryName: "Default Battery",
    inverterName: "Default Inverter",
    operatingMode: "Standard",
    capacity: "10",
    outputKW: "5",
    cost: "10000",
    backupAllocation: "50",
    batteryImage: "/placeholder.svg",
    essentialsDays: "3",
    appliancesDays: "1",
    wholeHomeDays: "0.5",
    paybackPeriod: "7",
    totalSystemCost: "25000",
    lifetimeSavings: "50000",
    netCost: "15000",
    incentives: "2000",
    solarSystemModel: "Default Solar Model",
    solarSystemQuantity: "1",
    solarSystemPrice: "15000",
    storageSystemModel: "Default Storage Model",
    storageSystemQuantity: "1",
    storageSystemPrice: "10000",
    energyData: "",
}

const sections = [
    { id: "hero", title: "Home" },
    { id: "why-sun-studios", title: "Why Sun Studios" },
    { id: "app", title: "Mobile App" },
    { id: "how-solar-works", title: "How Solar Works" },
    { id: "energy-usage", title: "Energy Usage" },
    { id: "solar-design", title: "Solar Design" },
    { id: "storage", title: "Storage" },
    { id: "environmental-impact", title: "Environmental Impact" },
    { id: "financing", title: "Financing" },
    { id: "system-summary", title: "System Summary" },
]

export default function ProposalContent({ proposalId, initialData = {} }: ProposalContentProps) {
    const [proposalData, setProposalData] = useState<ProposalData>(() => {
        return { ...defaultProposalData, ...initialData }
    })
    const [activeSection, setActiveSection] = useState("hero")
    const sectionRefs = useRef<{ [key: string]: HTMLElement | null }>({})

    useEffect(() => {
        const fetchProposal = async () => {
            if (proposalId) {
                try {
                    const response = await fetch(`/api/proposals/${proposalId}`)
                    const data = await response.json()
                    if (data.success) {
                        console.log("Fetched proposal data:", data.proposal)
                        setProposalData((prevData) => ({
                            ...prevData,
                            ...data.proposal,
                            batteryName: data.proposal.battery_name || prevData.batteryName,
                            inverterName: data.proposal.inverter_name || prevData.inverterName,
                            batteryImage: data.proposal.battery_image || prevData.batteryImage,
                            operatingMode: data.proposal.operating_mode || prevData.operatingMode,
                            backupAllocation: data.proposal.backup_allocation || prevData.backupAllocation,
                            essentialsDays: data.proposal.essentials_days || prevData.essentialsDays,
                            appliancesDays: data.proposal.appliances_days || prevData.appliancesDays,
                            wholeHomeDays: data.proposal.whole_home_days || prevData.wholeHomeDays,
                            energyData: data.proposal.energy_data || prevData.energyData,
                        }))
                    } else {
                        toast({
                            title: "Error",
                            description: "Failed to fetch proposal details",
                            variant: "destructive",
                        })
                    }
                } catch (error) {
                    console.error("Error fetching proposal:", error)
                    toast({
                        title: "Error",
                        description: "Failed to fetch proposal details",
                        variant: "destructive",
                    })
                }
            } else {
                const storedData = localStorage.getItem("solarProposalData")
                if (storedData) {
                    try {
                        const parsedData = JSON.parse(storedData)
                        console.log("Parsed stored data:", parsedData)
                        setProposalData((prevData) => ({ ...prevData, ...parsedData }))
                    } catch (error) {
                        console.error("Error parsing stored data:", error)
                    }
                }
            }
        }

        fetchProposal()
    }, [proposalId])

    useEffect(() => {
        console.log("Current proposalData:", proposalData)
    }, [proposalData])

    useEffect(() => {
        if (!proposalId) {
            localStorage.setItem("solarProposalData", JSON.stringify(proposalData))
        }
    }, [proposalData, proposalId])

    useEffect(() => {
        const handleScroll = () => {
            const scrollPosition = window.scrollY + window.innerHeight / 2

            for (const section of sections) {
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
    }, [])

    const scrollTo = (id: string) => {
        const element = sectionRefs.current[id]
        if (element) {
            element.scrollIntoView({ behavior: "smooth" })
        }
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setProposalData((prevData) => ({ ...prevData, [name]: value }))
    }

    return (
        <div className="text-foreground bg-background">
            <nav className="fixed top-0 right-0 h-screen z-50 flex items-center">
                <ul className="space-y-4 p-4">
                    {sections.map((section) => (
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

            <div className="fixed top-4 left-4 z-50">
                <ThemeToggle />
            </div>

            <ErrorBoundary fallback={<div>Error loading Hero section</div>}>
                <div
                    ref={(el: HTMLDivElement | null) => {
                        if (el) sectionRefs.current.hero = el
                    }}
                >
                    <HeroSection name={proposalData.name} address={proposalData.address} />
                </div>
            </ErrorBoundary>
            <ErrorBoundary fallback={<div>Error loading Why Sun Studios section</div>}>
                <div
                    ref={(el: HTMLDivElement | null) => {
                        if (el) sectionRefs.current["why-sun-studios"] = el
                    }}
                >
                    <WhySunStudios />
                </div>
            </ErrorBoundary>
            <ErrorBoundary fallback={<div>Error loading App section</div>}>
                <div
                    ref={(el: HTMLDivElement | null) => {
                        if (el) sectionRefs.current.app = el
                    }}
                >
                    <AppSection />
                </div>
            </ErrorBoundary>
            <ErrorBoundary fallback={<div>Error loading How Solar Works section</div>}>
                <div
                    ref={(el: HTMLDivElement | null) => {
                        if (el) sectionRefs.current["how-solar-works"] = el
                    }}
                >
                    <HowSolarWorksx />
                </div>
            </ErrorBoundary>
            <ErrorBoundary fallback={<div>Error loading Energy Usage section</div>}>
                <div
                    ref={(el: HTMLDivElement | null) => {
                        if (el) sectionRefs.current["energy-usage"] = el
                    }}
                >
                    <EnergyUsageSection
                        proposalData={{
                            monthlyBill: proposalData.monthlyBill,
                            averageRateKWh: proposalData.averageRateKWh,
                            escalation: proposalData.escalation,
                            energyData: proposalData.energyData,
                        }}
                    />
                    {!proposalId && (
                        <div className="container mx-auto px-4 mt-8">
                            <div>
                                <Label htmlFor="monthlyBill">Monthly Bill ($)</Label>
                                <Input
                                    id="monthlyBill"
                                    name="monthlyBill"
                                    type="number"
                                    value={proposalData.monthlyBill}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div>
                                <Label htmlFor="averageRateKWh">Average Rate ($/kWh)</Label>
                                <Input
                                    id="averageRateKWh"
                                    name="averageRateKWh"
                                    type="number"
                                    value={proposalData.averageRateKWh}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </ErrorBoundary>
            <ErrorBoundary fallback={<div>Error loading Solar Design section</div>}>
                <div
                    ref={(el: HTMLDivElement | null) => {
                        if (el) sectionRefs.current["solar-design"] = el
                    }}
                >
                    <SolarDesignSection
                        proposalData={{
                            numberOfSolarPanels: proposalData.numberOfSolarPanels,
                            yearlyEnergyProduced: proposalData.yearlyEnergyProduced,
                            energyOffset: proposalData.energyOffset,
                            solarPanelDesign: proposalData.solarPanelDesign,
                        }}
                    />

                </div>
            </ErrorBoundary>
            <ErrorBoundary fallback={<div>Error loading Storage section</div>}>
                <div
                    ref={(el: HTMLDivElement | null) => {
                        if (el) sectionRefs.current.storage = el
                    }}
                >
                    <StorageSection
                        proposalData={{
                            batteryName: proposalData.batteryName,
                            inverterName: proposalData.inverterName,
                            capacity: proposalData.capacity,
                            outputKW: proposalData.outputKW,
                            operatingMode: proposalData.operatingMode,
                            backupAllocation: proposalData.backupAllocation,
                            batteryImage: proposalData.batteryImage,
                            essentialsDays: proposalData.essentialsDays,
                            appliancesDays: proposalData.appliancesDays,
                            wholeHomeDays: proposalData.wholeHomeDays,
                        }}
                    />
                </div>
            </ErrorBoundary>
            <ErrorBoundary fallback={<div>Error loading Environmental Impact section</div>}>
                <div
                    ref={(el: HTMLDivElement | null) => {
                        if (el) sectionRefs.current["environmental-impact"] = el
                    }}
                >
                    <EnvironmentalImpactSection />
                </div>
            </ErrorBoundary>
            <ErrorBoundary fallback={<div>Error loading Financing section</div>}>
                <div
                    ref={(el: HTMLDivElement | null) => {
                        if (el) sectionRefs.current.financing = el
                    }}
                >
                    <FinancingSection
                        proposalData={{
                            paybackPeriod: proposalData.paybackPeriod,
                            totalSystemCost: proposalData.totalSystemCost,
                            lifetimeSavings: proposalData.lifetimeSavings,
                            netCost: proposalData.netCost,
                            monthlyBill: proposalData.monthlyBill,
                            escalation: proposalData.escalation,
                        }}
                    />
                </div>
            </ErrorBoundary>
            <ErrorBoundary fallback={<div>Error loading System Summary section</div>}>
                <div
                    ref={(el: HTMLDivElement | null) => {
                        if (el) sectionRefs.current["system-summary"] = el
                    }}
                >
                    <SystemSummarySection
                        proposalData={{
                            solarSystemModel: proposalData.solarSystemModel,
                            solarSystemQuantity: proposalData.solarSystemQuantity,
                            solarSystemPrice: proposalData.solarSystemPrice,
                            storageSystemModel: proposalData.storageSystemModel,
                            storageSystemQuantity: proposalData.storageSystemQuantity,
                            storageSystemPrice: proposalData.storageSystemPrice,
                            incentives: proposalData.incentives,
                        }}
                    />
                </div>
            </ErrorBoundary>
            <ErrorBoundary fallback={<div>Error loading Call to Action section</div>}>
                <CallToActionSection />
            </ErrorBoundary>
        </div>
    )
}

