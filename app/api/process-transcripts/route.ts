import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { generateText } from "ai"
import { createOpenAI } from "@ai-sdk/openai"
import { createGroq } from "@ai-sdk/groq"

// Create OpenAI provider with API key from environment
const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
})


// Helper function to extract JSON from LLM response
function extractJSON(text: string): object | null {
  // Try parsing directly first
  try {
    return JSON.parse(text)
  } catch {
    // Continue to other methods
  }

  // Try to extract JSON from markdown code blocks
  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (codeBlockMatch) {
    try {
      return JSON.parse(codeBlockMatch[1].trim())
    } catch {
      // Continue to other methods
    }
  }

  // Try to find JSON object in the text (starts with { and ends with })
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[0])
    } catch {
      // Continue to other methods
    }
  }

  return null
}

// Helper to find matching category or default to null
function matchCategory(
  extracted: string | undefined,
  validCategories: Array<{ id: number; name: string }>
): { id: number; name: string } | null {
  if (!extracted) return null

  // Try exact match (case-insensitive)
  const exactMatch = validCategories.find(
    (c) => c.name.toLowerCase() === extracted.toLowerCase()
  )
  if (exactMatch) return exactMatch

  // Try partial match
  const partialMatch = validCategories.find(
    (c) =>
      c.name.toLowerCase().includes(extracted.toLowerCase()) ||
      extracted.toLowerCase().includes(c.name.toLowerCase())
  )
  if (partialMatch) return partialMatch

  return null
}

// Helper to find matching industry or default to "otros"
function matchIndustry(
  extractedIndustry: string | undefined,
  validIndustries: Array<{ id: number; name: string }>
): { id: number; name: string } {
  if (!extractedIndustry) {
    return validIndustries.find((i) => i.name === "otros") || validIndustries[0]
  }

  const exactMatch = validIndustries.find(
    (i) => i.name.toLowerCase() === extractedIndustry.toLowerCase()
  )
  if (exactMatch) return exactMatch

  const partialMatch = validIndustries.find(
    (i) =>
      i.name.toLowerCase().includes(extractedIndustry.toLowerCase()) ||
      extractedIndustry.toLowerCase().includes(i.name.toLowerCase())
  )
  if (partialMatch) return partialMatch

  return validIndustries.find((i) => i.name === "otros") || validIndustries[0]
}

export async function GET() {
  try {
    const unprocessedCount = await sql`
      SELECT COUNT(*) as count
      FROM meetings
      WHERE processed = false AND transcript IS NOT NULL
    `

    const industries = await sql`SELECT id, name FROM industries ORDER BY name`
    const painPoints = await sql`SELECT id, name FROM pain_point_categories ORDER BY name`
    const triggers = await sql`SELECT id, name FROM discovery_trigger_categories ORDER BY name`
    const objectives = await sql`SELECT id, name FROM objective_categories ORDER BY name`
    const requirements = await sql`SELECT id, name FROM technical_requirement_categories ORDER BY name`

    return NextResponse.json({
      unprocessedCount: Number(unprocessedCount[0].count),
      industries: industries.map((i) => ({ id: i.id, name: i.name })),
      painPoints: painPoints.map((p) => ({ id: p.id, name: p.name })),
      triggers: triggers.map((t) => ({ id: t.id, name: t.name })),
      objectives: objectives.map((o) => ({ id: o.id, name: o.name })),
      requirements: requirements.map((r) => ({ id: r.id, name: r.name })),
    })
  } catch (error) {
    console.error("[v0] Process stats error:", error)
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}

export async function POST() {
  try {
    if (!process.env.OPENAI_API_KEY || !process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: "No api keys configured" },
        { status: 500 }
      )
    }

    // Fetch all category options from database
    const industriesResult = await sql`SELECT id, name FROM industries ORDER BY name`
    const painPointsResult = await sql`SELECT id, name FROM pain_point_categories ORDER BY name`
    const triggersResult = await sql`SELECT id, name FROM discovery_trigger_categories ORDER BY name`
    const objectivesResult = await sql`SELECT id, name FROM objective_categories ORDER BY name`
    const requirementsResult = await sql`SELECT id, name FROM technical_requirement_categories ORDER BY name`

    const validIndustries = industriesResult.map((i) => ({ id: i.id as number, name: i.name as string }))
    const validPainPoints = painPointsResult.map((p) => ({ id: p.id as number, name: p.name as string }))
    const validTriggers = triggersResult.map((t) => ({ id: t.id as number, name: t.name as string }))
    const validObjectives = objectivesResult.map((o) => ({ id: o.id as number, name: o.name as string }))
    const validRequirements = requirementsResult.map((r) => ({ id: r.id as number, name: r.name as string }))

    const industryNames = validIndustries.map((i) => i.name)
    const painPointNames = validPainPoints.map((p) => p.name)
    const triggerNames = validTriggers.map((t) => t.name)
    const objectiveNames = validObjectives.map((o) => o.name)
    const requirementNames = validRequirements.map((r) => r.name)

    console.log(`[Process] Categories loaded:`)
    console.log(`  - Industries: ${industryNames.length}`)
    console.log(`  - Pain Points: ${painPointNames.length}`)
    console.log(`  - Triggers: ${triggerNames.length}`)
    console.log(`  - Objectives: ${objectiveNames.length}`)
    console.log(`  - Requirements: ${requirementNames.length}`)

    const unprocessedMeetings = await sql`
      SELECT id, client_name, closed, transcript
      FROM meetings
      WHERE processed = false AND transcript IS NOT NULL
      LIMIT 50
    `

    console.log(`[Process] Found ${unprocessedMeetings.length} unprocessed meetings`)

    let processedCount = 0
    let failedCount = 0

    for (const meeting of unprocessedMeetings) {
      console.log(`[Process] Processing meeting ${meeting.id}: ${meeting.client_name}`)

      const prompt = `Analiza esta transcripción de reunión de ventas y extrae información estructurada.

Transcripción: ${meeting.transcript}

Debes identificar las siguientes categorías. Para cada una, SOLO puedes elegir valores de las listas proporcionadas.

CATEGORÍAS DISPONIBLES:

1. INDUSTRIA (elige UNA):
${industryNames.join(", ")}

2. DOLORES PRINCIPALES (elige TODOS los que apliquen):
${painPointNames.join(", ")}

3. TRIGGER DE DESCUBRIMIENTO (elige UNO - cómo nos encontraron):
${triggerNames.join(", ")}

4. OBJETIVOS PRINCIPALES (elige TODOS los que apliquen):
${objectiveNames.join(", ")}

5. REQUERIMIENTOS TÉCNICOS (elige TODOS los que apliquen):
${requirementNames.join(", ")}

Responde ÚNICAMENTE con un objeto JSON con esta estructura:
{
  "industria": "valor_exacto_de_la_lista",
  "dolores": ["valor1", "valor2"],
  "trigger": "valor_exacto_de_la_lista",
  "objetivos": ["valor1", "valor2"],
  "requerimientos": ["valor1", "valor2"]
}

REGLAS IMPORTANTES:
- Usa SOLO los valores exactos de las listas proporcionadas
- Si no puedes identificar una categoría, usa un array vacío [] para listas o null para valores únicos
- Para industria, si no estás seguro usa "otros"
- NO inventes categorías nuevas
- Responde SOLO con el JSON, sin texto adicional`

      try {
        const { text } = await generateText({
          model: groq("llama-3.3-70b-versatile"),
          prompt,
          temperature: 0.2,
        })

        console.log(`[Process] Meeting ${meeting.id} - LLM response received (${text.length} chars)`)

        const insights = extractJSON(text)

        if (!insights) {
          console.error(`[Process] Meeting ${meeting.id} - Failed to parse JSON`)
          console.error(`[Process] Raw response:`)
          console.error("---START---")
          console.error(text)
          console.error("---END---")
          failedCount++
          continue
        }

        const parsed = insights as {
          industria?: string
          dolores?: string[]
          trigger?: string
          objetivos?: string[]
          requerimientos?: string[]
        }

        console.log(`[Process] Meeting ${meeting.id} - Parsed:`, JSON.stringify(parsed, null, 2))

        // Match industry
        const matchedIndustry = matchIndustry(parsed.industria, validIndustries)
        console.log(`[Process] Industry: "${parsed.industria}" -> "${matchedIndustry.name}"`)

        // Insert pain points
        for (const painPoint of parsed.dolores || []) {
          const matched = matchCategory(painPoint, validPainPoints)
          if (matched) {
            await sql`
              INSERT INTO meeting_pain_points (meeting_id, pain_point_id)
              VALUES (${meeting.id}, ${matched.id})
              ON CONFLICT (meeting_id, pain_point_id) DO NOTHING
            `
            console.log(`[Process] Pain Point: "${painPoint}" -> "${matched.name}"`)
          } else {
            console.log(`[Process] Pain Point not matched: "${painPoint}"`)
          }
        }

        // Insert trigger
        if (parsed.trigger) {
          const matched = matchCategory(parsed.trigger, validTriggers)
          if (matched) {
            await sql`
              INSERT INTO meeting_discovery_triggers (meeting_id, trigger_id)
              VALUES (${meeting.id}, ${matched.id})
              ON CONFLICT (meeting_id, trigger_id) DO NOTHING
            `
            console.log(`[Process] Trigger: "${parsed.trigger}" -> "${matched.name}"`)
          } else {
            console.log(`[Process] Trigger not matched: "${parsed.trigger}"`)
          }
        }

        // Insert objectives
        for (const objective of parsed.objetivos || []) {
          const matched = matchCategory(objective, validObjectives)
          if (matched) {
            await sql`
              INSERT INTO meeting_objectives (meeting_id, objective_id)
              VALUES (${meeting.id}, ${matched.id})
              ON CONFLICT (meeting_id, objective_id) DO NOTHING
            `
            console.log(`[Process] Objective: "${objective}" -> "${matched.name}"`)
          } else {
            console.log(`[Process] Objective not matched: "${objective}"`)
          }
        }

        // Insert requirements
        for (const req of parsed.requerimientos || []) {
          const matched = matchCategory(req, validRequirements)
          if (matched) {
            await sql`
              INSERT INTO meeting_technical_requirements (meeting_id, requirement_id)
              VALUES (${meeting.id}, ${matched.id})
              ON CONFLICT (meeting_id, requirement_id) DO NOTHING
            `
            console.log(`[Process] Requirement: "${req}" -> "${matched.name}"`)
          } else {
            console.log(`[Process] Requirement not matched: "${req}"`)
          }
        }

        // Update meeting with industry and mark as processed
        await sql`
          UPDATE meetings
          SET processed = true, industry_id = ${matchedIndustry.id}
          WHERE id = ${meeting.id}
        `

        console.log(`[Process] Meeting ${meeting.id} - Successfully processed`)
        processedCount++
      } catch (error) {
        console.error(`[Process] Meeting ${meeting.id} - Error:`, error)
        failedCount++
      }
    }

    return NextResponse.json({
      success: true,
      message: `Procesados ${processedCount} meetings (${failedCount} fallidos)`,
    })
  } catch (error) {
    console.error("[v0] Process transcripts error:", error)
    return NextResponse.json({ error: "Failed to process transcripts" }, { status: 500 })
  }
}
