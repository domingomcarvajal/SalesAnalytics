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

    // Total meetings count
    const totalMeetings = await sql`
      SELECT COUNT(*) as count
      FROM meetings m
      WHERE (${salesperson} = 'all' OR m.sales_person = ${salesperson})
        AND (${closedFilter}::boolean IS NULL OR m.closed = ${closedFilter})
        AND (${industryIdFilter}::integer IS NULL OR m.industry_id = ${industryIdFilter})
    `

    // Conversion rate
    const conversionRate = await sql`
      SELECT 
        COUNT(CASE WHEN closed = true THEN 1 END) as won,
        COUNT(*) as total
      FROM meetings m
      WHERE (${salesperson} = 'all' OR m.sales_person = ${salesperson})
        AND (${closedFilter}::boolean IS NULL OR m.closed = ${closedFilter})
        AND (${industryIdFilter}::integer IS NULL OR m.industry_id = ${industryIdFilter})
    `

    // Salesperson stats: total, closed, and percentage
    const salespersonStats = await sql`
      SELECT 
        sales_person,
        COUNT(*) as total,
        COUNT(CASE WHEN closed = true THEN 1 END) as closed,
        ROUND(
          CASE 
            WHEN COUNT(*) > 0 
            THEN (COUNT(CASE WHEN closed = true THEN 1 END)::numeric / COUNT(*)::numeric) * 100
            ELSE 0 
          END, 
          1
        ) as close_rate
      FROM meetings m
      WHERE (${salesperson} = 'all' OR m.sales_person = ${salesperson})
        AND (${closedFilter}::boolean IS NULL OR m.closed = ${closedFilter})
        AND (${industryIdFilter}::integer IS NULL OR m.industry_id = ${industryIdFilter})
      GROUP BY sales_person
      ORDER BY total DESC
    `

    // Industry stats: total, closed, and percentage
    const industryStats = await sql`
      SELECT 
        COALESCE(i.name, 'sin_asignar') as industry,
        COUNT(*) as total,
        COUNT(CASE WHEN m.closed = true THEN 1 END) as closed,
        ROUND(
          CASE 
            WHEN COUNT(*) > 0 
            THEN (COUNT(CASE WHEN m.closed = true THEN 1 END)::numeric / COUNT(*)::numeric) * 100
            ELSE 0 
          END, 
          1
        ) as close_rate
      FROM meetings m
      LEFT JOIN industries i ON m.industry_id = i.id
      WHERE (${salesperson} = 'all' OR m.sales_person = ${salesperson})
        AND (${closedFilter}::boolean IS NULL OR m.closed = ${closedFilter})
        AND (${industryIdFilter}::integer IS NULL OR m.industry_id = ${industryIdFilter})
      GROUP BY i.name
      ORDER BY total DESC
    `

    // Pain points by category
    const painPointsByCategory = await sql`
      SELECT 
        ppc.name as category,
        COUNT(*) as count
      FROM meeting_pain_points mpp
      JOIN pain_point_categories ppc ON mpp.pain_point_id = ppc.id
      JOIN meetings m ON mpp.meeting_id = m.id
      WHERE (${salesperson} = 'all' OR m.sales_person = ${salesperson})
        AND (${closedFilter}::boolean IS NULL OR m.closed = ${closedFilter})
        AND (${industryIdFilter}::integer IS NULL OR m.industry_id = ${industryIdFilter})
      GROUP BY ppc.name
      ORDER BY count DESC
    `

    // Discovery triggers
    const triggerStats = await sql`
      SELECT 
        dtc.name as trigger,
        COUNT(*) as count
      FROM meeting_discovery_triggers mdt
      JOIN discovery_trigger_categories dtc ON mdt.trigger_id = dtc.id
      JOIN meetings m ON mdt.meeting_id = m.id
      WHERE (${salesperson} = 'all' OR m.sales_person = ${salesperson})
        AND (${closedFilter}::boolean IS NULL OR m.closed = ${closedFilter})
        AND (${industryIdFilter}::integer IS NULL OR m.industry_id = ${industryIdFilter})
      GROUP BY dtc.name
      ORDER BY count DESC
    `

    // Objectives
    const objectiveStats = await sql`
      SELECT 
        oc.name as objective,
        COUNT(*) as count
      FROM meeting_objectives mo
      JOIN objective_categories oc ON mo.objective_id = oc.id
      JOIN meetings m ON mo.meeting_id = m.id
      WHERE (${salesperson} = 'all' OR m.sales_person = ${salesperson})
        AND (${closedFilter}::boolean IS NULL OR m.closed = ${closedFilter})
        AND (${industryIdFilter}::integer IS NULL OR m.industry_id = ${industryIdFilter})
      GROUP BY oc.name
      ORDER BY count DESC
    `

    // Technical requirements
    const requirementStats = await sql`
      SELECT 
        trc.name as requirement,
        COUNT(*) as count
      FROM meeting_technical_requirements mtr
      JOIN technical_requirement_categories trc ON mtr.requirement_id = trc.id
      JOIN meetings m ON mtr.meeting_id = m.id
      WHERE (${salesperson} = 'all' OR m.sales_person = ${salesperson})
        AND (${closedFilter}::boolean IS NULL OR m.closed = ${closedFilter})
        AND (${industryIdFilter}::integer IS NULL OR m.industry_id = ${industryIdFilter})
      GROUP BY trc.name
      ORDER BY count DESC
    `

    return NextResponse.json({
      totalMeetings: Number.parseInt(totalMeetings[0].count),
      conversionRate:
        conversionRate[0].total > 0 ? ((conversionRate[0].won / conversionRate[0].total) * 100).toFixed(2) : 0,
      totalClosed: Number(conversionRate[0].won),
      salespersonStats,
      industryStats,
      painPointsByCategory,
      triggerStats,
      objectiveStats,
      requirementStats,
    })
  } catch (error) {
    console.error("[v0] Analytics error:", error)
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 })
  }
}
