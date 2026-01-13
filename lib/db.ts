import { neon } from "@neondatabase/serverless"

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set")
}

export const sql = neon(process.env.DATABASE_URL)

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

export type PainPoint = {
  id: number
  meeting_id: number
  pain_point: string
  category: string | null
  priority: "High" | "Medium" | "Low" | null
  created_at: string
}

export type Objection = {
  id: number
  meeting_id: number
  objection: string
  objection_type: string | null
  resolution_status: string | null
  created_at: string
}

export type CompetitiveMention = {
  id: number
  meeting_id: number
  competitor_name: string
  mention_context: string | null
  sentiment: "Positive" | "Negative" | "Neutral" | null
  created_at: string
}

export type QuestionAsked = {
  id: number
  meeting_id: number
  question: string
  category: string | null
  answered: boolean
  created_at: string
}
