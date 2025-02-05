"use client"

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
}

const sections = [
    { id: "hero", title: "Home" },
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
                        setProposalData((prevData) => ({ ...prevData, ...data.proposal }))
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
                        setProposalData((prevData) => ({ ...prevData, ...parsedData }))
                    } catch (error) {
                        console.error("Error parsing stored data:", error)
                    }
                }
            }
        }
        fetchProposal().catch((error) => {
            console.error("Failed to execute fetchProposal:", error)
        })

    }, [proposalId])

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
                                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                                    activeSection === section.id ? "bg-primary scale-150" : "bg-muted hover:bg-primary/50"
                                }`}
                            >
                                <span className="sr-only">{section.title}</span>
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
                    <div className="container mx-auto px-4 mt-8">
                        <p>
                            Our solar panels use advanced photovoltaic technology to convert sunlight into electricity. They are
                            designed to withstand various weather conditions and have an expected lifespan of 25-30 years.
                        </p>
                        <ul className="list-disc list-inside mt-4">
                            <li>Panel Efficiency: 20-22%</li>
                            <li>Temperature Coefficient: -0.35% / °C</li>
                            <li>Warranty: 25 years performance, 10 years product</li>
                        </ul>
                    </div>
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

