import { NextResponse } from "next/server"
import pool from "@/lib/db"

// Helper functions
function validateDecimal(value: any): number {
  if (value === null || value === undefined || value === "") {
    return 0
  }

  if (typeof value === "string") {
    value = value.replace(/[$,]/g, "")
  }

  const parsedValue = Number.parseFloat(value)
  return isNaN(parsedValue) ? 0 : parsedValue
}

function validateInteger(value: any): number {
  if (value === null || value === undefined || value === "") {
    return 0
  }

  if (typeof value === "string") {
    value = value.replace(/,/g, "").split(".")[0]
  }

  const parsedValue = Number.parseInt(value, 10)
  return isNaN(parsedValue) ? 0 : parsedValue
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log("Received form data:", body)

    // Validate required fields
    if (!body.name || !body.address) {
      return NextResponse.json(
        { success: false, message: "Name and address are required fields" },
        { status: 400 }
      )
    }

    // Extract and validate fields from the request body
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
        enabled_battery_fields,
        created_at,
        updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
        $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35, $36, $37, $38, $39, $40, $41, $42, $43, $44,
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      ) RETURNING *
    `

    // Prepare the values array with proper type handling
    const values = [
      name,
      address,
      validateDecimal(average_rate_kwh),
      validateDecimal(fixed_costs),
      validateDecimal(escalation),
      validateDecimal(monthly_bill),
      validateInteger(number_of_solar_panels),
      validateInteger(yearly_energy_produced),
      validateInteger(yearly_energy_usage),
      validateDecimal(system_size),
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
      section_visibility || {},
      enabled_finance_fields || {},
      enabled_battery_fields || {},
    ]

    // Execute the query
    const result = await pool.query(query, values)

    if (!result.rows[0]) {
      throw new Error("Failed to create proposal")
    }

    // Return the created proposal
    return NextResponse.json(
      { 
        success: true, 
        data: result.rows[0],
        message: "Proposal created successfully" 
      }, 
      { status: 201 }
    )
  } catch (error: any) {
    console.error("Error creating proposal:", error)
    return NextResponse.json(
      { 
        success: false, 
        message: error.message || "An error occurred while creating the proposal",
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }, 
      { status: 500 }
    )
  }
}

