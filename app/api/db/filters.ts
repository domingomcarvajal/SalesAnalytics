import { sql } from "./config"

export async function getSalespeopleRaw() {
  return await sql`
    SELECT DISTINCT sales_person
    FROM meetings
    ORDER BY sales_person
  `
}

export async function getClosedStatusesRaw() {
  return await sql`
    SELECT DISTINCT closed
    FROM meetings
    ORDER BY closed
  `
}

export async function getIndustriesRaw() {
  return await sql`
    SELECT id, name
    FROM industries
    ORDER BY name
  `
}

export async function getProcessedStatusesRaw() {
  return await sql`
    SELECT DISTINCT processed
    FROM meetings
    ORDER BY processed
  `
}
