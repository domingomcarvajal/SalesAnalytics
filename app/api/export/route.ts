import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const salesperson = searchParams.get("salesperson") || "all"
    const closed = searchParams.get("closed") || "all"
    const industryId = searchParams.get("industryId") || "all"

    // Convert closed filter to boolean or null
    const closedFilter = closed === "all" ? null : closed === "Won"
    // Convert industryId to number or null
    const industryIdFilter = industryId === "all" ? null : parseInt(industryId, 10)

    const meetings = await sql`
      SELECT 
        m.id,
        m.meeting_date,
        m.client_name,
        m.client_email,
        m.client_phone_number,
        m.sales_person,
        m.closed,
        i.name as industry,
        COUNT(DISTINCT mpp.id) as pain_points_count,
        COUNT(DISTINCT mdt.id) as triggers_count,
        COUNT(DISTINCT mo.id) as objectives_count,
        COUNT(DISTINCT mtr.id) as requirements_count
      FROM meetings m
      LEFT JOIN industries i ON m.industry_id = i.id
      LEFT JOIN meeting_pain_points mpp ON m.id = mpp.meeting_id
      LEFT JOIN meeting_discovery_triggers mdt ON m.id = mdt.meeting_id
      LEFT JOIN meeting_objectives mo ON m.id = mo.meeting_id
      LEFT JOIN meeting_technical_requirements mtr ON m.id = mtr.meeting_id
      WHERE (${salesperson} = 'all' OR m.sales_person = ${salesperson})
        AND (${closedFilter}::boolean IS NULL OR m.closed = ${closedFilter})
        AND (${industryIdFilter}::integer IS NULL OR m.industry_id = ${industryIdFilter})
      GROUP BY m.id, m.meeting_date, m.client_name, m.client_email, m.client_phone_number, m.sales_person, m.closed, i.name
      ORDER BY m.meeting_date DESC
    `

    const csvHeader =
      "ID,Meeting Date,Client Name,Client Email,Client Phone,Salesperson,Status,Industry,Pain Points,Triggers,Objectives,Requirements\n"
    const csvRows = meetings
      .map(
        (m) =>
          `${m.id},${m.meeting_date},${m.client_name},${m.client_email || ""},${m.client_phone_number || ""},${m.sales_person},${m.closed ? "Won" : "Open"},${m.industry || ""},${m.pain_points_count},${m.triggers_count},${m.objectives_count},${m.requirements_count}`,
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
