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

// Modified schema to make initial validation less strict but require necessary fields
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
  averageRateKWh: z.string().min(1, { message: "Average rate is required" }).default("0.15"),
  fixedCosts: z.string().default("0.00"),
  escalation: z.string().default("0.00"),
  monthlyBill: z.string().default("0.00"),
  numberOfSolarPanels: z.string().default("0"),
  yearlyEnergyProduced: z.string().default("0"),
  yearlyEnergyUsage: z.string().default("0"),
  systemSize: z.string().default("0.00"),
  energyOffset: z.string().default("0"),
  solarPanelDesign: z.string().optional(),
  batteryName: z.string().optional(),
  inverterName: z.string().optional(),
  operatingMode: z.string().default("Backup"),
  capacity: z.string().default("0.00"),
  outputKW: z.string().default("0.00"),
  cost: z.string().default("0.00"),
  backupAllocation: z.string().optional(),
  batteryImage: z.string().optional(),
  paybackPeriod: z.string().default("0.00"),
  totalSystemCost: z.string().default("0.00"),
  lifetimeSavings: z.string().default("0.00"),
  netCost: z.string().default("0.00"),
  incentives: z.string().default("0.00"),
  solarSystemModel: z.string().optional(),
  solarSystemQuantity: z.string().default("0"),
  solarSystemPrice: z.string().default("0.00"),
  storageSystemModel: z.string().optional(),
  storageSystemQuantity: z.string().default("0"),
  storageSystemPrice: z.string().default("0.00"),
  financingType: z.string().default("Cash"),
  apr: z.string().default("0.00"),
  duration: z.string().default("0"),
  downPayment: z.string().default("0.00"),
  financedAmount: z.string().default("0.00"),
  monthlyPayments: z.string().default("0.00"),
  solarRate: z.string().default("0.00"),
  escalationRate: z.string().default("0.00"),
  year1MonthlyPayments: z.string().default("0.00"),
})

export interface EnabledFinanceFields {
  financingType: boolean
  paybackPeriod: boolean
  totalSystemCost: boolean
  lifetimeSavings: boolean
  netCost: boolean
  apr: boolean
  duration: boolean
  downPayment: boolean
  financedAmount: boolean
  monthlyPayments: boolean
  solarRate: boolean
  escalationRate: boolean
  year1MonthlyPayments: boolean
  incentives: boolean
  cumulativeCashflow: boolean
}

export interface EnabledBatteryFields {
  batteryName: boolean
  inverterName: boolean
  capacity: boolean
  outputKW: boolean
  cost: boolean
  batteryImage: boolean
  storageSystemModel: boolean
  storageSystemQuantity: boolean
  storageSystemPrice: boolean
}

interface DefaultFormProps {
  initialData?: any
  isEditing?: boolean
  proposalId?: string | null
  onSubmitSuccess?: ((data: any) => void) | null
}

export function DefaultForm({
  initialData = null,
  isEditing = false,
  proposalId = null,
  onSubmitSuccess = null,
}: DefaultFormProps) {
  // Map snake_case database fields to camelCase for the form
  const mapDatabaseToForm = (data: any) => {
    if (!data) return null

    return {
      name: data.name || "Guest",
      address: data.address || "123 Solar Street",
      averageRateKWh: data.average_rate_kwh || "0.15",
      fixedCosts: data.fixed_costs || "0.00",
      escalation: data.escalation || "0.00",
      monthlyBill: data.monthly_bill || "0.00",
      numberOfSolarPanels: data.number_of_solar_panels || "0",
      yearlyEnergyProduced: data.yearly_energy_produced || "0",
      yearlyEnergyUsage: data.yearly_energy_usage || "0",
      systemSize: data.system_size || "0.00",
      energyOffset: data.energy_offset || "0",
      solarPanelDesign: data.solar_panel_design || "",
      batteryName: data.battery_name || "",
      inverterName: data.inverter_name || "",
      operatingMode: data.operating_mode || "Backup",
      capacity: data.capacity || "0.00",
      outputKW: data.output_kw || "0.00",
      cost: data.cost || "0.00",
      backupAllocation: data.backup_allocation || "",
      batteryImage: data.battery_image || "",
      paybackPeriod: data.payback_period || "0.00",
      totalSystemCost: data.total_system_cost || "0.00",
      lifetimeSavings: data.lifetime_savings || "0.00",
      netCost: data.net_cost || "0.00",
      incentives: data.incentives || "0.00",
      solarSystemModel: data.solar_system_model || "",
      solarSystemQuantity: data.solar_system_quantity || "0",
      solarSystemPrice: data.solar_system_price || "0.00",
      storageSystemModel: data.storage_system_model || "",
      storageSystemQuantity: data.storage_system_quantity || "0",
      storageSystemPrice: data.storage_system_price || "0.00",
      financingType: data.financing_type || "Cash",
      apr: data.apr || "0.00",
      duration: data.duration || "0",
      downPayment: data.down_payment || "0.00",
      financedAmount: data.financed_amount || "0.00",
      monthlyPayments: data.monthly_payments || "0.00",
      solarRate: data.solar_rate || "0.00",
      escalationRate: data.escalation_rate || "0.00",
      year1MonthlyPayments: data.year1_monthly_payments || "0.00",
    }
  }

  // Initialize form data from initialData if provided
  const mappedInitialData = mapDatabaseToForm(initialData)

  // Default values for new proposals
  const defaultFormData = {
    name: "Guest",
    address: "123 Solar Street",
    averageRateKWh: "0.15", // Default value for required field
    fixedCosts: "0.00",
    escalation: "0.00",
    monthlyBill: "0.00",
    numberOfSolarPanels: "0",
    yearlyEnergyProduced: "0",
    yearlyEnergyUsage: "0",
    systemSize: "0.00",
    energyOffset: "0",
    solarPanelDesign: "",
    batteryName: "",
    inverterName: "",
    operatingMode: "Backup",
    capacity: "0.00",
    outputKW: "0.00",
    cost: "0.00",
    backupAllocation: "",
    batteryImage: "",
    paybackPeriod: "0.00",
    totalSystemCost: "0.00",
    lifetimeSavings: "0.00",
    netCost: "0.00",
    incentives: "0.00",
    solarSystemModel: "",
    solarSystemQuantity: "0",
    solarSystemPrice: "0.00",
    storageSystemModel: "",
    storageSystemQuantity: "0",
    storageSystemPrice: "0.00",
    financingType: "Cash",
    apr: "0.00",
    duration: "0",
    downPayment: "0.00",
    financedAmount: "0.00",
    monthlyPayments: "0.00",
    solarRate: "0.00",
    escalationRate: "0.00",
    year1MonthlyPayments: "0.00",
  }

  // Add new fields to the formData state
  const [formData, setFormData] = useState(mappedInitialData || defaultFormData)

  // Add section visibility state after the formData state
  const [sectionVisibility, setSectionVisibility] = useState(
    initialData && initialData.section_visibility
      ? initialData.section_visibility
      : {
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

  // Add a state to track which financial items are enabled
  const [enabledFinanceFields, setEnabledFinanceFields] = useState<EnabledFinanceFields>(
    initialData && initialData.enabled_finance_fields
      ? initialData.enabled_finance_fields
      : {
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
          incentives: false,
          cumulativeCashflow: false,
        },
  )

  // Add a state to track which battery items are enabled
  const [enabledBatteryFields, setEnabledBatteryFields] = useState<EnabledBatteryFields>(
    initialData && initialData.enabled_battery_fields
      ? initialData.enabled_battery_fields
      : {
          batteryName: true,
          inverterName: true,
          capacity: true,
          outputKW: true,
          cost: true,
          batteryImage: true,
          storageSystemModel: true,
          storageSystemQuantity: true,
          storageSystemPrice: true,
        },
  )

  // Add loading state for form submission
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Add a function to toggle financial fields
  const toggleFinanceField = (fieldName: string) => {
    setEnabledFinanceFields((prev) => ({
      ...prev,
      [fieldName as keyof typeof prev]: !prev[fieldName as keyof typeof prev],
    }))
  }

  // Add a function to toggle battery fields
  const toggleBatteryField = (fieldName: string) => {
    setEnabledBatteryFields((prev) => ({
      ...prev,
      [fieldName as keyof typeof prev]: !prev[fieldName as keyof typeof prev],
    }))
  }

  // Add a function to toggle all battery fields
  const toggleAllBatteryFields = (enabled: boolean) => {
    setEnabledBatteryFields((prev) => {
      const newState = { ...prev }
      Object.keys(newState).forEach((key) => {
        newState[key as keyof typeof newState] = enabled
      })
      return newState
    })
  }

  const [energyData, setEnergyData] = useState(initialData ? initialData.energy_data || "" : "")

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: mappedInitialData || defaultFormData,
    mode: "onSubmit", // Only validate on submit
  })

  // Enhanced onSubmit function with proper error handling and data processing
  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsSubmitting(true)

      // Prepare the data for submission - map camelCase to snake_case for the API
      const submissionData = {
        name: values.name,
        address: values.address,
        average_rate_kwh: values.averageRateKWh || "0.15", // Ensure required field has a value
        fixed_costs: values.fixedCosts || "0.00",
        escalation: values.escalation || "0.00",
        monthly_bill: values.monthlyBill || "0.00",
        number_of_solar_panels: values.numberOfSolarPanels || "0",
        yearly_energy_produced: values.yearlyEnergyProduced || "0",
        yearly_energy_usage: values.yearlyEnergyUsage || "0",
        system_size: values.systemSize || "0.00",
        energy_offset: values.energyOffset || "0",
        solar_panel_design: values.solarPanelDesign || "",
        battery_name: values.batteryName || "",
        inverter_name: values.inverterName || "",
        operating_mode: values.operatingMode || "Backup",
        capacity: values.capacity || "0.00",
        output_kw: values.outputKW || "0.00",
        cost: values.cost || "0.00",
        backup_allocation: values.backupAllocation || "",
        battery_image: values.batteryImage || "",
        payback_period: values.paybackPeriod || "0.00",
        total_system_cost: values.totalSystemCost || "0.00",
        lifetime_savings: values.lifetimeSavings || "0.00",
        net_cost: values.netCost || "0.00",
        incentives: values.incentives || "0.00",
        solar_system_model: values.solarSystemModel || "",
        solar_system_quantity: values.solarSystemQuantity || "0",
        solar_system_price: values.solarSystemPrice || "0.00",
        storage_system_model: values.storageSystemModel || "",
        storage_system_quantity: values.storageSystemQuantity || "0",
        storage_system_price: values.storageSystemPrice || "0.00",
        financing_type: values.financingType || "Cash",
        apr: values.apr || "0.00",
        duration: values.duration || "0",
        down_payment: values.downPayment || "0.00",
        financed_amount: values.financedAmount || "0.00",
        monthly_payments: values.monthlyPayments || "0.00",
        solar_rate: values.solarRate || "0.00",
        escalation_rate: values.escalationRate || "0.00",
        year1_monthly_payments: values.year1MonthlyPayments || "0.00",
        energy_data: energyData,
        section_visibility: sectionVisibility,
        enabled_finance_fields: enabledFinanceFields,
        enabled_battery_fields: enabledBatteryFields,
      }

      // Log the data being submitted
      console.log(`${isEditing ? "Updating" : "Submitting"} form data:`, submissionData)

      // Determine the API endpoint and method based on whether we're editing or creating
      const url = isEditing ? `/api/proposals/${proposalId}` : "/api/submit-proposal"
      const method = isEditing ? "PUT" : "POST"

      // Make the API call
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submissionData),
      })

      // Check if the response is successful
      if (!response.ok) {
        const errorData = await response.json()
        console.error("API error response:", errorData)
        throw new Error(errorData.message || `Failed to ${isEditing ? "update" : "submit"} proposal`)
      }

      // Parse the response to get the proposal ID
      const result = await response.json()

      // Verify that we have a proposal ID in the response
      const proposalData = result.data || result.proposal
      if (!proposalData || !proposalData.id) {
        throw new Error("No proposal ID returned from server")
      }

      // Save to localStorage as a backup
      localStorage.setItem("solarProposalData", JSON.stringify(submissionData))

      // Show success message
      toast({
        title: isEditing ? "Proposal updated successfully!" : "Proposal submitted successfully!",
        description: isEditing
          ? `Proposal #${proposalData.id} has been updated.`
          : `Proposal #${proposalData.id} has been created.`,
        variant: "default",
      })

      // If we have a custom success handler, call it
      if (onSubmitSuccess) {
        onSubmitSuccess(proposalData)
      } else {
        // Redirect to the newly created/updated proposal
        window.location.href = `/proposal/${proposalData.id}`
      }
    } catch (error) {
      console.error(`Error ${isEditing ? "updating" : "submitting"} form:`, error)

      // Show error message
      toast({
        title: `Error ${isEditing ? "updating" : "submitting"} proposal`,
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
        // If the field is empty, set a default value based on the field
        let formattedValue = value
        if (!value) {
          formattedValue = "0.00"
        } else {
          formattedValue = formatDecimalValue(value, 2)
        }

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

  const handleVisibilityChange = (section: string) => {
    setSectionVisibility((prev: Record<string, boolean>) => ({
      ...prev,
      [section]: !prev[section],
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
      incentives: true,
      cumulativeCashflow: false,
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
                  <FormLabel className="flex items-center">
                    Average Rate/kWh <span className="text-red-500 ml-1">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.15"
                      {...field}
                      value={formData.averageRateKWh}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
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

          {/* Solar Panel Design Image Dialog */}
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

          {/* Energy Usage Data */}
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

          {/* Battery Fields section */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Battery Fields</h3>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => toggleAllBatteryFields(true)}
                >
                  Enable All
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => toggleAllBatteryFields(false)}
                >
                  Disable All
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Battery Name */}
              <div className="space-y-2 border p-3 rounded-md relative">
                <div className="absolute top-3 right-3">
                  <Switch
                    checked={enabledBatteryFields.batteryName}
                    onCheckedChange={() => toggleBatteryField("batteryName")}
                  />
                </div>
                <Label
                  htmlFor="batteryName"
                  className={!enabledBatteryFields.batteryName ? "text-muted-foreground" : ""}
                >
                  Battery Name
                </Label>
                <Input
                  id="batteryName"
                  name="batteryName"
                  type="text"
                  value={formData.batteryName}
                  onChange={handleChange}
                  disabled={!enabledBatteryFields.batteryName}
                  placeholder="Tesla Powerwall"
                />
              </div>

              {/* Inverter Name */}
              <div className="space-y-2 border p-3 rounded-md relative">
                <div className="absolute top-3 right-3">
                  <Switch
                    checked={enabledBatteryFields.inverterName}
                    onCheckedChange={() => toggleBatteryField("inverterName")}
                  />
                </div>
                <Label
                  htmlFor="inverterName"
                  className={!enabledBatteryFields.inverterName ? "text-muted-foreground" : ""}
                >
                  Inverter Name
                </Label>
                <Input
                  id="inverterName"
                  name="inverterName"
                  type="text"
                  value={formData.inverterName}
                  onChange={handleChange}
                  disabled={!enabledBatteryFields.inverterName}
                  placeholder="SolarEdge SE7600H"
                />
              </div>

              {/* Capacity */}
              <div className="space-y-2 border p-3 rounded-md relative">
                <div className="absolute top-3 right-3">
                  <Switch
                    checked={enabledBatteryFields.capacity}
                    onCheckedChange={() => toggleBatteryField("capacity")}
                  />
                </div>
                <Label
                  htmlFor="capacity"
                  className={!enabledBatteryFields.capacity ? "text-muted-foreground" : ""}
                >
                  Capacity (kWh)
                </Label>
                <Input
                  id="capacity"
                  name="capacity"
                  type="number"
                  step="0.01"
                  value={formData.capacity}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={!enabledBatteryFields.capacity}
                  placeholder="13.50"
                />
              </div>

              {/* Output KW */}
              <div className="space-y-2 border p-3 rounded-md relative">
                <div className="absolute top-3 right-3">
                  <Switch
                    checked={enabledBatteryFields.outputKW}
                    onCheckedChange={() => toggleBatteryField("outputKW")}
                  />
                </div>
                <Label
                  htmlFor="outputKW"
                  className={!enabledBatteryFields.outputKW ? "text-muted-foreground" : ""}
                >
                  Output (kW)
                </Label>
                <Input
                  id="outputKW"
                  name="outputKW"
                  type="number"
                  step="0.01"
                  value={formData.outputKW}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={!enabledBatteryFields.outputKW}
                  placeholder="7.60"
                />
              </div>

              {/* Cost */}
              <div className="space-y-2 border p-3 rounded-md relative">
                <div className="absolute top-3 right-3">
                  <Switch
                    checked={enabledBatteryFields.cost}
                    onCheckedChange={() => toggleBatteryField("cost")}
                  />
                </div>
                <Label
                  htmlFor="cost"
                  className={!enabledBatteryFields.cost ? "text-muted-foreground" : ""}
                >
                  Cost ($)
                </Label>
                <Input
                  id="cost"
                  name="cost"
                  type="number"
                  step="0.01"
                  value={formData.cost}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={!enabledBatteryFields.cost}
                  placeholder="8500.00"
                />
              </div>

              {/* Battery Image */}
              <div className="space-y-2 border p-3 rounded-md relative">
                <div className="absolute top-3 right-3">
                  <Switch
                    checked={enabledBatteryFields.batteryImage}
                    onCheckedChange={() => toggleBatteryField("batteryImage")}
                  />
                </div>
                <Label
                  htmlFor="batteryImage"
                  className={!enabledBatteryFields.batteryImage ? "text-muted-foreground" : ""}
                >
                  Battery Image
                </Label>
                <div className="space-y-4">
                  <ImageGalleryDialog
                    initialImage={formData.batteryImage}
                    onSelect={handleBatteryImageSelect}
                    imageType="battery"
                    disabled={!enabledBatteryFields.batteryImage}
                  />
                  {formData.batteryImage && enabledBatteryFields.batteryImage && (
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

          {/* Financing Options section */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Financing Options</h3>
              <div className="flex gap-2">
                <Button
                  type="button"
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
                  Enable All
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Toggle all finance fields to be disabled
                    const allFields = Object.keys(enabledFinanceFields).reduce(
                      (acc, key) => {
                        acc[key as keyof typeof enabledFinanceFields] = false
                        return acc
                      },
                      { ...enabledFinanceFields },
                    )
                    setEnabledFinanceFields(allFields)
                  }}
                >
                  Disable All
                </Button>
              </div>
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

              {/* Incentives - Moved to financing section */}
              <div className="space-y-2 border p-3 rounded-md relative">
                <div className="absolute top-3 right-3">
                  <Switch
                    checked={enabledFinanceFields.incentives}
                    onCheckedChange={() => toggleFinanceField("incentives")}
                  />
                </div>
                <Label htmlFor="incentives" className={!enabledFinanceFields.incentives ? "text-muted-foreground" : ""}>
                  Incentives ($)
                </Label>
                <Input
                  id="incentives"
                  name="incentives"
                  type="number"
                  step="0.01"
                  value={formData.incentives}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={!enabledFinanceFields.incentives}
                  placeholder="9100.00"
                />
              </div>

              {/* Cumulative Cash Flow Chart */}
              <div className="space-y-2 border p-3 rounded-md relative">
                <div className="absolute top-3 right-3">
                  <Switch
                    checked={enabledFinanceFields.cumulativeCashflow}
                    onCheckedChange={() => toggleFinanceField("cumulativeCashflow")}
                  />
                </div>
                <Label htmlFor="cumulativeCashflow" className={!enabledFinanceFields.cumulativeCashflow ? "text-muted-foreground" : ""}>
                  Cumulative Cash Flow Chart
                </Label>
                <p className="text-sm text-muted-foreground">Show the cumulative cash flow chart and ROI information</p>
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
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              {/* Storage System Model */}
              <div className="space-y-2 border p-3 rounded-md relative">
                <div className="absolute top-3 right-3">
                  <Switch
                    checked={enabledBatteryFields.storageSystemModel}
                    onCheckedChange={() => toggleBatteryField("storageSystemModel")}
                  />
                </div>
                <Label
                  htmlFor="storageSystemModel"
                  className={!enabledBatteryFields.storageSystemModel ? "text-muted-foreground" : ""}
                >
                  Storage System Model
                </Label>
                <Input
                  id="storageSystemModel"
                  name="storageSystemModel"
                  type="text"
                  value={formData.storageSystemModel}
                  onChange={handleChange}
                  disabled={!enabledBatteryFields.storageSystemModel}
                />
              </div>
              {/* Storage System Quantity */}
              <div className="space-y-2 border p-3 rounded-md relative">
                <div className="absolute top-3 right-3">
                  <Switch
                    checked={enabledBatteryFields.storageSystemQuantity}
                    onCheckedChange={() => toggleBatteryField("storageSystemQuantity")}
                  />
                </div>
                <Label
                  htmlFor="storageSystemQuantity"
                  className={!enabledBatteryFields.storageSystemQuantity ? "text-muted-foreground" : ""}
                >
                  Storage System Quantity
                </Label>
                <Input
                  id="storageSystemQuantity"
                  name="storageSystemQuantity"
                  type="number"
                  value={formData.storageSystemQuantity}
                  onChange={handleChange}
                  disabled={!enabledBatteryFields.storageSystemQuantity}
                />
              </div>
              {/* Storage System Price */}
              <div className="space-y-2 border p-3 rounded-md relative">
                <div className="absolute top-3 right-3">
                  <Switch
                    checked={enabledBatteryFields.storageSystemPrice}
                    onCheckedChange={() => toggleBatteryField("storageSystemPrice")}
                  />
                </div>
                <Label
                  htmlFor="storageSystemPrice"
                  className={!enabledBatteryFields.storageSystemPrice ? "text-muted-foreground" : ""}
                >
                  Storage System Price ($)
                </Label>
                <Input
                  id="storageSystemPrice"
                  name="storageSystemPrice"
                  type="number"
                  step="0.01"
                  value={formData.storageSystemPrice}
                  onChange={handleChange}
                  disabled={!enabledBatteryFields.storageSystemPrice}
                />
              </div>
            </div>
          </div>

          {/* Section visibility controls */}
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

          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditing ? "Updating..." : "Submitting..."}
                </>
              ) : isEditing ? (
                "Update Proposal"
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

