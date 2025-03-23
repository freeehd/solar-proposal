import { NextResponse } from "next/server"
import pool from "@/lib/db" // Import the pool from the provided module

function validateDecimal(value: any): number | null {
  if (value === null || value === undefined || value === "") {
    return null
  }

  // Handle string values that might contain commas or currency symbols
  if (typeof value === "string") {
    value = value.replace(/[$,]/g, "")
  }

  const parsedValue = Number.parseFloat(value)

  if (isNaN(parsedValue)) {
    return null
  }

  return parsedValue
}

function validateInteger(value: any): number | null {
  if (value === null || value === undefined || value === "") {
    return null
  }

  // Handle string values that might contain commas
  if (typeof value === "string") {
    value = value.replace(/,/g, "")
  }

  // Use parseInt for integer values
  const parsedValue = Number.parseInt(value, 10)

  if (isNaN(parsedValue)) {
    return null
  }

  return parsedValue
}

export async function POST(req: Request) {
  try {
    const body = await req.json()

    // Update the SQL query to include the new financial fields
    const query = `
 INSERT INTO solar_proposals (
     name, address, average_rate_kwh, fixed_costs, escalation, monthly_bill,
     number_of_solar_panels, yearly_energy_produced, yearly_energy_usage, system_size, energy_offset, solar_panel_design,
     battery_name, inverter_name, operating_mode, capacity, output_kw, cost,
     backup_allocation, battery_image, 
     payback_period, total_system_cost, lifetime_savings, net_cost, incentives,
     solar_system_model, solar_system_quantity, solar_system_price,
     storage_system_model, storage_system_quantity, storage_system_price,
     energy_data, status, section_visibility,
     financing_type, apr, duration, down_payment, financed_amount,
     monthly_payments, solar_rate, escalation_rate, year1_monthly_payments,
     enabled_finance_fields
 ) VALUES (
              $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16,
              $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31,
              $32, $33, $34, $35, $36, $37, $38, $39, $40, $41, $42, $43, $44
          ) RETURNING *
`

    // For PostgreSQL JSON columns, we can pass the object directly
    const sectionVisibility = body.sectionVisibility || {
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
    }

    // Store which finance fields are enabled
    const enabledFinanceFields = body.enabledFinanceFields || {
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
    }

    const values = [
      body.name,
      body.address,
      validateDecimal(body.averageRateKWh),
      validateDecimal(body.fixedCosts),
      validateDecimal(body.escalation),
      validateDecimal(body.monthlyBill),
      validateInteger(body.numberOfSolarPanels),
      validateInteger(body.yearlyEnergyProduced),
      validateInteger(body.yearlyEnergyUsage),
      validateDecimal(body.systemSize),
      validateInteger(body.energyOffset),
      body.solarPanelDesign,
      body.batteryName,
      body.inverterName,
      body.operatingMode,
      validateDecimal(body.capacity),
      validateDecimal(body.outputKW),
      validateDecimal(body.cost),
      body.backupAllocation,
      body.batteryImage,
      validateDecimal(body.paybackPeriod),
      validateDecimal(body.totalSystemCost),
      validateDecimal(body.lifetimeSavings),
      validateDecimal(body.netCost),
      validateDecimal(body.incentives),
      body.solarSystemModel,
      validateInteger(body.solarSystemQuantity),
      validateDecimal(body.solarSystemPrice),
      body.storageSystemModel,
      validateInteger(body.storageSystemQuantity),
      validateDecimal(body.storageSystemPrice),
      body.energyData,
      body.status || "in_progress",
      sectionVisibility,
      // Add new financial fields
      body.financingType || "Cash",
      validateDecimal(body.apr),
      validateInteger(body.duration),
      validateDecimal(body.downPayment),
      validateDecimal(body.financedAmount),
      validateDecimal(body.monthlyPayments),
      validateDecimal(body.solarRate),
      validateDecimal(body.escalationRate),
      validateDecimal(body.year1MonthlyPayments),
      enabledFinanceFields,
    ]

    const result = await pool.query(query, values)

    return NextResponse.json({ data: result.rows[0] }, { status: 201 })
  } catch (error: any) {
    console.error("Error submitting proposal:", error)
    return NextResponse.json({ message: error.message }, { status: 500 })
  }
}

