import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

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

    let uploadedCount = 0
    let skippedCount = 0

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
        skippedCount++
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

      if (!client_name || !meeting_date || !sales_person) {
        console.log(`[Upload] Line ${i}: Skipping - missing required fields (client_name: ${!!client_name}, meeting_date: ${!!meeting_date}, sales_person: ${!!sales_person})`)
        skippedCount++
        continue
      }

      const closedBoolean = closed === "1" || closed === "true"

      try {
        const result = await sql`
          INSERT INTO meetings (client_name, client_email, client_phone_number, meeting_date, sales_person, closed, transcript, processed)
          VALUES (${client_name}, ${client_email || null}, ${client_phone_number || null}, ${meeting_date}, ${sales_person}, ${closedBoolean}, ${transcript || null}, false)
          RETURNING id
        `
        console.log(`[Upload] Line ${i}: Successfully inserted with id:`, result[0]?.id)
        uploadedCount++
      } catch (insertError) {
        console.error(`[Upload] Line ${i}: Insert error:`, insertError)
        skippedCount++
      }
    }

    console.log(`[Upload] Final: uploaded=${uploadedCount}, skipped=${skippedCount}`)

    return NextResponse.json({
      success: true,
      message: `Successfully uploaded ${uploadedCount} meetings (${skippedCount} skipped)`,
    })
  } catch (error) {
    console.error("[v0] Upload error:", error)
    return NextResponse.json({ error: "Failed to upload CSV" }, { status: 500 })
  }
}
