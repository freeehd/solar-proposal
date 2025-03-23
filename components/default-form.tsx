"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { toast } from "@/components/ui/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatDecimalValue } from "@/lib/utils"
import { Switch } from "@/components/ui/switch"
import { ImageGalleryDialog } from "@/components/image-gallery-dialog"
import Image from "next/image"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Eye, EyeOff, Info, Loader2 } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Modified schema to make initial validation less strict
const formSchema = z.object({
  name: z
    .string()
    .min(2, {
      message: "Name must be at least 2 characters.",
    })
    .default("Guest"),
  address: z
    .string()
    .min(2, {
      message: "Address must be at least 2 characters.",
    })
    .default("123 Solar Street"),
  averageRateKWh: z.string().optional(),
  fixedCosts: z.string().optional(),
  escalation: z.string().optional(),
  monthlyBill: z.string().optional(),
  numberOfSolarPanels: z.string().optional(),
  yearlyEnergyProduced: z.string().optional(),
  yearlyEnergyUsage: z.string().optional(),
  systemSize: z.string().optional(),
  energyOffset: z.string().optional(),
  solarPanelDesign: z.string().optional(),
  batteryName: z.string().optional(),
  inverterName: z.string().optional(),
  operatingMode: z.string().default("Backup"),
  capacity: z.string().optional(),
  outputKW: z.string().optional(),
  cost: z.string().optional(),
  backupAllocation: z.string().optional(),
  batteryImage: z.string().optional(),
  paybackPeriod: z.string().optional(),
  totalSystemCost: z.string().optional(),
  lifetimeSavings: z.string().optional(),
  netCost: z.string().optional(),
  incentives: z.string().optional(),
  solarSystemModel: z.string().optional(),
  solarSystemQuantity: z.string().optional(),
  solarSystemPrice: z.string().optional(),
  storageSystemModel: z.string().optional(),
  storageSystemQuantity: z.string().optional(),
  storageSystemPrice: z.string().optional(),
  financingType: z.string().default("Cash"),
  apr: z.string().optional(),
  duration: z.string().optional(),
  downPayment: z.string().optional(),
  financedAmount: z.string().optional(),
  monthlyPayments: z.string().optional(),
  solarRate: z.string().optional(),
  escalationRate: z.string().optional(),
  year1MonthlyPayments: z.string().optional(),
})

export function DefaultForm() {
  // Add new fields to the formData state
  const [formData, setFormData] = useState({
    name: "Guest",
    address: "123 Solar Street",
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
    financingType: "Cash", // Added previously
    apr: "",
    duration: "",
    downPayment: "",
    financedAmount: "",
    monthlyPayments: "",
    solarRate: "",
    escalationRate: "",
    year1MonthlyPayments: "",
  })

  // Add section visibility state after the formData state
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

  // Add a state to track which financial items are enabled
  const [enabledFinanceFields, setEnabledFinanceFields] = useState({
    financingType: true,
    paybackPeriod: true,
    totalSystemCost: true,
    lifetimeSavings: true,
    netCost: true,
    apr: false,
    duration: false,
    downPayment: false,
    financedAmount: false,
    monthlyPayments: false,
    solarRate: false,
    escalationRate: false,
    year1MonthlyPayments: false,
  })

  // Add loading state for form submission
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Add a function to toggle financial fields
  const toggleFinanceField = (fieldName: string) => {
    setEnabledFinanceFields((prev) => ({
      ...prev,
      [fieldName as keyof typeof prev]: !prev[fieldName as keyof typeof prev],
    }))
  }

  const [energyData, setEnergyData] = useState("")

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "Guest",
      address: "123 Solar Street",
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
      financingType: "Cash",
      apr: "",
      duration: "",
      downPayment: "",
      financedAmount: "",
      monthlyPayments: "",
      solarRate: "",
      escalationRate: "",
      year1MonthlyPayments: "",
    },
    mode: "onSubmit", // Only validate on submit
  })

  // Enhanced onSubmit function with proper error handling and data processing
  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsSubmitting(true)

      // Prepare the data for submission
      const submissionData = {
        name: values.name,
        address: values.address,
        averageRateKWh: values.averageRateKWh,
        fixedCosts: values.fixedCosts,
        escalation: values.escalation,
        monthlyBill: values.monthlyBill,
        numberOfSolarPanels: values.numberOfSolarPanels,
        yearlyEnergyProduced: values.yearlyEnergyProduced,
        yearlyEnergyUsage: values.yearlyEnergyUsage,
        systemSize: values.systemSize,
        energyOffset: values.energyOffset,
        solarPanelDesign: values.solarPanelDesign,
        batteryName: values.batteryName,
        inverterName: values.inverterName,
        operatingMode: values.operatingMode,
        capacity: values.capacity,
        outputKW: values.outputKW,
        cost: values.cost,
        backupAllocation: values.backupAllocation,
        batteryImage: values.batteryImage,
        paybackPeriod: values.paybackPeriod,
        totalSystemCost: values.totalSystemCost,
        lifetimeSavings: values.lifetimeSavings,
        netCost: values.netCost,
        incentives: values.incentives,
        solarSystemModel: values.solarSystemModel,
        solarSystemQuantity: values.solarSystemQuantity,
        solarSystemPrice: values.solarSystemPrice,
        storageSystemModel: values.storageSystemModel,
        storageSystemQuantity: values.storageSystemQuantity,
        storageSystemPrice: values.storageSystemPrice,
        financingType: values.financingType,
        apr: values.apr,
        duration: values.duration,
        downPayment: values.downPayment,
        financedAmount: values.financedAmount,
        monthlyPayments: values.monthlyPayments,
        solarRate: values.solarRate,
        escalationRate: values.escalationRate,
        year1MonthlyPayments: values.year1MonthlyPayments,
        energyData: energyData,
        sectionVisibility: sectionVisibility,
        enabledFinanceFields: enabledFinanceFields,
      }

      // Log the data being submitted
      console.log("Submitting form data:", submissionData)

      // Make the actual API call to submit the proposal
      const response = await fetch("/api/submit-proposal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submissionData),
      })

      // Check if the response is successful
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to submit proposal")
      }

      // Parse the response to get the proposal ID
      const result = await response.json()

      // Verify that we have a proposal ID in the response
      if (!result.data || !result.data.id) {
        throw new Error("No proposal ID returned from server")
      }

      // Save to localStorage as a backup
      localStorage.setItem("solarProposalData", JSON.stringify(submissionData))

      // Show success message
      toast({
        title: "Proposal submitted successfully!",
        description: `Proposal #${result.data.id} has been created.`,
        variant: "default",
      })

      // Redirect to the newly created proposal
      window.location.href = `/proposal/${result.data.id}`
    } catch (error) {
      console.error("Error submitting form:", error)

      // Show error message
      toast({
        title: "Error submitting proposal",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: any) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })

    // Also update the form values
    form.setValue(name as any, value)
  }

  const handleSelectChange = (value: string, name: string) => {
    setFormData({ ...formData, [name]: value })

    // Also update the form values
    form.setValue(name as any, value)
  }

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
        "apr",
        "downPayment",
        "financedAmount",
        "monthlyPayments",
        "solarRate",
        "escalationRate",
        "year1MonthlyPayments",
      ]

      if (decimalFields.includes(name)) {
        const formattedValue = formatDecimalValue(value, 2)
        setFormData((prev) => ({
          ...prev,
          [name]: formattedValue,
        }))

        // Also update the form values
        form.setValue(name as any, formattedValue)
      }
    }
  }

  // Add a handler for battery image selection
  const handleBatteryImageSelect = (imagePath: string) => {
    setFormData((prev) => ({ ...prev, batteryImage: imagePath }))
    form.setValue("batteryImage", imagePath)
  }

  // Add the handleVisibilityChange function after the handleBatteryImageSelect function
  const handleVisibilityChange = (section: string) => {
    setSectionVisibility((prev) => ({
      ...prev,
      [section]: !prev[section as keyof typeof prev],
    }))
  }

  // Update handleGenerateExample to include new fields and update form values
  const handleGenerateExample = () => {
    const exampleData = {
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
      financingType: "GoodLeap", // Updated default value
      apr: "4.99", // New field with example value
      duration: "20", // New field with example value
      downPayment: "5000.00", // New field with example value
      financedAmount: "30000.00", // New field with example value
      monthlyPayments: "198.25", // New field with example value
      solarRate: "0.12", // New field with example value
      escalationRate: "2.50", // New field with example value
      year1MonthlyPayments: "185.50", // New field with example value
    }

    // Update form state
    setFormData(exampleData)

    // Update React Hook Form values
    Object.entries(exampleData).forEach(([key, value]) => {
      form.setValue(key as any, value)
    })

    // Enable some of the new fields in the example
    setEnabledFinanceFields({
      financingType: true,
      paybackPeriod: true,
      totalSystemCost: true,
      lifetimeSavings: true,
      netCost: true,
      apr: true,
      duration: true,
      downPayment: true,
      financedAmount: true,
      monthlyPayments: true,
      solarRate: false,
      escalationRate: false,
      year1MonthlyPayments: false,
    })

    setEnergyData(`Jan	Feb	Mar	Apr	May	Jun	Jul	Aug	Sep	Oct	Nov	Dec
Energy usage (kWh)	973	844	916	932	1,029	1,171	1,521	800	1,700	1,060	1,060	1,440
New system production (kWh)	867	1,128	1,624	1,837	2,006	2,119	2,131	2,034	1,759	1,475	1,093	784`)
  }

  // Handle energy data change
  const handleEnergyDataChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEnergyData(e.target.value)
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} value={formData.name} onChange={handleChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input placeholder="123 Main St" {...field} value={formData.address} onChange={handleChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="averageRateKWh"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Average Rate/kWh</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.15"
                      {...field}
                      value={formData.averageRateKWh}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="fixedCosts"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fixed Costs</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="10.00"
                      {...field}
                      value={formData.fixedCosts}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="escalation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Escalation</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="2.50"
                      {...field}
                      value={formData.escalation}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="monthlyBill"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Monthly Bill</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="150.00"
                      {...field}
                      value={formData.monthlyBill}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="numberOfSolarPanels"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Number of Solar Panels</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="24"
                      {...field}
                      value={formData.numberOfSolarPanels}
                      onChange={handleChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="systemSize"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>System Size (kW)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="8.40"
                      {...field}
                      value={formData.systemSize}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="yearlyEnergyProduced"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Yearly Energy Produced (kWh)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="12000"
                      {...field}
                      value={formData.yearlyEnergyProduced}
                      onChange={handleChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="yearlyEnergyUsage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Yearly Energy Usage (kWh)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="14000"
                      {...field}
                      value={formData.yearlyEnergyUsage}
                      onChange={handleChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="energyOffset"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Energy Offset (%)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="95"
                      {...field}
                      value={formData.energyOffset}
                      onChange={handleChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="batteryName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Battery Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Tesla Powerwall"
                      {...field}
                      value={formData.batteryName}
                      onChange={handleChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="inverterName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Inverter Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="SolarEdge SE7600H"
                      {...field}
                      value={formData.inverterName}
                      onChange={handleChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="operatingMode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Operating Mode</FormLabel>
                  <Select
                    onValueChange={(value) => handleSelectChange(value, "operatingMode")}
                    defaultValue={formData.operatingMode}
                    value={formData.operatingMode}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select operating mode" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Backup">Backup</SelectItem>
                      <SelectItem value="Self-Consumption">Self-Consumption</SelectItem>
                      <SelectItem value="Time of Use">Time of Use</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="capacity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Capacity (kWh)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="13.50"
                      {...field}
                      value={formData.capacity}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="outputKW"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Output (kW)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="7.60"
                      {...field}
                      value={formData.outputKW}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="cost"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cost ($)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="8500.00"
                      {...field}
                      value={formData.cost}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="backupAllocation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Backup Allocation</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Configure backup allocation..."
                    className="resize-none"
                    {...field}
                    value={formData.backupAllocation}
                    onChange={handleChange}
                  />
                </FormControl>
                <FormDescription>Allocate battery power to specific devices or circuits.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Battery Image Dialog */}
          <div className="space-y-2">
            <Label>Battery Image</Label>
            <div className="space-y-4">
              <ImageGalleryDialog
                initialImage={formData.batteryImage}
                onSelect={handleBatteryImageSelect}
                imageType="battery"
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

          {/* Solar Panel Design Image Dialog - Add this section */}
          <div className="space-y-2">
            <Label>Solar Panel Design Image</Label>
            <div className="space-y-4">
              <ImageGalleryDialog
                initialImage={formData.solarPanelDesign}
                onSelect={(imagePath) => {
                  setFormData((prev) => ({ ...prev, solarPanelDesign: imagePath }))
                  form.setValue("solarPanelDesign", imagePath)
                }}
                imageType="solar"
              />
              {formData.solarPanelDesign && (
                <div className="relative w-full aspect-video rounded-lg overflow-hidden border">
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

          {/* Add the new dropdown field to the Financing Options section in the form */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Financing Options</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // Toggle all finance fields to be enabled
                  const allFields = Object.keys(enabledFinanceFields).reduce(
                    (acc, key) => {
                      acc[key as keyof typeof enabledFinanceFields] = true
                      return acc
                    },
                    { ...enabledFinanceFields },
                  )
                  setEnabledFinanceFields(allFields)
                }}
              >
                Enable All Fields
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Financing Type - Always visible */}
              <div className="space-y-2 border p-3 rounded-md relative">
                <div className="absolute top-3 right-3">
                  <Switch
                    checked={enabledFinanceFields.financingType}
                    onCheckedChange={() => toggleFinanceField("financingType")}
                  />
                </div>
                <Label
                  htmlFor="financingType"
                  className={!enabledFinanceFields.financingType ? "text-muted-foreground" : ""}
                >
                  Financing Type
                </Label>
                <Select
                  value={formData.financingType}
                  onValueChange={(value) => handleSelectChange(value, "financingType")}
                  disabled={!enabledFinanceFields.financingType}
                >
                  <SelectTrigger id="financingType">
                    <SelectValue placeholder="Select financing type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sungage">Sungage</SelectItem>
                    <SelectItem value="GoodLeap">GoodLeap</SelectItem>
                    <SelectItem value="LightReach">LightReach</SelectItem>
                    <SelectItem value="Aurora Custom Financing">Aurora Custom Financing</SelectItem>
                    <SelectItem value="Cash">Cash</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* APR (%) - New field */}
              <div className="space-y-2 border p-3 rounded-md relative">
                <div className="absolute top-3 right-3">
                  <Switch checked={enabledFinanceFields.apr} onCheckedChange={() => toggleFinanceField("apr")} />
                </div>
                <Label htmlFor="apr" className={!enabledFinanceFields.apr ? "text-muted-foreground" : ""}>
                  APR (%)
                </Label>
                <Input
                  id="apr"
                  name="apr"
                  type="number"
                  step="0.01"
                  value={formData.apr}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={!enabledFinanceFields.apr}
                  placeholder="4.99"
                />
              </div>

              {/* Duration (years) - New field */}
              <div className="space-y-2 border p-3 rounded-md relative">
                <div className="absolute top-3 right-3">
                  <Switch
                    checked={enabledFinanceFields.duration}
                    onCheckedChange={() => toggleFinanceField("duration")}
                  />
                </div>
                <Label htmlFor="duration" className={!enabledFinanceFields.duration ? "text-muted-foreground" : ""}>
                  Duration (years)
                </Label>
                <Input
                  id="duration"
                  name="duration"
                  type="number"
                  value={formData.duration}
                  onChange={handleChange}
                  disabled={!enabledFinanceFields.duration}
                  placeholder="20"
                />
              </div>

              {/* Down Payment - New field */}
              <div className="space-y-2 border p-3 rounded-md relative">
                <div className="absolute top-3 right-3">
                  <Switch
                    checked={enabledFinanceFields.downPayment}
                    onCheckedChange={() => toggleFinanceField("downPayment")}
                  />
                </div>
                <Label
                  htmlFor="downPayment"
                  className={!enabledFinanceFields.downPayment ? "text-muted-foreground" : ""}
                >
                  Down Payment ($)
                </Label>
                <Input
                  id="downPayment"
                  name="downPayment"
                  type="number"
                  step="0.01"
                  value={formData.downPayment}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={!enabledFinanceFields.downPayment}
                  placeholder="5000.00"
                />
              </div>

              {/* Financed Amount - New field */}
              <div className="space-y-2 border p-3 rounded-md relative">
                <div className="absolute top-3 right-3">
                  <Switch
                    checked={enabledFinanceFields.financedAmount}
                    onCheckedChange={() => toggleFinanceField("financedAmount")}
                  />
                </div>
                <Label
                  htmlFor="financedAmount"
                  className={!enabledFinanceFields.financedAmount ? "text-muted-foreground" : ""}
                >
                  Financed Amount ($)
                </Label>
                <Input
                  id="financedAmount"
                  name="financedAmount"
                  type="number"
                  step="0.01"
                  value={formData.financedAmount}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={!enabledFinanceFields.financedAmount}
                  placeholder="30000.00"
                />
              </div>

              {/* Total System Cost - Existing field */}
              <div className="space-y-2 border p-3 rounded-md relative">
                <div className="absolute top-3 right-3">
                  <Switch
                    checked={enabledFinanceFields.totalSystemCost}
                    onCheckedChange={() => toggleFinanceField("totalSystemCost")}
                  />
                </div>
                <Label
                  htmlFor="totalSystemCost"
                  className={!enabledFinanceFields.totalSystemCost ? "text-muted-foreground" : ""}
                >
                  Total System Cost ($)
                </Label>
                <Input
                  id="totalSystemCost"
                  name="totalSystemCost"
                  type="number"
                  step="0.01"
                  value={formData.totalSystemCost}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={!enabledFinanceFields.totalSystemCost}
                  placeholder="35000.00"
                />
              </div>

              {/* Net Cost - Existing field */}
              <div className="space-y-2 border p-3 rounded-md relative">
                <div className="absolute top-3 right-3">
                  <Switch
                    checked={enabledFinanceFields.netCost}
                    onCheckedChange={() => toggleFinanceField("netCost")}
                  />
                </div>
                <Label htmlFor="netCost" className={!enabledFinanceFields.netCost ? "text-muted-foreground" : ""}>
                  Net Cost ($)
                </Label>
                <Input
                  id="netCost"
                  name="netCost"
                  type="number"
                  step="0.01"
                  value={formData.netCost}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={!enabledFinanceFields.netCost}
                  placeholder="25900.00"
                />
              </div>

              {/* Lifetime Savings - Existing field */}
              <div className="space-y-2 border p-3 rounded-md relative">
                <div className="absolute top-3 right-3">
                  <Switch
                    checked={enabledFinanceFields.lifetimeSavings}
                    onCheckedChange={() => toggleFinanceField("lifetimeSavings")}
                  />
                </div>
                <Label
                  htmlFor="lifetimeSavings"
                  className={!enabledFinanceFields.lifetimeSavings ? "text-muted-foreground" : ""}
                >
                  Lifetime Savings ($)
                </Label>
                <Input
                  id="lifetimeSavings"
                  name="lifetimeSavings"
                  type="number"
                  step="0.01"
                  value={formData.lifetimeSavings}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={!enabledFinanceFields.lifetimeSavings}
                  placeholder="85000.00"
                />
              </div>

              {/* Monthly Payments - New field */}
              <div className="space-y-2 border p-3 rounded-md relative">
                <div className="absolute top-3 right-3">
                  <Switch
                    checked={enabledFinanceFields.monthlyPayments}
                    onCheckedChange={() => toggleFinanceField("monthlyPayments")}
                  />
                </div>
                <Label
                  htmlFor="monthlyPayments"
                  className={!enabledFinanceFields.monthlyPayments ? "text-muted-foreground" : ""}
                >
                  Monthly Payments ($)
                </Label>
                <Input
                  id="monthlyPayments"
                  name="monthlyPayments"
                  type="number"
                  step="0.01"
                  value={formData.monthlyPayments}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={!enabledFinanceFields.monthlyPayments}
                  placeholder="198.25"
                />
              </div>

              {/* Solar Rate - New field */}
              <div className="space-y-2 border p-3 rounded-md relative">
                <div className="absolute top-3 right-3">
                  <Switch
                    checked={enabledFinanceFields.solarRate}
                    onCheckedChange={() => toggleFinanceField("solarRate")}
                  />
                </div>
                <Label htmlFor="solarRate" className={!enabledFinanceFields.solarRate ? "text-muted-foreground" : ""}>
                  Solar Rate ($ per kWh)
                </Label>
                <Input
                  id="solarRate"
                  name="solarRate"
                  type="number"
                  step="0.01"
                  value={formData.solarRate}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={!enabledFinanceFields.solarRate}
                  placeholder="0.12"
                />
              </div>

              {/* Escalation Rate - New field */}
              <div className="space-y-2 border p-3 rounded-md relative">
                <div className="absolute top-3 right-3">
                  <Switch
                    checked={enabledFinanceFields.escalationRate}
                    onCheckedChange={() => toggleFinanceField("escalationRate")}
                  />
                </div>
                <Label
                  htmlFor="escalationRate"
                  className={!enabledFinanceFields.escalationRate ? "text-muted-foreground" : ""}
                >
                  Escalation (% per year)
                </Label>
                <Input
                  id="escalationRate"
                  name="escalationRate"
                  type="number"
                  step="0.01"
                  value={formData.escalationRate}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={!enabledFinanceFields.escalationRate}
                  placeholder="2.50"
                />
              </div>

              {/* Year 1 Monthly Payments - New field */}
              <div className="space-y-2 border p-3 rounded-md relative">
                <div className="absolute top-3 right-3">
                  <Switch
                    checked={enabledFinanceFields.year1MonthlyPayments}
                    onCheckedChange={() => toggleFinanceField("year1MonthlyPayments")}
                  />
                </div>
                <Label
                  htmlFor="year1MonthlyPayments"
                  className={!enabledFinanceFields.year1MonthlyPayments ? "text-muted-foreground" : ""}
                >
                  Year 1 Monthly Payments ($)
                </Label>
                <Input
                  id="year1MonthlyPayments"
                  name="year1MonthlyPayments"
                  type="number"
                  step="0.01"
                  value={formData.year1MonthlyPayments}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={!enabledFinanceFields.year1MonthlyPayments}
                  placeholder="185.50"
                />
              </div>

              {/* Payback Period - Existing field */}
              <div className="space-y-2 border p-3 rounded-md relative">
                <div className="absolute top-3 right-3">
                  <Switch
                    checked={enabledFinanceFields.paybackPeriod}
                    onCheckedChange={() => toggleFinanceField("paybackPeriod")}
                  />
                </div>
                <Label
                  htmlFor="paybackPeriod"
                  className={!enabledFinanceFields.paybackPeriod ? "text-muted-foreground" : ""}
                >
                  Payback Period (years)
                </Label>
                <Input
                  id="paybackPeriod"
                  name="paybackPeriod"
                  type="number"
                  step="0.1"
                  value={formData.paybackPeriod}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={!enabledFinanceFields.paybackPeriod}
                  placeholder="8.50"
                />
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold mb-2">System Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="solarSystemModel">Solar System Model</Label>
                <Input
                  id="solarSystemModel"
                  name="solarSystemModel"
                  type="text"
                  value={formData.solarSystemModel}
                  onChange={handleChange}
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
                />
              </div>
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
                  placeholder="9100.00"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="storageSystemModel">Storage System Model</Label>
                <Input
                  id="storageSystemModel"
                  name="storageSystemModel"
                  type="text"
                  value={formData.storageSystemModel}
                  onChange={handleChange}
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
                />
              </div>
            </div>
          </div>

          {/* Add the section visibility controls before the Submit button */}
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

          <div className="space-y-2">
            <Label htmlFor="energyData">Energy Usage Data</Label>
            <Textarea
              id="energyData"
              value={energyData}
              onChange={handleEnergyDataChange}
              className="min-h-[150px]"
              placeholder="Enter energy usage data in tabular format"
            />
            <FormDescription>Enter monthly energy usage and production data in a tabular format.</FormDescription>
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Proposal"
              )}
            </Button>
            <Button type="button" variant="outline" onClick={handleGenerateExample}>
              Generate Example Data
            </Button>
          </div>
        </form>
      </Form>
    </>
  )
}

export default DefaultForm

