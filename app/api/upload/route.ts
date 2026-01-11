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

    const headers = lines[0].split(",").map((h) => h.trim())

    let uploadedCount = 0

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue

      const values = line.split(",").map((v) => v.trim())

      if (values.length !== headers.length) continue

      const [client_name, client_email, client_phone_number, meeting_date, sales_person, closed, transcript] = values

      if (!client_name || !meeting_date || !sales_person) {
        continue
      }

      const closedBoolean = closed === "1" || closed === "true"

      const result = await sql`
        INSERT INTO meetings (client_name, client_email, client_phone_number, meeting_date, sales_person, closed, transcript, processed)
        VALUES (${client_name}, ${client_email || null}, ${client_phone_number || null}, ${meeting_date}, ${sales_person}, ${closedBoolean}, ${transcript || null}, false)
        RETURNING id
      `

      uploadedCount++
    }

    return NextResponse.json({
      success: true,
      message: `Successfully uploaded ${uploadedCount} meetings`,
    })
  } catch (error) {
    console.error("[v0] Upload error:", error)
    return NextResponse.json({ error: "Failed to upload CSV" }, { status: 500 })
  }
}
