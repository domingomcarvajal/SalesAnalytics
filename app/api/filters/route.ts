import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET() {
  try {
    const salespeople = await sql`
      SELECT DISTINCT sales_person
      FROM meetings
      ORDER BY sales_person
    `

    const closedStatuses = await sql`
      SELECT DISTINCT closed
      FROM meetings
      ORDER BY closed
    `

    // Fetch industries from the industries table
    const industries = await sql`
      SELECT id, name
      FROM industries
      ORDER BY name
    `

    return NextResponse.json({
      salespeople: salespeople.map((s) => s.sales_person),
      closedStatuses: closedStatuses.map((c) => c.closed ? "Won" : "Open"),
      industries: industries.map((i) => ({ id: i.id, name: i.name })),
    })
  } catch (error) {
    console.error("[v0] Filters error:", error)
    return NextResponse.json({ error: "Failed to fetch filters" }, { status: 500 })
  }
}
