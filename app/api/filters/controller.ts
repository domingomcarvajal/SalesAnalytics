import {
  getSalespeopleRaw,
  getClosedStatusesRaw,
  getIndustriesRaw,
  getProcessedStatusesRaw,
} from "../db/filters"

export interface FilterOptions {
  salespeople: string[]
  closedStatuses: string[]
  industries: Array<{ id: number; name: string }>
  processedStatuses: string[]
}

export async function getFilterOptions(): Promise<FilterOptions> {
  const [salespeople, closedStatuses, industries, processedStatuses] = await Promise.all([
    getSalespeopleRaw(),
    getClosedStatusesRaw(),
    getIndustriesRaw(),
    getProcessedStatusesRaw(),
  ])

  return {
    salespeople: salespeople.map((s) => s.sales_person),
    closedStatuses: closedStatuses.map((c) => c.closed ? "Won" : "Open"),
    industries: industries.map((i) => ({ id: i.id, name: i.name })),
    processedStatuses: processedStatuses.map((p) => p.processed ? "Procesada" : "Sin procesar"),
  }
}
