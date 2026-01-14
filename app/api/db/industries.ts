import { sql } from "./config"

export async function getAllIndustriesRaw() {
  return await sql`
    SELECT id, name
    FROM industries
    ORDER BY name
  `
}
