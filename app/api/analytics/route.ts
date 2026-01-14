import { type NextRequest, NextResponse } from "next/server"
import { getAnalyticsData } from "./controller"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const salesperson = searchParams.get("salesperson") || "all"
    const closed = searchParams.get("closed") || "all"
    const industryId = searchParams.get("industryId") || "all"
    const processed = searchParams.get("processed") || "all"
    const filters = { salesperson, closed, industryId, processed }
    const analyticsData = await getAnalyticsData(filters)

    return NextResponse.json(analyticsData)
  } catch (error) {
    console.error("Analytics error:", error)
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 })
  }
}
