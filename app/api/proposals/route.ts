import { NextResponse } from "next/server"
import pool from "@/lib/db"

export async function GET() {
    try {
        const query = `
      SELECT id, name, address, status, created_at, total_system_cost
      FROM solar_proposals
      ORDER BY created_at DESC
    `

        const result = await pool.query(query)
        const proposals = result.rows

        return NextResponse.json({ success: true, proposals })
    } catch (error) {
        console.error("Error fetching proposals:", error)
        return NextResponse.json({ success: false, error: "Failed to fetch proposals" }, { status: 500 })
    }
}

