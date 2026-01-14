import { InsertMeetingData } from "@/types/meeting"
import { insertMeetingRaw } from "../db/upload"

export interface UploadResult {
  uploadedCount: number
  skippedCount: number
}

export function parseCSVLine(values: string[]): InsertMeetingData {
  const [client_name, client_email, client_phone_number, meeting_date, sales_person, closed, transcript] = values
  const closedBoolean = closed === "1" || closed === "true"

  return {
    client_name,
    client_email: client_email || null,
    client_phone_number: client_phone_number || null,
    meeting_date,
    sales_person,
    closed: closedBoolean,
    transcript: transcript || null,
  }
}

export async function processMeetingsUpload(meetingsData: InsertMeetingData[]): Promise<UploadResult> {
  let uploadedCount = 0
  let skippedCount = 0

  for (const meetingData of meetingsData) {
    try {
      await insertMeetingRaw(meetingData)
      uploadedCount++
    } catch (insertError) {
      console.error(`[Upload] Insert error:`, insertError)
      skippedCount++
    }
  }

  return { uploadedCount, skippedCount }
}
