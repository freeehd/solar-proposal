import { NextResponse } from "next/server"
import pool from "@/lib/db"

// Helper functions
function validateDecimal(value: any): number | null {
  console.log("validateDecimal input:", value, "type:", typeof value)

  if (value === null || value === undefined || value === "") {
    console.log("validateDecimal: empty value, returning null")
    return null
  }

  // Handle string values that might contain commas or currency symbols
  if (typeof value === "string") {
    const cleanedValue = value.replace(/[$,]/g, "")
    console.log("validateDecimal: cleaned string value:", cleanedValue)
    value = cleanedValue
  }

  const parsedValue = Number.parseFloat(value)
  console.log("validateDecimal: parsed value:", parsedValue, "isNaN:", isNaN(parsedValue))

  if (isNaN(parsedValue)) {
    console.log("validateDecimal: invalid number, returning null")
    return null
  }

  console.log("validateDecimal: returning valid number:", parsedValue)
  return parsedValue
}

function validateInteger(value: any): number | null {
  console.log("validateInteger input:", value, "type:", typeof value)

  if (value === null || value === undefined || value === "") {
    console.log("validateInteger: empty value, returning null")
    return null
  }

  // Handle string values that might contain commas
  if (typeof value === "string") {
    // Remove any decimal part before parsing as integer
    const cleanedValue = value.replace(/,/g, "").split(".")[0]
    console.log("validateInteger: cleaned string value:", cleanedValue)
    value = cleanedValue
  }

  // Use parseInt for integer values
  const parsedValue = Number.parseInt(value, 10)
  console.log("validateInteger: parsed value:", parsedValue, "isNaN:", isNaN(parsedValue))

  if (isNaN(parsedValue)) {
    console.log("validateInteger: invalid number, returning null")
    return null
  }

  console.log("validateInteger: returning valid number:", parsedValue)
  return parsedValue
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log("Received form data:", JSON.stringify(body, null, 2))

    // Check if we're receiving the data in camelCase or snake_case
    console.log("Form data structure check:")
    console.log("Has fixedCosts:", body.hasOwnProperty("fixedCosts"))
    console.log("Has fixed_costs:", body.hasOwnProperty("fixed_costs"))

    // Extract fields from the request body - handle both camelCase and snake_case
    const fixed_costs = body.fixedCosts || body.fixed_costs
    console.log("Extracted fixed_costs:", fixed_costs, "type:", typeof fixed_costs)

    // Map all fields properly
    const formData = {
      name: body.name || body.name,
      address: body.address || body.address,
      average_rate_kwh: body.averageRateKWh || body.average_rate_kwh,
      fixed_costs: body.fixedCosts || body.fixed_costs,
      escalation: body.escalation || body.escalation,
      monthly_bill: body.monthlyBill || body.monthly_bill,
      number_of_solar_panels: body.numberOfSolarPanels || body.number_of_solar_panels,
      yearly_energy_produced: body.yearlyEnergyProduced || body.yearly_energy_produced,
      yearly_energy_usage: body.yearlyEnergyUsage || body.yearly_energy_usage,
      system_size: body.systemSize || body.system_size,
      energy_offset: body.energyOffset || body.energy_offset,
      solar_panel_design: body.solarPanelDesign || body.solar_panel_design,
      battery_name: body.batteryName || body.battery_name,
      inverter_name: body.inverterName || body.inverter_name,
      operating_mode: body.operatingMode || body.operating_mode,
      capacity: body.capacity || body.capacity,
      output_kw: body.outputKW || body.output_kw,
      cost: body.cost || body.cost,
      backup_allocation: body.backupAllocation || body.backup_allocation,
      battery_image: body.batteryImage || body.battery_image,
      payback_period: body.paybackPeriod || body.payback_period,
      total_system_cost: body.totalSystemCost || body.total_system_cost,
      lifetime_savings: body.lifetimeSavings || body.lifetime_savings,
      net_cost: body.netCost || body.net_cost,
      incentives: body.incentives || body.incentives,
      solar_system_model: body.solarSystemModel || body.solar_system_model,
      solar_system_quantity: body.solarSystemQuantity || body.solar_system_quantity,
      solar_system_price: body.solarSystemPrice || body.solar_system_price,
      storage_system_model: body.storageSystemModel || body.storage_system_model,
      storage_system_quantity: body.storageSystemQuantity || body.storage_system_quantity,
      storage_system_price: body.storageSystemPrice || body.storage_system_price,
      financing_type: body.financingType || body.financing_type,
      apr: body.apr || body.apr,
      duration: body.duration || body.duration,
      down_payment: body.downPayment || body.down_payment,
      financed_amount: body.financedAmount || body.financed_amount,
      monthly_payments: body.monthlyPayments || body.monthly_payments,
      solar_rate: body.solarRate || body.solar_rate,
      escalation_rate: body.escalationRate || body.escalation_rate,
      year1_monthly_payments: body.year1MonthlyPayments || body.year1_monthly_payments,
      energy_data: body.energyData || body.energy_data,
      section_visibility: body.sectionVisibility || body.section_visibility,
      enabled_finance_fields: body.enabledFinanceFields || body.enabled_finance_fields,
      enabled_battery_fields: body.enabledBatteryFields || body.enabled_battery_fields,
    }

    // Log all decimal values for debugging
    console.log("Decimal values before processing:")
    console.log("fixed_costs:", formData.fixed_costs, "type:", typeof formData.fixed_costs)
    console.log("system_size:", formData.system_size, "type:", typeof formData.system_size)
    console.log("capacity:", formData.capacity, "type:", typeof formData.capacity)

    // Prepare the query
    const query = `
      INSERT INTO solar_proposals (
        name,
        address,
        average_rate_kwh,
        fixed_costs,
        escalation,
        monthly_bill,
        number_of_solar_panels,
        yearly_energy_produced,
        yearly_energy_usage,
        system_size,
        energy_offset,
        solar_panel_design,
        battery_name,
        inverter_name,
        operating_mode,
        capacity,
        output_kw,
        cost,
        backup_allocation,
        battery_image,
        payback_period,
        total_system_cost,
        lifetime_savings,
        net_cost,
        incentives,
        solar_system_model,
        solar_system_quantity,
        solar_system_price,
        storage_system_model,
        storage_system_quantity,
        storage_system_price,
        financing_type,
        apr,
        duration,
        down_payment,
        financed_amount,
        monthly_payments,
        solar_rate,
        escalation_rate,
        year1_monthly_payments,
        energy_data,
        section_visibility,
        enabled_finance_fields,
        enabled_battery_fields
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
        $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35, $36, $37, $38, $39, $40, $41, $42, $43, $44
      ) RETURNING *
    `

    // Process and validate each value individually for better debugging
    const validatedFixedCosts = validateDecimal(formData.fixed_costs)
    console.log("Validated fixed_costs:", validatedFixedCosts)

    const validatedSystemSize = validateDecimal(formData.system_size)
    console.log("Validated system_size:", validatedSystemSize)

    // Prepare the values array with proper type handling
    const values = [
      formData.name || "Guest",
      formData.address || "123 Solar Street",
      validateDecimal(formData.average_rate_kwh) || 0.15,
      validatedFixedCosts, // Use the pre-validated value
      validateDecimal(formData.escalation),
      validateDecimal(formData.monthly_bill),
      validateInteger(formData.number_of_solar_panels),
      validateInteger(formData.yearly_energy_produced),
      validateInteger(formData.yearly_energy_usage),
      validatedSystemSize, // Use the pre-validated value
      validateInteger(formData.energy_offset),
      formData.solar_panel_design || "",
      formData.battery_name || "",
      formData.inverter_name || "",
      formData.operating_mode || "Backup",
      validateDecimal(formData.capacity),
      validateDecimal(formData.output_kw),
      validateDecimal(formData.cost),
      formData.backup_allocation || "",
      formData.battery_image || "",
      validateDecimal(formData.payback_period),
      validateDecimal(formData.total_system_cost),
      validateDecimal(formData.lifetime_savings),
      validateDecimal(formData.net_cost),
      validateDecimal(formData.incentives),
      formData.solar_system_model || "",
      validateInteger(formData.solar_system_quantity),
      validateDecimal(formData.solar_system_price),
      formData.storage_system_model || "",
      validateInteger(formData.storage_system_quantity),
      validateDecimal(formData.storage_system_price),
      formData.financing_type || "Cash",
      validateDecimal(formData.apr),
      validateInteger(formData.duration),
      validateDecimal(formData.down_payment),
      validateDecimal(formData.financed_amount),
      validateDecimal(formData.monthly_payments),
      validateDecimal(formData.solar_rate),
      validateDecimal(formData.escalation_rate),
      validateDecimal(formData.year1_monthly_payments),
      formData.energy_data || "",
      formData.section_visibility || {
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
      formData.enabled_finance_fields || {
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
      },
      formData.enabled_battery_fields || {
        batteryName: true,
        inverterName: true,
        capacity: true,
        outputKW: true,
        cost: true,
        batteryImage: true,
      },
    ]

    // Log the values for debugging
    console.log("fixed_costs value in array:", values[3])
    console.log("system_size value in array:", values[9])

    // For now, let's handle NOT NULL constraints by providing default values
    // This is temporary until we find the root cause
    for (let i = 0; i < values.length; i++) {
      if (values[i] === null && (i === 3 || i === 4 || i === 5 || i === 9 || i === 15 || i === 16 || i === 17)) {
        console.log(`WARNING: Replacing null value at index ${i} with 0 to satisfy NOT NULL constraint`)
        values[i] = 0
      }
    }

    // Execute the query
    const result = await pool.query(query, values)

    // Return the created proposal
    return NextResponse.json({ success: true, data: result.rows[0] }, { status: 201 })
  } catch (error: any) {
    console.error("Error creating proposal:", error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}
