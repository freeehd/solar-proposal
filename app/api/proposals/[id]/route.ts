import { NextResponse } from "next/server"
import pool from "@/lib/db"

export async function GET(request: Request, { params }: { params: { id: string } }) {
    try {
        const { id } = params
        const query = `
            SELECT *, battery_image
            FROM solar_proposals
            WHERE id = $1
        `
        const result = await pool.query(query, [id])
        const proposal = result.rows[0]

        if (!proposal) {
            return NextResponse.json({ success: false, error: "Proposal not found" }, { status: 404 })
        }

        return NextResponse.json({ success: true, proposal })
    } catch (error) {
        console.error("Error fetching proposal:", error)
        return NextResponse.json({ success: false, error: "Failed to fetch proposal" }, { status: 500 })
    }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
    try {
        const { id } = params
        const body = await request.json()
        const { name, address, total_system_cost } = body

        const query = `
            UPDATE solar_proposals
            SET name = $1, address = $2, total_system_cost = $3
            WHERE id = $4
                RETURNING *
        `

        const result = await pool.query(query, [name, address, total_system_cost, id])
        const updatedProposal = result.rows[0]

        if (!updatedProposal) {
            return NextResponse.json({ success: false, error: "Proposal not found" }, { status: 404 })
        }

        return NextResponse.json({ success: true, proposal: updatedProposal })
    } catch (error) {
        console.error("Error updating proposal:", error)
        return NextResponse.json({ success: false, error: "Failed to update proposal" }, { status: 500 })
    }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
    try {
        const { id } = params
        const body = await request.json()
        const { status } = body

        const query = `
            UPDATE solar_proposals
            SET status = $1
            WHERE id = $2
                RETURNING *
        `

        const result = await pool.query(query, [status, id])
        const updatedProposal = result.rows[0]

        if (!updatedProposal) {
            return NextResponse.json({ success: false, error: "Proposal not found" }, { status: 404 })
        }

        return NextResponse.json({ success: true, proposal: updatedProposal })
    } catch (error) {
        console.error("Error updating proposal status:", error)
        return NextResponse.json({ success: false, error: "Failed to update proposal status" }, { status: 500 })
    }
}

