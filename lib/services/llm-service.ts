import { generateText } from "ai"
import { createGroq } from "@ai-sdk/groq"

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
})

export interface CategoryOption {
  id: number
  name: string
}

export interface TranscriptInsights {
  industria: string
  dolores_principales: string[]
  trigger_descubrimiento: string
  objetivos_principales: string[]
  requerimientos_tecnicos: string[]
}

export interface ProcessingContext {
  industries: CategoryOption[]
  painPoints: CategoryOption[]
  triggers: CategoryOption[]
  objectives: CategoryOption[]
  requirements: CategoryOption[]
}

export class LLMService {
  /**
   * Extract insights from a meeting transcript using LLM
   */
  async extractInsights(transcript: string, context: ProcessingContext): Promise<TranscriptInsights> {
    const prompt = this.buildPrompt(transcript, context)

    const result = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      prompt,
      temperature: 0.1,
    })

    const rawResponse = result.text
    console.log(`[LLM] Raw response:`, rawResponse)

    const parsed = this.parseJSONResponse(rawResponse)
    if (!parsed) {
      throw new Error("Failed to parse LLM response as JSON")
    }

    return this.validateAndNormalizeInsights(parsed, context)
  }

  /**
   * Build the LLM prompt with context
   */
  private buildPrompt(transcript: string, context: ProcessingContext): string {
    const availableIndustries = context.industries.map(i => i.name).join(', ')
    const availablePainPoints = context.painPoints.map(c => c.name).join(', ')
    const availableTriggers = context.triggers.map(c => c.name).join(', ')
    const availableObjectives = context.objectives.map(c => c.name).join(', ')
    const availableRequirements = context.requirements.map(c => c.name).join(', ')

    return `Analiza esta transcripción de reunión de ventas y extrae información estructurada.

Transcripción: ${transcript}

Debes identificar las siguientes categorías. Para cada una, SOLO puedes elegir valores de las listas proporcionadas.

CATEGORÍAS DISPONIBLES:

1. INDUSTRIA (elige UNA):
${availableIndustries}

2. DOLORES PRINCIPALES (elige CERO o MÁS):
${availablePainPoints}

3. TRIGGER DE DESCUBRIMIENTO (elige UNO):
${availableTriggers}

4. OBJETIVOS PRINCIPALES (elige CERO o MÁS):
${availableObjectives}

5. REQUERIMIENTOS TÉCNICOS (elige CERO o MÁS):
${availableRequirements}

IMPORTANTE:
- Para INDUSTRIA: Elige UNA de las opciones disponibles. Si no encaja exactamente, usa "otros".
- Para arrays (dolores, objetivos, requerimientos): Elige CERO o MÁS de las opciones disponibles.
- Si no encuentras una buena coincidencia, deja el array vacío o usa "otros" para industria.

Responde ÚNICAMENTE con un objeto JSON válido:
{
  "industria": "nombre_de_industria",
  "dolores_principales": ["dolor1", "dolor2"],
  "trigger_descubrimiento": "trigger",
  "objetivos_principales": ["objetivo1", "objetivo2"],
  "requerimientos_tecnicos": ["req1", "req2"]
}`
  }

  /**
   * Parse JSON from LLM response
   */
  private parseJSONResponse(text: string): object | null {
    try {
      return JSON.parse(text)
    } catch {}

    const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/)
    if (codeBlockMatch) {
      try {
        return JSON.parse(codeBlockMatch[1].trim())
      } catch {}
    }

    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0])
      } catch {}
    }

    return null
  }

  /**
   * Validate and normalize the extracted insights
   */
  private validateAndNormalizeInsights(raw: any, context: ProcessingContext): TranscriptInsights {
    if (!raw || typeof raw !== 'object') {
      throw new Error('Invalid insights format')
    }

    return {
      industria: raw.industria || 'otros',
      dolores_principales: Array.isArray(raw.dolores_principales) ? raw.dolores_principales : [],
      trigger_descubrimiento: raw.trigger_descubrimiento || '',
      objetivos_principales: Array.isArray(raw.objetivos_principales) ? raw.objetivos_principales : [],
      requerimientos_tecnicos: Array.isArray(raw.requerimientos_tecnicos) ? raw.requerimientos_tecnicos : [],
    }
  }
}

// Singleton instance
export const llmService = new LLMService()
