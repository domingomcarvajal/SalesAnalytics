export type Meeting = {
  id: number
  client_name: string
  client_email: string | null
  client_phone_number: string | null
  meeting_date: string
  sales_person: string
  closed: boolean
  transcript: string | null
  uploaded_at: string
  processed: boolean
}

export type InsertMeetingData = Omit<Meeting, "id" | "uploaded_at" | "processed">

export type UnprocessedMeeting = Pick<Meeting, "id" | "client_name" | "closed" | "transcript">
