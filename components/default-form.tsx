"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { ImageGalleryDialog } from "@/components/image-gallery-dialog"
import Image from "next/image"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Eye, EyeOff, Info, Loader2 } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Format decimal values to ensure consistent decimal places
const formatDecimalValue = (value: string, decimalPlaces = 2): string => {
  if (!value) return ""

  // Remove any non-numeric characters except for the decimal point
  const sanitized = value.replace(/[^\d.]/g, "")

  // If there's a valid number, format it with the specified decimal places
  const num = Number.parseFloat(sanitized)
  if (isNaN(num)) return ""

  return num.toFixed(decimalPlaces)
}

export default function DefaultForm() {
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    averageRateKWh: "",
    fixedCosts: "",
    escalation: "",
    monthlyBill: "",
    numberOfSolarPanels: "",
    yearlyEnergyProduced: "",
    yearlyEnergyUsage: "",
    systemSize: "",
    energyOffset: "",
    solarPanelDesign: "",
    batteryName: "",
    inverterName: "",
    operatingMode: "Backup",
    capacity: "",
    outputKW: "",
    cost: "",
    backupAllocation: "",
    batteryImage: "",
    paybackPeriod: "",
    totalSystemCost: "",
    lifetimeSavings: "",
    netCost: "",
    incentives: "",
    solarSystemModel: "",
    solarSystemQuantity: "",
    solarSystemPrice: "",
    storageSystemModel: "",
    storageSystemQuantity: "",
    storageSystemPrice: "",
  })

  // Add section visibility state
  const [sectionVisibility, setSectionVisibility] = useState({
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
  })

  // Add loading states for image uploads
  const [uploadingSolarImage, setUploadingSolarImage] = useState(false)
  const [uploadingBatteryImage, setUploadingBatteryImage] = useState(false)

  const [energyData, setEnergyData] = useState(`Jan	Feb	Mar	Apr	May	Jun	Jul	Aug	Sep	Oct	Nov	Dec
Energy usage (kWh)	973	844	916	932	1,029	1,171	1,521	800	1,700	1,060	1,060	1,440
New system production (kWh)	867	1,128	1,624	1,837	2,006	2,119	2,131	2,034	1,759	1,475	1,093	784`)
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  // Handle blur event to format decimal values
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target

    // Only process number inputs
    if (type === "number") {
      // These fields should have 2 decimal places
      const decimalFields = [
        "averageRateKWh",
        "fixedCosts",
        "escalation",
        "monthlyBill",
        "systemSize",
        "capacity",
        "outputKW",
        "cost",
        "paybackPeriod",
        "totalSystemCost",
        "lifetimeSavings",
        "netCost",
        "incentives",
        "solarSystemPrice",
        "storageSystemPrice",
      ]

      if (decimalFields.includes(name)) {
        setFormData((prev) => ({
          ...prev,
          [name]: formatDecimalValue(value, 2),
        }))
      }
    }
  }

  const handleSelectChange = (value: string, name: string) => {
    setFormData({ ...formData, [name]: value })
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      const fieldName = e.target.name

      // Determine image type based on field name
      const imageType = fieldName === "solarPanelDesign" ? "solar" : "battery"

      try {
        // Set the appropriate loading state
        if (imageType === "solar") {
          setUploadingSolarImage(true)
        } else {
          setUploadingBatteryImage(true)
        }

        // Create form data for upload
        const formData = new FormData()
        formData.append("image", file)
        formData.append("imageType", imageType)

        // Upload the image
        const response = await fetch("/api/upload-image", {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          throw new Error("Failed to upload image")
        }

        const result = await response.json()

        if (result.success) {
          // Update form data with the image URL
          setFormData((prev) => ({ ...prev, [fieldName]: result.url }))
          toast({
            title: "Image uploaded",
            description: `${imageType === "solar" ? "Solar panel design" : "Battery"} image uploaded successfully.`,
          })
        } else {
          throw new Error(result.message || "Upload failed")
        }
      } catch (error) {
        console.error("Error uploading image:", error)
        toast({
          title: "Upload failed",
          description: error instanceof Error ? error.message : "Failed to upload image",
          variant: "destructive",
        })
      } finally {
        // Reset loading state
        if (imageType === "solar") {
          setUploadingSolarImage(false)
        } else {
          setUploadingBatteryImage(false)
        }
      }
    }
  }

  const handleBatteryImageSelect = (imagePath: string) => {
    console.log("Selected battery image:", imagePath)
    setFormData((prev) => ({ ...prev, batteryImage: imagePath }))
  }

  // Handle section visibility toggle
  const handleVisibilityChange = (section: string) => {
    setSectionVisibility((prev) => ({
      ...prev,
      [section]: !prev[section as keyof typeof prev],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Create a copy of the form data to format
    const formattedData = { ...formData }

    // Format all decimal fields before submission
    const decimalFields = [
      "averageRateKWh",
      "fixedCosts",
      "escalation",
      "monthlyBill",
      "systemSize",
      "capacity",
      "outputKW",
      "cost",
      "paybackPeriod",
      "totalSystemCost",
      "lifetimeSavings",
      "netCost",
      "incentives",
      "solarSystemPrice",
      "storageSystemPrice",
    ]

    // Format each decimal field
    decimalFields.forEach((field) => {
      if (formattedData[field as keyof typeof formattedData]) {
        formattedData[field as keyof typeof formattedData] = formatDecimalValue(
          formattedData[field as keyof typeof formattedData] as string,
          2,
        )
      }
    })

    console.log("Submitting form data:", { ...formattedData, energyData, sectionVisibility })

    // Save both form data and section visibility to localStorage
    localStorage.setItem(
      "solarProposalData",
      JSON.stringify({
        ...formattedData,
        energyData,
        sectionVisibility,
      }),
    )

    try {
      const response = await fetch("/api/submit-proposal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...formattedData, energyData, sectionVisibility }),
      })

      if (!response.ok) {
        throw new Error("Failed to submit proposal")
      }

      const result = await response.json()
      console.log("Submission result:", result)

      toast({
        title: "Proposal submitted successfully",
        description: "Your solar proposal has been saved to the database.",
      })

      router.push("/")
    } catch (error) {
      console.error("Error submitting proposal:", error)
      toast({
        title: "Error",
        description: "Failed to submit proposal. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleGenerateExample = () => {
    setFormData({
      name: "John Smith",
      address: "123 Solar Street, Sunnyville, CA 90210",
      averageRateKWh: "0.15",
      fixedCosts: "10.00",
      escalation: "2.50",
      monthlyBill: "150.00",
      numberOfSolarPanels: "24",
      systemSize: "8.40", // Formatted with 2 decimal places
      yearlyEnergyProduced: "12000",
      yearlyEnergyUsage: "14000",
      energyOffset: "95",
      solarPanelDesign: "",
      batteryName: "Tesla Powerwall",
      inverterName: "SolarEdge SE7600H",
      operatingMode: "Backup",
      capacity: "13.50", // Formatted with 2 decimal places
      outputKW: "7.60", // Formatted with 2 decimal places
      cost: "8500.00", // Formatted with 2 decimal places
      backupAllocation: "",
      batteryImage: "",
      paybackPeriod: "8.50", // Formatted with 2 decimal places
      totalSystemCost: "35000.00", // Formatted with 2 decimal places
      lifetimeSavings: "85000.00", // Formatted with 2 decimal places
      netCost: "25900.00", // Formatted with 2 decimal places
      incentives: "9100.00", // Formatted with 2 decimal places
      solarSystemModel: "REC Alpha Pure 400W",
      solarSystemQuantity: "24",
      solarSystemPrice: "19200.00", // Formatted with 2 decimal places
      storageSystemModel: "Tesla Powerwall 2",
      storageSystemQuantity: "1",
      storageSystemPrice: "8500.00", // Formatted with 2 decimal places
    })
    setEnergyData(`Jan	Feb	Mar	Apr	May	Jun	Jul	Aug	Sep	Oct	Nov	Dec
Energy usage (kWh)	973	844	916	932	1,029	1,171	1,521	800	1,700	1,060	1,060	1,440
New system production (kWh)	867	1,128	1,624	1,837	2,006	2,119	2,131	2,034	1,759	1,475	1,093	784`)
  }

  const handleEnergyDataChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEnergyData(e.target.value)
  }

  useEffect(() => {
    console.log("Current form data:", formData)
  }, [formData])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle>Solar Proposal Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" name="address" value={formData.address} onChange={handleChange} required />
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-2">Energy Usage</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="averageRateKWh">Average Rate/kWh</Label>
                  <Input
                    id="averageRateKWh"
                    name="averageRateKWh"
                    type="number"
                    step="0.01"
                    value={formData.averageRateKWh}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fixedCosts">Fixed Costs</Label>
                  <Input
                    id="fixedCosts"
                    name="fixedCosts"
                    type="number"
                    step="0.01"
                    value={formData.fixedCosts}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="escalation">Escalation</Label>
                  <Input
                    id="escalation"
                    name="escalation"
                    type="number"
                    step="0.01"
                    value={formData.escalation}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="monthlyBill">Monthly Bill ($)</Label>
                  <Input
                    id="monthlyBill"
                    name="monthlyBill"
                    type="number"
                    step="0.01"
                    value={formData.monthlyBill}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-2">Solar Design Breakdown</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="numberOfSolarPanels">Number of Solar Panels</Label>
                  <Input
                    id="numberOfSolarPanels"
                    name="numberOfSolarPanels"
                    type="number"
                    value={formData.numberOfSolarPanels}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="systemSize">System Size (kW)</Label>
                  <Input
                    id="systemSize"
                    name="systemSize"
                    type="number"
                    step="0.01"
                    value={formData.systemSize}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="yearlyEnergyProduced">Yearly Energy Produced (kWh)</Label>
                  <Input
                    id="yearlyEnergyProduced"
                    name="yearlyEnergyProduced"
                    type="number"
                    value={formData.yearlyEnergyProduced}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="yearlyEnergyUsage">Yearly Energy Usage (kWh)</Label>
                  <Input
                    id="yearlyEnergyUsage"
                    name="yearlyEnergyUsage"
                    type="number"
                    value={formData.yearlyEnergyUsage}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="energyOffset">Energy Offset (%)</Label>
                  <Input
                    id="energyOffset"
                    name="energyOffset"
                    type="number"
                    min="0"
                    max="500"
                    value={formData.energyOffset}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2 mt-4">
                <Label htmlFor="solarPanelDesign">Solar Panel Design Image</Label>
                <div className="flex flex-col space-y-2">
                  <Input
                    id="solarPanelDesign"
                    name="solarPanelDesign"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={uploadingSolarImage}
                  />
                  {uploadingSolarImage && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading solar panel design...
                    </div>
                  )}
                  {formData.solarPanelDesign && (
                    <div className="relative w-full aspect-video rounded-lg overflow-hidden border mt-2">
                      <Image
                        src={formData.solarPanelDesign || "/placeholder.svg"}
                        alt="Solar panel design"
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-2">Storage Setup</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="batteryName">Battery Name</Label>
                  <Input
                    id="batteryName"
                    name="batteryName"
                    value={formData.batteryName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="inverterName">Inverter Name</Label>
                  <Input
                    id="inverterName"
                    name="inverterName"
                    value={formData.inverterName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="operatingMode">Operating Mode</Label>
                  <Select onValueChange={(value) => handleSelectChange(value, "operatingMode")}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select operating mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Backup">Backup</SelectItem>
                      <SelectItem value="On grid">On grid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="capacity">Capacity (kWh)</Label>
                  <Input
                    id="capacity"
                    name="capacity"
                    type="number"
                    step="0.01"
                    value={formData.capacity}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="outputKW">Output (kW)</Label>
                  <Input
                    id="outputKW"
                    name="outputKW"
                    type="number"
                    step="0.01"
                    value={formData.outputKW}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cost">Cost ($)</Label>
                  <Input
                    id="cost"
                    name="cost"
                    type="number"
                    step="0.01"
                    value={formData.cost}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="backupAllocation">Backup Allocation</Label>
                  <Input
                    id="backupAllocation"
                    name="backupAllocation"
                    value={formData.backupAllocation}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2 col-span-full">
                  <Label>Battery Image</Label>
                  <div className="space-y-4">
                    <ImageGalleryDialog
                      initialImage={formData.batteryImage}
                      onSelect={handleBatteryImageSelect}
                      imageType="battery" // Pass the image type to filter images
                    />
                    {formData.batteryImage && (
                      <div className="relative w-full aspect-video rounded-lg overflow-hidden border">
                        <Image
                          src={formData.batteryImage || "/placeholder.svg"}
                          alt="Selected battery"
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-2">Financing Options</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="paybackPeriod">Payback Period (years)</Label>
                  <Input
                    id="paybackPeriod"
                    name="paybackPeriod"
                    type="number"
                    step="0.1"
                    value={formData.paybackPeriod}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="totalSystemCost">Total System Cost ($)</Label>
                  <Input
                    id="totalSystemCost"
                    name="totalSystemCost"
                    type="number"
                    step="0.01"
                    value={formData.totalSystemCost}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lifetimeSavings">Lifetime Savings ($)</Label>
                  <Input
                    id="lifetimeSavings"
                    name="lifetimeSavings"
                    type="number"
                    step="0.01"
                    value={formData.lifetimeSavings}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="netCost">Net Cost ($)</Label>
                  <Input
                    id="netCost"
                    name="netCost"
                    type="number"
                    step="0.01"
                    value={formData.netCost}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-2">System Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="incentives">Incentives ($)</Label>
                  <Input
                    id="incentives"
                    name="incentives"
                    type="number"
                    step="0.01"
                    value={formData.incentives}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="solarSystemModel">Solar System Model</Label>
                  <Input
                    id="solarSystemModel"
                    name="solarSystemModel"
                    value={formData.solarSystemModel}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="solarSystemQuantity">Solar System Quantity</Label>
                  <Input
                    id="solarSystemQuantity"
                    name="solarSystemQuantity"
                    type="number"
                    value={formData.solarSystemQuantity}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="solarSystemPrice">Solar System Price ($)</Label>
                  <Input
                    id="solarSystemPrice"
                    name="solarSystemPrice"
                    type="number"
                    step="0.01"
                    value={formData.solarSystemPrice}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="storageSystemModel">Storage System Model</Label>
                  <Input
                    id="storageSystemModel"
                    name="storageSystemModel"
                    value={formData.storageSystemModel}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="storageSystemQuantity">Storage System Quantity</Label>
                  <Input
                    id="storageSystemQuantity"
                    name="storageSystemQuantity"
                    type="number"
                    value={formData.storageSystemQuantity}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="storageSystemPrice">Storage System Price ($)</Label>
                  <Input
                    id="storageSystemPrice"
                    name="storageSystemPrice"
                    type="number"
                    step="0.01"
                    value={formData.storageSystemPrice}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-2">Energy Usage and Production Data</h3>
              <div className="space-y-2">
                <Label htmlFor="energyData">Monthly Energy Data</Label>
                <Textarea
                  id="energyData"
                  name="energyData"
                  value={energyData}
                  onChange={handleEnergyDataChange}
                  className="min-h-[150px] font-mono text-sm"
                  placeholder="Paste your energy data here..."
                />
              </div>
            </div>

            {/* Section visibility controls remain unchanged */}
            <div className="border-t pt-4">
              <Accordion type="single" collapsible defaultValue="section-visibility">
                <AccordionItem value="section-visibility">
                  <AccordionTrigger className="font-semibold">
                    <div className="flex items-center gap-2">
                      <Eye className="h-5 w-5" />
                      <span>Section Visibility</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Toggle which sections will be visible in the final proposal.
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                          { id: "hero", label: "Hero Section" },
                          { id: "whySunStudios", label: "Why Sun Studios" },
                          { id: "app", label: "Mobile App" },
                          { id: "howSolarWorks", label: "How Solar Works" },
                          { id: "energyUsage", label: "Energy Usage" },
                          { id: "solarDesign", label: "Solar Design" },
                          { id: "storage", label: "Storage" },
                          { id: "environmentalImpact", label: "Environmental Impact" },
                          { id: "financing", label: "Financing" },
                          { id: "systemSummary", label: "System Summary" },
                          { id: "callToAction", label: "Call to Action" },
                        ].map((section) => (
                          <div
                            key={section.id}
                            className="flex items-center justify-between space-x-2 p-2 rounded-md border"
                          >
                            <div className="flex items-center gap-2">
                              <Label htmlFor={`visibility-${section.id}`} className="flex-1 cursor-pointer">
                                {section.label}
                              </Label>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Info className="h-4 w-4 text-muted-foreground" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Toggle visibility of the {section.label}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                            <div className="flex items-center gap-2">
                              {sectionVisibility[section.id as keyof typeof sectionVisibility] ? (
                                <Eye className="h-4 w-4 text-green-500" />
                              ) : (
                                <EyeOff className="h-4 w-4 text-gray-400" />
                              )}
                              <Switch
                                id={`visibility-${section.id}`}
                                checked={sectionVisibility[section.id as keyof typeof sectionVisibility]}
                                onCheckedChange={() => handleVisibilityChange(section.id)}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>

            <div className="flex gap-4">
              <Button type="button" variant="outline" className="w-full" onClick={handleGenerateExample}>
                Generate Example Data
              </Button>
              <Button type="submit" className="w-full">
                Generate Proposal
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

