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

        // Rename section_visibility to sectionVisibility for frontend consistency
        if (proposal.section_visibility) {
            proposal.sectionVisibility = proposal.section_visibility;
        } else {
            // Provide default values if section_visibility is missing
            proposal.sectionVisibility = {
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
                callToAction: false
            }
        }

        return NextResponse.json({ success: true, proposal })
    } catch (error) {
        console.error("Error fetching proposal:", error)
        return NextResponse.json({ success: false, error: "Failed to fetch proposal" }, { status: 500 })
    }
}

// Keep the rest of your PUT and PATCH methods unchanged