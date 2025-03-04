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
    essentialsDays: "",
    appliancesDays: "",
    wholeHomeDays: "",
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
  const [energyData, setEnergyData] = useState(`Jan	Feb	Mar	Apr	May	Jun	Jul	Aug	Sep	Oct	Nov	Dec
Energy usage (kWh)	973	844	916	932	1,029	1,171	1,521	800	1,700	1,060	1,060	1,440
New system production (kWh)	867	1,128	1,624	1,837	2,006	2,119	2,131	2,034	1,759	1,475	1,093	784`)
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSelectChange = (value: string, name: string) => {
    setFormData({ ...formData, [name]: value })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, [e.target.name]: reader.result as string }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleBatteryImageSelect = (imagePath: string) => {
    console.log("Selected battery image:", imagePath)
    setFormData((prev) => ({ ...prev, batteryImage: imagePath }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Submitting form data:", { ...formData, energyData })
    localStorage.setItem("solarProposalData", JSON.stringify({ ...formData, energyData }))

    try {
      const response = await fetch("/api/submit-proposal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...formData, energyData }),
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
      escalation: "2.5",
      monthlyBill: "150.00",
      numberOfSolarPanels: "24",
      yearlyEnergyProduced: "12000",
      energyOffset: "95",
      solarPanelDesign: "",
      batteryName: "Tesla Powerwall",
      inverterName: "SolarEdge SE7600H",
      operatingMode: "Backup",
      capacity: "13.5",
      outputKW: "7.6",
      cost: "8500",
      backupAllocation: "Whole Home",
      batteryImage: "",
      essentialsDays: "7",
      appliancesDays: "5",
      wholeHomeDays: "3",
      paybackPeriod: "8.5",
      totalSystemCost: "35000",
      lifetimeSavings: "85000",
      netCost: "25900",
      incentives: "9100",
      solarSystemModel: "REC Alpha Pure 400W",
      solarSystemQuantity: "24",
      solarSystemPrice: "19200",
      storageSystemModel: "Tesla Powerwall 2",
      storageSystemQuantity: "1",
      storageSystemPrice: "8500",
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
                    <Label htmlFor="yearlyEnergyProduced">Yearly Energy Produced</Label>
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
                    <Label htmlFor="energyOffset">Energy Offset (%)</Label>
                    <Input
                        id="energyOffset"
                        name="energyOffset"
                        type="number"
                        min="0"
                        max="100"
                        value={formData.energyOffset}
                        onChange={handleChange}
                        required
                    />
                  </div>
                </div>
                <div className="space-y-2 mt-4">
                  <Label htmlFor="solarPanelDesign">Solar Panel Design Image</Label>
                  <Input
                      id="solarPanelDesign"
                      name="solarPanelDesign"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                  />
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
                      <ImageGalleryDialog initialImage={formData.batteryImage} onSelect={handleBatteryImageSelect} />
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
                <h3 className="font-semibold mb-2">Your Storage Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="essentialsDays">Essentials (days)</Label>
                    <Input
                        id="essentialsDays"
                        name="essentialsDays"
                        type="number"
                        step="0.1"
                        value={formData.essentialsDays}
                        onChange={handleChange}
                        required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="appliancesDays">Appliances (days)</Label>
                    <Input
                        id="appliancesDays"
                        name="appliancesDays"
                        type="number"
                        step="0.1"
                        value={formData.appliancesDays}
                        onChange={handleChange}
                        required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="wholeHomeDays">Whole Home (days)</Label>
                    <Input
                        id="wholeHomeDays"
                        name="wholeHomeDays"
                        type="number"
                        step="0.1"
                        value={formData.wholeHomeDays}
                        onChange={handleChange}
                        required
                    />
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

