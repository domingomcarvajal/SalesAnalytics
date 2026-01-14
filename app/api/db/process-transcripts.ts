import { UnprocessedMeeting } from "@/types/meeting"
import { sql } from "./config"

export async function getUnprocessedMeetingCountRaw() {
  const result = await sql`
    SELECT COUNT(*) as count
    FROM meetings
    WHERE processed = false AND transcript IS NOT NULL
  `
  return Number.parseInt(result[0].count)
}

export async function getAllCategoriesRaw() {
  const [industries, painPoints, triggers, objectives, requirements] = await Promise.all([
    sql`SELECT id, name FROM industries ORDER BY name`,
    sql`SELECT id, name FROM pain_point_categories ORDER BY name`,
    sql`SELECT id, name FROM discovery_trigger_categories ORDER BY name`,
    sql`SELECT id, name FROM objective_categories ORDER BY name`,
    sql`SELECT id, name FROM technical_requirement_categories ORDER BY name`,
  ])

  return {
    industries,
    painPoints,
    triggers,
    objectives,
    requirements,
  }
}

export async function getUnprocessedMeetingsRaw(
  limit: number = 50
): Promise<UnprocessedMeeting[]> {
  return await sql`
    SELECT id, client_name, closed, transcript
    FROM meetings
    WHERE processed = false AND transcript IS NOT NULL
    LIMIT ${limit}
  ` as UnprocessedMeeting[]
}

export async function insertMeetingPainPointRaw(meetingId: number, painPointId: number) {
  return await sql`
    INSERT INTO meeting_pain_points (meeting_id, pain_point_id)
    VALUES (${meetingId}, ${painPointId})
    ON CONFLICT (meeting_id, pain_point_id) DO NOTHING
  `
}

export async function insertMeetingTriggerRaw(meetingId: number, triggerId: number) {
  return await sql`
    INSERT INTO meeting_discovery_triggers (meeting_id, trigger_id)
    VALUES (${meetingId}, ${triggerId})
    ON CONFLICT (meeting_id, trigger_id) DO NOTHING
  `
}

export async function insertMeetingObjectiveRaw(meetingId: number, objectiveId: number) {
  return await sql`
    INSERT INTO meeting_objectives (meeting_id, objective_id)
    VALUES (${meetingId}, ${objectiveId})
    ON CONFLICT (meeting_id, objective_id) DO NOTHING
  `
}

export async function insertMeetingRequirementRaw(meetingId: number, requirementId: number) {
  return await sql`
    INSERT INTO meeting_technical_requirements (meeting_id, requirement_id)
    VALUES (${meetingId}, ${requirementId})
    ON CONFLICT (meeting_id, requirement_id) DO NOTHING
  `
}

export async function updateMeetingAsProcessedRaw(meetingId: number, industryId: number) {
  return await sql`
    UPDATE meetings
    SET processed = true, industry_id = ${industryId}
    WHERE id = ${meetingId}
  `
}
