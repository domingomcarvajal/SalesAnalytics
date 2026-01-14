import { type NextRequest, NextResponse } from "next/server"
import { parseCSVLine, processMeetingsUpload } from "./controller"
import { InsertMeetingData } from "@/types/meeting"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
    }

    const text = await file.text()
    const lines = text.split("\n")

    console.log("[Upload] Total lines in file:", lines.length)
    console.log("[Upload] First line (headers):", lines[0])

    // Auto-detect delimiter (semicolon or comma)
    const firstLine = lines[0]
    const delimiter = firstLine.includes(";") ? ";" : ","
    console.log("[Upload] Detected delimiter:", delimiter === ";" ? "semicolon" : "comma")

    const headers = firstLine.split(delimiter).map((h) => h.trim())
    console.log("[Upload] Parsed headers:", headers)
    console.log("[Upload] Number of headers:", headers.length)

    const meetingsToProcess: InsertMeetingData[] = []

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) {
        console.log(`[Upload] Line ${i}: Empty line, skipping`)
        continue
      }

      const values = line.split(delimiter).map((v) => v.trim())
      console.log(`[Upload] Line ${i}: Found ${values.length} values, expected ${headers.length}`)
      console.log(`[Upload] Line ${i} values:`, values)

      if (values.length !== headers.length) {
        console.log(`[Upload] Line ${i}: Skipping - column count mismatch (${values.length} vs ${headers.length})`)
        continue
      }

      const [client_name, client_email, client_phone_number, meeting_date, sales_person, closed, transcript] = values

      console.log(`[Upload] Line ${i} parsed:`, {
        client_name,
        client_email,
        client_phone_number,
        meeting_date,
        sales_person,
        closed,
        transcript: transcript ? transcript.substring(0, 50) + "..." : null
      })

      if (!client_name || !meeting_date || !sales_person || !transcript || !closed || !client_email || !client_phone_number) {
        console.log(`[Upload] Line ${i}: Skipping - missing required fields`)
        continue
      }

      const meetingData = parseCSVLine(values)
      meetingsToProcess.push(meetingData)
    }

    const result = await processMeetingsUpload(meetingsToProcess)

    console.log(`[Upload] Final: uploaded=${result.uploadedCount}, skipped=${result.skippedCount}`)

    return NextResponse.json({
      success: true,
      message: `Successfully uploaded ${result.uploadedCount} meetings (${result.skippedCount} skipped)`,
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Failed to upload CSV" }, { status: 500 })
  }
}
