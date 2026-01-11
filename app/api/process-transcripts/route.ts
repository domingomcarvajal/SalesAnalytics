import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { generateText } from "ai"

export async function POST() {
  try {
    const unprocessedMeetings = await sql`
      SELECT m.id, m.client_name, m.industry, m.deal_status, t.transcript_text
      FROM meetings m
      JOIN transcripts t ON m.id = t.meeting_id
      WHERE m.processed = false
      LIMIT 10
    `

    let processedCount = 0

    for (const meeting of unprocessedMeetings) {
      const prompt = `Analyze this sales meeting transcript and extract structured insights:

Transcript: ${meeting.transcript_text}

Please provide a JSON response with the following structure:
{
  "pain_points": [{"text": "pain point description", "category": "category name", "priority": "High/Medium/Low"}],
  "objections": [{"text": "objection description", "type": "objection type", "resolution_status": "Resolved/Unresolved"}],
  "competitive_mentions": [{"competitor": "competitor name", "context": "context", "sentiment": "Positive/Negative/Neutral"}],
  "questions_asked": [{"question": "question text", "category": "category name", "answered": true/false}]
}`

      const { text } = await generateText({
        model: "openai/gpt-4o-mini",
        prompt,
        temperature: 0.3,
      })

      try {
        const insights = JSON.parse(text)

        for (const painPoint of insights.pain_points || []) {
          await sql`
            INSERT INTO pain_points (meeting_id, pain_point, category, priority)
            VALUES (${meeting.id}, ${painPoint.text}, ${painPoint.category}, ${painPoint.priority})
          `
        }

        for (const objection of insights.objections || []) {
          await sql`
            INSERT INTO objections (meeting_id, objection, objection_type, resolution_status)
            VALUES (${meeting.id}, ${objection.text}, ${objection.type}, ${objection.resolution_status})
          `
        }

        for (const mention of insights.competitive_mentions || []) {
          await sql`
            INSERT INTO competitive_mentions (meeting_id, competitor_name, mention_context, sentiment)
            VALUES (${meeting.id}, ${mention.competitor}, ${mention.context}, ${mention.sentiment})
          `
        }

        for (const question of insights.questions_asked || []) {
          await sql`
            INSERT INTO questions_asked (meeting_id, question, category, answered)
            VALUES (${meeting.id}, ${question.question}, ${question.category}, ${question.answered})
          `
        }

        await sql`
          UPDATE meetings
          SET processed = true
          WHERE id = ${meeting.id}
        `

        processedCount++
      } catch (parseError) {
        console.error("[v0] Failed to parse LLM response for meeting", meeting.id, parseError)
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully processed ${processedCount} meetings`,
    })
  } catch (error) {
    console.error("[v0] Process transcripts error:", error)
    return NextResponse.json({ error: "Failed to process transcripts" }, { status: 500 })
  }
}
