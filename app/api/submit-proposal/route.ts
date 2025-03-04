import { NextResponse } from "next/server"
import pool from "@/lib/db"

export async function POST(request: Request) {
    try {
        const body = await request.json()

        const query = `
            INSERT INTO solar_proposals (
                name, address, average_rate_kwh, fixed_costs, escalation, monthly_bill,
                number_of_solar_panels, yearly_energy_produced, energy_offset, solar_panel_design,
                battery_name, inverter_name, operating_mode, capacity, output_kw, cost,
                backup_allocation, battery_image, essentials_days, appliances_days, whole_home_days,
                payback_period, total_system_cost, lifetime_savings, net_cost, incentives,
                solar_system_model, solar_system_quantity, solar_system_price,
                storage_system_model, storage_system_quantity, storage_system_price,
                energy_data, status
            ) VALUES (
                         $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16,
                         $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32,
                         $33, $34
                     ) RETURNING *
        `

        const values = [
            body.name,
            body.address,
            Number.parseFloat(body.averageRateKWh),
            Number.parseFloat(body.fixedCosts),
            Number.parseFloat(body.escalation),
            Number.parseFloat(body.monthlyBill),
            Number.parseInt(body.numberOfSolarPanels),
            Number.parseInt(body.yearlyEnergyProduced),
            Number.parseInt(body.energyOffset),
            body.solarPanelDesign,
            body.batteryName,
            body.inverterName,
            body.operatingMode,
            Number.parseFloat(body.capacity),
            Number.parseFloat(body.outputKW),
            Number.parseFloat(body.cost),
            body.backupAllocation,
            body.batteryImage,
            Number.parseFloat(body.essentialsDays),
            Number.parseFloat(body.appliancesDays),
            Number.parseFloat(body.wholeHomeDays),
            Number.parseFloat(body.paybackPeriod),
            Number.parseFloat(body.totalSystemCost),
            Number.parseFloat(body.lifetimeSavings),
            Number.parseFloat(body.netCost),
            Number.parseFloat(body.incentives),
            body.solarSystemModel,
            Number.parseInt(body.solarSystemQuantity),
            Number.parseFloat(body.solarSystemPrice),
            body.storageSystemModel,
            Number.parseInt(body.storageSystemQuantity),
            Number.parseFloat(body.storageSystemPrice),
            body.energyData,
            body.status || "in_progress",
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

