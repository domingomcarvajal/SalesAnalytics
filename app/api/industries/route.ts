import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET() {
  try {
    const industries = await sql`
      SELECT id, name
      FROM industries
      ORDER BY name
    `

    return NextResponse.json({
      industries: industries.map((i) => ({ id: i.id, name: i.name })),
    })
  } catch (error) {
    console.error("[v0] Industries error:", error)
    return NextResponse.json({ error: "Failed to fetch industries" }, { status: 500 })
  }
}

