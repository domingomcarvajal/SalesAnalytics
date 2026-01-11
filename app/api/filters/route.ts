import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET() {
  try {
    const industries = await sql`
      SELECT DISTINCT industry
      FROM meetings
      ORDER BY industry
    `

    const salespeople = await sql`
      SELECT DISTINCT salesperson
      FROM meetings
      ORDER BY salesperson
    `

    const dealStatuses = await sql`
      SELECT DISTINCT deal_status
      FROM meetings
      ORDER BY deal_status
    `

    return NextResponse.json({
      industries: industries.map((i) => i.industry),
      salespeople: salespeople.map((s) => s.salesperson),
      dealStatuses: dealStatuses.map((d) => d.deal_status),
    })
  } catch (error) {
    console.error("[v0] Filters error:", error)
    return NextResponse.json({ error: "Failed to fetch filters" }, { status: 500 })
  }
}
