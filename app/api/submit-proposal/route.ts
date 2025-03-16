import { NextResponse } from "next/server"
import pool from "@/lib/db"

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validate numeric values to ensure they don't exceed database limits
    const validateDecimal = (value: any, defaultValue = 0) => {
      if (value === null || value === undefined || value === "") {
        return defaultValue
      }

      // Convert to number and check if it's within the DECIMAL(5,2) range
      const num = Number.parseFloat(String(value))
      if (isNaN(num)) {
        return defaultValue
      }

      // DECIMAL(5,2) has a max value of 999.99
      return Math.min(num, 999.99)
    }

    // Validate integer values
    const validateInteger = (value: any, defaultValue = 0) => {
      if (value === null || value === undefined || value === "") {
        return defaultValue
      }

      const num = Number.parseInt(String(value))
      if (isNaN(num)) {
        return defaultValue
      }

      // Limit to a reasonable value for integer columns
      return Math.min(num, 999)
    }

    const query = `
  INSERT INTO solar_proposals (
      name, address, average_rate_kwh, fixed_costs, escalation, monthly_bill,
      number_of_solar_panels, yearly_energy_produced, yearly_energy_usage, system_size, energy_offset, solar_panel_design,
      battery_name, inverter_name, operating_mode, capacity, output_kw, cost,
      backup_allocation, battery_image, 
      payback_period, total_system_cost, lifetime_savings, net_cost, incentives,
      solar_system_model, solar_system_quantity, solar_system_price,
      storage_system_model, storage_system_quantity, storage_system_price,
      energy_data, status, section_visibility
  ) VALUES (
               $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16,
               $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31,
               $32, $33, $34
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

    const values = [
      body.name,
      body.address,
      validateDecimal(body.averageRateKWh),
      validateDecimal(body.fixedCosts),
      validateDecimal(body.escalation),
      validateDecimal(body.monthlyBill),
      validateInteger(body.numberOfSolarPanels),
      validateInteger(body.yearlyEnergyProduced),
      validateInteger(body.yearlyEnergyUsage), // Add new field
      validateDecimal(body.systemSize), // Make sure this is using validateDecimal
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
      sectionVisibility, // Add the section visibility as the last parameter
    ]

    console.log("Query values:", values)

    const result = await pool.query(query, values)
    const proposal = result.rows[0]

    return NextResponse.json({ success: true, proposal })
  } catch (error) {
    console.error("Error submitting proposal:", error)
    return NextResponse.json({ success: false, error: "Failed to submit proposal" }, { status: 500 })
  }
}

