import { NextResponse } from "next/server"
import { getProcessStatus, processMeetingsBatch } from "./controller"

export async function GET() {
  try {
    const status = await getProcessStatus()
    return NextResponse.json(status)
  } catch (error) {
    console.error("Process stats error:", error)
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}

export async function POST() {
  try {
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: "GROQ_API_KEY not configured" },
        { status: 500 }
      )
    }

    const result = await processMeetingsBatch()

    return NextResponse.json({
      success: true,
      message: `Processed ${result.processedCount} meetings, ${result.failedCount} failed`,
      processed: result.processedCount,
      failed: result.failedCount,
    })
  } catch (error) {
    console.error("Process transcripts error:", error)
    return NextResponse.json({ error: "Failed to process transcripts" }, { status: 500 })
  }
}