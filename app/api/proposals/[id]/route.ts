import { NextResponse } from "next/server"
import pool from "@/lib/db"

// Helper functions from the submit-proposal route
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

    // Build the SET part of the query dynamically based on the fields in the body
    const updateFields: string[] = []
    const values: any[] = []
    let paramIndex = 1

    // Add each field from the body to the update query
    for (const [key, value] of Object.entries(body)) {
      // Skip the id field
      if (key === "id") continue

      updateFields.push(`${key} = $${paramIndex}`)

      // Handle different data types
      if (
        key.includes("_cost") ||
        key.includes("price") ||
        key.includes("bill") ||
        key.includes("savings") ||
        key.includes("payment") ||
        key.includes("amount") ||
        key.includes("rate") ||
        key === "apr" ||
        key === "capacity" ||
        key === "output_kw" ||
        key === "fixed_costs" ||
        key === "escalation" ||
        key === "system_size" ||
        key === "payback_period"
      ) {
        // For decimal fields
        const decimalValue = validateDecimal(value)
        values.push(decimalValue)
        console.log(`Field ${key} (param $${paramIndex}) parsed as decimal:`, value, "→", decimalValue)
      } else if (key.includes("quantity") || key.includes("number") || key.includes("offset") || key === "duration") {
        // For integer fields
        const intValue = validateInteger(value)
        values.push(intValue)
        console.log(`Field ${key} (param $${paramIndex}) parsed as integer:`, value, "→", intValue)
      } else if (key === "section_visibility" || key === "enabled_finance_fields" || key === "energy_data") {
        // For JSON fields
        values.push(value)
        console.log(`Field ${key} (param $${paramIndex}) kept as JSON`)
      } else {
        // For string fields
        values.push(value)
        console.log(`Field ${key} (param $${paramIndex}) kept as string:`, value)
      }

      paramIndex++
    }

    // Add the id as the last parameter
    values.push(id)
    console.log(`ID (param $${paramIndex}):`, id)

    // Construct the full query
    const query = `
      UPDATE solar_proposals
      SET ${updateFields.join(", ")}
      WHERE id = $${paramIndex}
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

