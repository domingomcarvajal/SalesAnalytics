import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const industry = searchParams.get("industry")
    const salesperson = searchParams.get("salesperson")
    const dealStatus = searchParams.get("dealStatus")

    const whereConditions = []

    if (industry && industry !== "all") {
      whereConditions.push(`m.industry = '${industry}'`)
    }
    if (salesperson && salesperson !== "all") {
      whereConditions.push(`m.salesperson = '${salesperson}'`)
    }
    if (dealStatus && dealStatus !== "all") {
      whereConditions.push(`m.deal_status = '${dealStatus}'`)
    }

    const whereClause = whereConditions.length > 0 ? "WHERE " + whereConditions.join(" AND ") : ""

    const meetings = await sql.unsafe(`
      SELECT 
        m.id,
        m.meeting_date,
        m.client_name,
        m.salesperson,
        m.industry,
        m.deal_status,
        m.deal_value,
        COUNT(DISTINCT pp.id) as pain_points_count,
        COUNT(DISTINCT o.id) as objections_count,
        COUNT(DISTINCT cm.id) as competitor_mentions_count
      FROM meetings m
      LEFT JOIN pain_points pp ON m.id = pp.meeting_id
      LEFT JOIN objections o ON m.id = o.meeting_id
      LEFT JOIN competitive_mentions cm ON m.id = cm.meeting_id
      ${whereClause}
      GROUP BY m.id, m.meeting_date, m.client_name, m.salesperson, m.industry, m.deal_status, m.deal_value
      ORDER BY m.meeting_date DESC
    `)

    const csvHeader =
      "ID,Meeting Date,Client Name,Salesperson,Industry,Deal Status,Deal Value,Pain Points,Objections,Competitor Mentions\n"
    const csvRows = meetings
      .map(
        (m) =>
          `${m.id},${m.meeting_date},${m.client_name},${m.salesperson},${m.industry},${m.deal_status},${m.deal_value || ""},${m.pain_points_count},${m.objections_count},${m.competitor_mentions_count}`,
      )
      .join("\n")

    const csv = csvHeader + csvRows

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="sales-analytics-export-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    })
  } catch (error) {
    console.error("[v0] Export error:", error)
    return NextResponse.json({ error: "Failed to export data" }, { status: 500 })
  }
}
