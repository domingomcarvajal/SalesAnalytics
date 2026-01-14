import { getAllIndustriesRaw } from "../db/industries"

export interface IndustriesResponse {
  industries: Array<{ id: number; name: string }>
}

export async function getIndustries(): Promise<IndustriesResponse> {
  const industries = await getAllIndustriesRaw()
  return {
    industries: industries.map((i) => ({ id: i.id, name: i.name })),
  }
}
