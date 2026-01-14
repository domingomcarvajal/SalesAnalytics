import { llmService, type ProcessingContext, type CategoryOption } from "@/lib/services/llm-service"
import { CategoryMatcher } from "@/lib/services/category-matcher"
import {
  getUnprocessedMeetingCountRaw,
  getAllCategoriesRaw,
  getUnprocessedMeetingsRaw,
  insertMeetingPainPointRaw,
  insertMeetingTriggerRaw,
  insertMeetingObjectiveRaw,
  insertMeetingRequirementRaw,
  updateMeetingAsProcessedRaw,
} from "../db/process-transcripts"
import { Meeting, UnprocessedMeeting } from "@/types/meeting"

export interface ProcessStatus {
  unprocessedCount: number
  availableCategories: {
    industries: Array<{ id: number; name: string }>
    painPoints: Array<{ id: number; name: string }>
    triggers: Array<{ id: number; name: string }>
    objectives: Array<{ id: number; name: string }>
    requirements: Array<{ id: number; name: string }>
  }
}

export interface ProcessResult {
  processedCount: number
  failedCount: number
}

export async function getProcessStatus(): Promise<ProcessStatus> {
  const [unprocessedCount, categories] = await Promise.all([
    getUnprocessedMeetingCountRaw(),
    getAllCategoriesRaw(),
  ])


  console.log('debug categories', categories)
  return {
    unprocessedCount,
    availableCategories: {
      industries: categories.industries.map((i) => ({ id: i.id, name: i.name })),
      painPoints: categories.painPoints.map((p) => ({ id: p.id, name: p.name })),
      triggers: categories.triggers.map((t) => ({ id: t.id, name: t.name })),
      objectives: categories.objectives.map((o) => ({ id: o.id, name: o.name })),
      requirements: categories.requirements.map((r) => ({ id: r.id, name: r.name })),
    },
  }
}

export async function processMeetingsBatch(limit: number = 50): Promise<ProcessResult> {
  const meetings = await getUnprocessedMeetingsRaw(limit)
  console.log(`[Process] Found ${meetings.length} unprocessed meetings`)

  const categories = await getAllCategoriesRaw()
  const context: ProcessingContext = {
    industries: categories.industries as CategoryOption[],
    painPoints: categories.painPoints as CategoryOption[],
    triggers: categories.triggers as CategoryOption[],
    objectives: categories.objectives as CategoryOption[],
    requirements: categories.requirements as CategoryOption[],
  }

  let processedCount = 0
  let failedCount = 0

  for (const meeting of meetings) {
    try {
      await processMeeting(meeting, context)
      processedCount++
    } catch (error) {
      console.error(`[Process] Meeting ${meeting.id} - Error:`, error)
      failedCount++
    }
  }

  return {
    processedCount,
    failedCount,
  }
}

async function processMeeting(meeting: UnprocessedMeeting, context: ProcessingContext): Promise<void> {
  console.log(`[Process] Processing meeting ${meeting.id}: ${meeting.client_name}`)

    const insights = await llmService.extractInsights(meeting.transcript || '', context)

    const matchedIndustry = CategoryMatcher.findIndustryMatch(insights.industria, context.industries)
    const matchedPainPoints = CategoryMatcher.findMultipleMatches(insights.dolores_principales, context.painPoints)
    const matchedTrigger = CategoryMatcher.findMatch(insights.trigger_descubrimiento, context.triggers)
    const matchedObjectives = CategoryMatcher.findMultipleMatches(insights.objetivos_principales, context.objectives)
    const matchedRequirements = CategoryMatcher.findMultipleMatches(insights.requerimientos_tecnicos, context.requirements)

    await saveMeetingInsights(
      meeting.id,
      matchedIndustry.id,
      matchedPainPoints.map(p => p.id),
      matchedTrigger?.id || null,
      matchedObjectives.map(o => o.id),
      matchedRequirements.map(r => r.id)
    )

    console.log(`[Process] Meeting ${meeting.id} - Successfully processed`)
}

export async function saveMeetingInsights(
  meetingId: number,
  industryId: number,
  painPointIds: number[],
  triggerId: number | null,
  objectiveIds: number[],
  requirementIds: number[]
): Promise<void> {
  const insertPromises: Promise<any>[] = []

  for (const painPointId of painPointIds) {
    insertPromises.push(insertMeetingPainPointRaw(meetingId, painPointId))
  }

  if (triggerId) {
    insertPromises.push(insertMeetingTriggerRaw(meetingId, triggerId))
  }

  for (const objectiveId of objectiveIds) {
    insertPromises.push(insertMeetingObjectiveRaw(meetingId, objectiveId))
  }

  for (const requirementId of requirementIds) {
    insertPromises.push(insertMeetingRequirementRaw(meetingId, requirementId))
  }

  await Promise.all(insertPromises)

  await updateMeetingAsProcessedRaw(meetingId, industryId)
}
