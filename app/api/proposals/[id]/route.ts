import { NextResponse } from "next/server"
import pool from "@/lib/db"

// Helper functions for validation
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
    // Remove any decimal part before parsing as integer
    value = value.replace(/,/g, "").split(".")[0]
  }

  // Use parseInt for integer values
  const parsedValue = Number.parseInt(value, 10)

  if (isNaN(parsedValue)) {
    return null
  }

  return parsedValue
}

// GET handler to fetch a specific proposal
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    // Query to get the proposal by ID
    const query = `SELECT * FROM solar_proposals WHERE id = $1`
    const result = await pool.query(query, [id])

    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, message: "Proposal not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, proposal: result.rows[0] }, { status: 200 })
  } catch (error: any) {
    console.error("Error fetching proposal:", error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}

// PUT handler to update a proposal
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const body = await request.json()

    // Debug: Log the incoming data
    console.log("Updating proposal with data:", body)

    // Map form data to database columns
    const values = [
      body.name || "",
      body.address || "",
      validateDecimal(body.averageRateKWh),
      validateDecimal(body.fixedCosts),
      validateDecimal(body.escalation),
      validateDecimal(body.monthlyBill),
      validateInteger(body.numberOfSolarPanels),
      validateInteger(body.yearlyEnergyProduced),
      validateInteger(body.yearlyEnergyUsage),
      validateDecimal(body.systemSize),
      validateInteger(body.energyOffset),
      body.solarPanelDesign || "",
      body.batteryName || "",
      body.inverterName || "",
      body.operatingMode || "",
      validateDecimal(body.capacity),
      validateDecimal(body.outputKW),
      validateDecimal(body.cost),
      body.backupAllocation || "",
      body.batteryImage || "",
      validateDecimal(body.paybackPeriod),
      validateDecimal(body.totalSystemCost),
      validateDecimal(body.lifetimeSavings),
      validateDecimal(body.netCost),
      validateDecimal(body.incentives),
      body.solarSystemModel || "",
      validateInteger(body.solarSystemQuantity),
      validateDecimal(body.solarSystemPrice),
      body.storageSystemModel || "",
      validateInteger(body.storageSystemQuantity),
      validateDecimal(body.storageSystemPrice),
      body.financingType || "",
      validateDecimal(body.apr),
      validateInteger(body.duration),
      validateDecimal(body.downPayment),
      validateDecimal(body.financedAmount),
      validateDecimal(body.monthlyPayments),
      validateDecimal(body.solarRate),
      validateDecimal(body.escalationRate),
      validateDecimal(body.year1MonthlyPayments),
      body.energyData || "",
      body.section_visibility || body.sectionVisibility || "",
      body.enabled_finance_fields || body.enabledFinanceFields || "",
      body.enabled_battery_fields || body.enabledBatteryFields || "",
      id, // The last parameter is the ID for the WHERE clause
    ]

    // Construct the UPDATE query with explicit column mapping
    const query = `
      UPDATE solar_proposals SET
        name = $1,
        address = $2,
        average_rate_kwh = $3,
        fixed_costs = $4,
        escalation = $5,
        monthly_bill = $6,
        number_of_solar_panels = $7,
        yearly_energy_produced = $8,
        yearly_energy_usage = $9,
        system_size = $10,
        energy_offset = $11,
        solar_panel_design = $12,
        battery_name = $13,
        inverter_name = $14,
        operating_mode = $15,
        capacity = $16,
        output_kw = $17,
        cost = $18,
        backup_allocation = $19,
        battery_image = $20,
        payback_period = $21,
        total_system_cost = $22,
        lifetime_savings = $23,
        net_cost = $24,
        incentives = $25,
        solar_system_model = $26,
        solar_system_quantity = $27,
        solar_system_price = $28,
        storage_system_model = $29,
        storage_system_quantity = $30,
        storage_system_price = $31,
        financing_type = $32,
        apr = $33,
        duration = $34,
        down_payment = $35,
        financed_amount = $36,
        monthly_payments = $37,
        solar_rate = $38,
        escalation_rate = $39,
        year1_monthly_payments = $40,
        energy_data = $41,
        section_visibility = $42,
        enabled_finance_fields = $43,
        enabled_battery_fields = $44
      WHERE id = $45
      RETURNING *
    `

    console.log("Executing query:", query)
    console.log("With values:", values)

    const result = await pool.query(query, values)

    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, message: "Proposal not found or update failed" }, { status: 404 })
    }

    return NextResponse.json({ success: true, proposal: result.rows[0] }, { status: 200 })
  } catch (error: any) {
    console.error("Error updating proposal:", error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}

// DELETE handler to delete a proposal
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    // Query to delete the proposal
    const query = `DELETE FROM solar_proposals WHERE id = $1 RETURNING id`
    const result = await pool.query(query, [id])

    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, message: "Proposal not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: "Proposal deleted successfully" }, { status: 200 })
  } catch (error: any) {
    console.error("Error deleting proposal:", error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}
