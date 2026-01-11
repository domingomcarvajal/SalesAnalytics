import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const industry = searchParams.get("industry")
    const salesperson = searchParams.get("salesperson")
    const dealStatus = searchParams.get("dealStatus")

    const whereConditions = []
    const params: any = {}

    if (industry && industry !== "all") {
      whereConditions.push("m.industry = " + sql`${industry}`)
    }
    if (salesperson && salesperson !== "all") {
      whereConditions.push("m.salesperson = " + sql`${salesperson}`)
    }
    if (dealStatus && dealStatus !== "all") {
      whereConditions.push("m.deal_status = " + sql`${dealStatus}`)
    }

    const whereClause = whereConditions.length > 0 ? "WHERE " + whereConditions.join(" AND ") : ""

    const totalMeetings = await sql`
      SELECT COUNT(*) as count
      FROM meetings m
      ${whereClause ? sql.unsafe(whereClause) : sql``}
    `

    const conversionRate = await sql`
      SELECT 
        COUNT(CASE WHEN deal_status = 'Won' THEN 1 END) as won,
        COUNT(*) as total
      FROM meetings m
      ${whereClause ? sql.unsafe(whereClause) : sql``}
    `

    const avgDealValue = await sql`
      SELECT AVG(deal_value) as avg_value
      FROM meetings m
      WHERE deal_value IS NOT NULL
      ${whereClause ? sql.unsafe("AND " + whereClause.replace("WHERE ", "")) : sql``}
    `

    const topPainPoints = await sql`
      SELECT pp.pain_point, pp.category, pp.priority, COUNT(*) as frequency
      FROM pain_points pp
      JOIN meetings m ON pp.meeting_id = m.id
      ${whereClause ? sql.unsafe(whereClause) : sql``}
      GROUP BY pp.pain_point, pp.category, pp.priority
      ORDER BY frequency DESC
      LIMIT 10
    `

    const topObjections = await sql`
      SELECT o.objection, o.objection_type, COUNT(*) as frequency
      FROM objections o
      JOIN meetings m ON o.meeting_id = m.id
      ${whereClause ? sql.unsafe(whereClause) : sql``}
      GROUP BY o.objection, o.objection_type
      ORDER BY frequency DESC
      LIMIT 10
    `

    const competitorData = await sql`
      SELECT cm.competitor_name, COUNT(*) as mentions, cm.sentiment
      FROM competitive_mentions cm
      JOIN meetings m ON cm.meeting_id = m.id
      ${whereClause ? sql.unsafe(whereClause) : sql``}
      GROUP BY cm.competitor_name, cm.sentiment
      ORDER BY mentions DESC
      LIMIT 10
    `

    const industryBreakdown = await sql`
      SELECT industry, COUNT(*) as count
      FROM meetings m
      ${whereClause ? sql.unsafe(whereClause) : sql``}
      GROUP BY industry
      ORDER BY count DESC
    `

    return NextResponse.json({
      totalMeetings: Number.parseInt(totalMeetings[0].count),
      conversionRate:
        conversionRate[0].total > 0 ? ((conversionRate[0].won / conversionRate[0].total) * 100).toFixed(2) : 0,
      avgDealValue: avgDealValue[0].avg_value || 0,
      topPainPoints,
      topObjections,
      competitorData,
      industryBreakdown,
    })
  } catch (error) {
    console.error("[v0] Analytics error:", error)
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 })
  }
}
