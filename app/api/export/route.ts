import { type NextRequest, NextResponse } from "next/server"
import { getMeetingsForExport } from "./controller"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const salesperson = searchParams.get("salesperson") || "all"
    const closed = searchParams.get("closed") || "all"
    const industryId = searchParams.get("industryId") || "all"

    const csv = await getMeetingsForExport({ salesperson, closed, industryId })

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="sales-analytics-export-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    })
  } catch (error) {
    console.error("Export error:", error)
    return NextResponse.json({ error: "Failed to export data" }, { status: 500 })
  }
}
