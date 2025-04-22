import { NextResponse } from "next/server"
import { getPool } from "@/lib/db"

export async function GET(request: Request) {
  const pool = getPool();
  
  try {
    // Add cache-busting query parameter to prevent caching
    const timestamp = new Date().getTime()
    const { searchParams } = new URL(request.url)
    const t = searchParams.get('t')

    // Query to get all proposals
    const query = `SELECT * FROM solar_proposals ORDER BY created_at DESC`
    const result = await pool.query(query)

    return NextResponse.json(
      { 
        success: true, 
        proposals: result.rows,
        timestamp: new Date().toISOString()
      }, 
      { 
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        }
      }
    )
  } catch (error: any) {
    console.error("Error fetching proposals:", error)
    return NextResponse.json(
      { 
        success: false, 
        message: error.message || "An error occurred while fetching proposals",
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }, 
      { status: 500 }
    )
  }
}

