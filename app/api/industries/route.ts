import { NextResponse } from "next/server"
import { getIndustries } from "./controller"

export async function GET() {
  try {
    const result = await getIndustries()
    return NextResponse.json(result)
  } catch (error) {
    console.error("Industries error:", error)
    return NextResponse.json({ error: "Failed to fetch industries" }, { status: 500 })
  }
}
