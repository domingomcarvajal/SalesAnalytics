import { NextResponse } from "next/server"
import { getFilterOptions } from "./controller"

export async function GET() {
  try {
    const filterOptions = await getFilterOptions()
    return NextResponse.json(filterOptions)
  } catch (error) {
    console.error("Filters error:", error)
    return NextResponse.json({ error: "Failed to fetch filters" }, { status: 500 })
  }
}
