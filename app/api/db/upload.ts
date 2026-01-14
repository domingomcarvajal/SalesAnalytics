import { InsertMeetingData } from "@/types/meeting"
import { sql } from "./config"


export async function insertMeetingRaw(meetingData: InsertMeetingData) {
  const {
    client_name,
    client_email,
    client_phone_number,
    meeting_date,
    sales_person,
    closed,
    transcript,
  } = meetingData

  const result = await sql`
    INSERT INTO meetings (
      client_name,
      client_email,
      client_phone_number,
      meeting_date,
      sales_person,
      closed,
      transcript,
      processed
    )
    VALUES (
      ${client_name},
      ${client_email},
      ${client_phone_number},
      ${meeting_date},
      ${sales_person},
      ${closed},
      ${transcript},
      false
    )
    RETURNING id
  `

  return result[0]
}
