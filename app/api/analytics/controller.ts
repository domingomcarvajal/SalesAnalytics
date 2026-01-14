import {
  getTotalMeetingsRaw,
  getConversionDataRaw,
  getSalespersonStatsRaw,
  getIndustryStatsRaw,
  getPainPointsByCategoryRaw,
  getTriggerStatsRaw,
  getObjectiveStatsRaw,
  getRequirementStatsRaw,
  type AnalyticsFilters,
} from "../db/analytics"

export interface AnalyticsData {
  totalMeetings: number
  conversionRate: string
  totalClosed: number
  salespersonStats: Array<{
    sales_person: string
    total: number
    closed: number
    close_rate: number
  }>
  industryStats: Array<{
    industry: string
    total: number
    closed: number
    close_rate: number
  }>
  painPointsByCategory: Array<{
    category: string
    count: number
    percentage: number
  }>
  triggerStats: Array<{
    trigger: string
    count: number
    percentage: number
  }>
  objectiveStats: Array<{
    objective: string
    count: number
    percentage: number
  }>
  requirementStats: Array<{
    requirement: string
    count: number
    percentage: number
  }>
}

// Helper to add percentages based on total meetings
function addPercentages<T extends { count: number }>(data: T[], totalMeetings: number): (T & { percentage: number })[] {
  if (totalMeetings === 0) return data.map(item => ({ ...item, percentage: 0 }))
  return data.map(item => ({
    ...item,
    percentage: Math.round((Number(item.count) / totalMeetings) * 100 * 10) / 10 // 1 decimal
  }))
}

export async function getAnalyticsData(filters: AnalyticsFilters = {}): Promise<AnalyticsData> {
  // Get all analytics data using the extracted functions
  const [
    totalMeetings,
    conversionData,
    salespersonStats,
    industryStats,
    painPointsByCategory,
    triggerStats,
    objectiveStats,
    requirementStats,
  ] = await Promise.all([
    getTotalMeetingsRaw(filters),
    getConversionDataRaw(filters),
    getSalespersonStatsRaw(filters),
    getIndustryStatsRaw(filters),
    getPainPointsByCategoryRaw(filters),
    getTriggerStatsRaw(filters),
    getObjectiveStatsRaw(filters),
    getRequirementStatsRaw(filters),
  ])

  // Format the data with percentages
  return {
    totalMeetings,
    conversionRate: conversionData.rate,
    totalClosed: conversionData.won,
    salespersonStats: salespersonStats as AnalyticsData['salespersonStats'],
    industryStats: industryStats as AnalyticsData['industryStats'],
    painPointsByCategory: addPercentages(painPointsByCategory as { count: number }[], totalMeetings).map(item => ({
      category: (item as any).category,
      count: item.count,
      percentage: item.percentage
    })),
    triggerStats: addPercentages(triggerStats as { count: number }[], totalMeetings).map(item => ({
      trigger: (item as any).trigger,
      count: item.count,
      percentage: item.percentage
    })),
    objectiveStats: addPercentages(objectiveStats as { count: number }[], totalMeetings).map(item => ({
      objective: (item as any).objective,
      count: item.count,
      percentage: item.percentage
    })),
    requirementStats: addPercentages(requirementStats as { count: number }[], totalMeetings).map(item => ({
      requirement: (item as any).requirement,
      count: item.count,
      percentage: item.percentage
    })),
  }
}
