import { NextResponse } from "next/server"
import pool from "@/lib/db"

// Helper functions
function validateDecimal(value: any): number {
  if (value === null || value === undefined || value === "") {
    return 0 // Return 0 instead of null for empty values
  }

  // Handle string values that might contain commas or currency symbols
  if (typeof value === "string") {
    value = value.replace(/[$,]/g, "")
  }

  const parsedValue = Number.parseFloat(value)

  if (isNaN(parsedValue)) {
    return 0 // Return 0 instead of null for invalid values
  }

  return parsedValue
}

function validateInteger(value: any): number {
  if (value === null || value === undefined || value === "") {
    return 0 // Return 0 instead of null for empty values
  }

  // Handle string values that might contain commas
  if (typeof value === "string") {
    // Remove any decimal part before parsing as integer
    value = value.replace(/,/g, "").split(".")[0]
  }

  // Use parseInt for integer values
  const parsedValue = Number.parseInt(value, 10)

  if (isNaN(parsedValue)) {
    return 0 // Return 0 instead of null for invalid values
  }

  return parsedValue
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log("Received form data:", body)

    // Extract fields from the request body
    const {
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
      enabled_battery_fields,
    } = body

    // Debug the field types
    console.log("system_size value:", system_size, "type:", typeof system_size)

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

    // Ensure all required numeric fields have values
    const parsedAverageRate = Number.parseFloat(average_rate_kwh) || 0.15

    // For system_size, we need to ensure it's treated as a decimal
    const parsedSystemSize = Number.parseFloat(system_size) || 0
    console.log("Parsed system_size:", parsedSystemSize)

    // Prepare the values array with proper type handling
    const values = [
      name || "Guest",
      address || "123 Solar Street",
      parsedAverageRate, // Use directly parsed value with fallback
      validateDecimal(fixed_costs),
      validateDecimal(escalation),
      validateDecimal(monthly_bill),
      validateInteger(number_of_solar_panels),
      validateInteger(yearly_energy_produced),
      validateInteger(yearly_energy_usage),
      validateDecimal(system_size), // Use directly parsed value for system_size
      validateInteger(energy_offset),
      solar_panel_design || "",
      battery_name || "",
      inverter_name || "",
      operating_mode || "Backup",
      validateDecimal(capacity),
      validateDecimal(output_kw),
      validateDecimal(cost),
      backup_allocation || "",
      battery_image || "",
      validateDecimal(payback_period),
      validateDecimal(total_system_cost),
      validateDecimal(lifetime_savings),
      validateDecimal(net_cost),
      validateDecimal(incentives),
      solar_system_model || "",
      validateInteger(solar_system_quantity),
      validateDecimal(solar_system_price),
      storage_system_model || "",
      validateInteger(storage_system_quantity),
      validateDecimal(storage_system_price),
      financing_type || "Cash",
      validateDecimal(apr),
      validateInteger(duration),
      validateDecimal(down_payment),
      validateDecimal(financed_amount),
      validateDecimal(monthly_payments),
      validateDecimal(solar_rate),
      validateDecimal(escalation_rate),
      validateDecimal(year1_monthly_payments),
      energy_data || "",
      section_visibility || {
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
      enabled_finance_fields || {
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
      enabled_battery_fields || {
        batteryName: true,
        inverterName: true,
        capacity: true,
        outputKW: true,
        cost: true,
        batteryImage: true,
      },
    ]

    // Log the query and values for debugging
    console.log("Executing query:", query)
    console.log("With values:", values)
    console.log("system_size value in array:", values[9])

    // Execute the query
    const result = await pool.query(query, values)

    // Return the created proposal
    return NextResponse.json({ success: true, data: result.rows[0] }, { status: 201 })
  } catch (error: any) {
    console.error("Error creating proposal:", error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}

