import { sql } from "./config"

export interface AnalyticsFilters {
  salesperson?: string
  closed?: string
  industryId?: string
  processed?: string
}

// Helper function to map frontend filter labels to database boolean values
function mapFiltersToDatabase(filters: AnalyticsFilters) {
  const { salesperson = "all", closed = "all", industryId = "all", processed = "all" } = filters

  // Map closed status: "Won" -> true, "Open" -> false
  let closedFilter: boolean | null = null
  if (closed !== "all") {
    closedFilter = closed === "Won" ? true : false
  }

  const industryIdFilter = industryId === "all" ? null : parseInt(industryId, 10)

  // Map processed status: "Procesada" -> true, "Sin procesar" -> false
  console.log('debug processed', processed)
  let processedFilter: boolean | null = null
  if (processed !== "all") {
    processedFilter = processed === "Procesada" ? true : false
  }

  return {
    salesperson,
    closedFilter,
    industryIdFilter,
    processedFilter,
  }
}

export async function getTotalMeetingsRaw(filters: AnalyticsFilters = {}) {
  const { salesperson, closedFilter, industryIdFilter, processedFilter } = mapFiltersToDatabase(filters)

  const result = await sql`
    SELECT COUNT(*) as count
    FROM meetings m
    WHERE (${salesperson} = 'all' OR m.sales_person = ${salesperson})
      AND (${closedFilter}::boolean IS NULL OR m.closed = ${closedFilter})
      AND (${industryIdFilter}::integer IS NULL OR m.industry_id = ${industryIdFilter})
      AND (${processedFilter}::boolean IS NULL OR m.processed = ${processedFilter})
  `

  return Number.parseInt(result[0].count)
}

export async function getConversionDataRaw(filters: AnalyticsFilters = {}) {
  const { salesperson, closedFilter, industryIdFilter, processedFilter } = mapFiltersToDatabase(filters)

  const result = await sql`
    SELECT
      COUNT(CASE WHEN closed = true THEN 1 END) as won,
      COUNT(*) as total
    FROM meetings m
    WHERE (${salesperson} = 'all' OR m.sales_person = ${salesperson})
      AND (${closedFilter}::boolean IS NULL OR m.closed = ${closedFilter})
      AND (${industryIdFilter}::integer IS NULL OR m.industry_id = ${industryIdFilter})
      AND (${processedFilter}::boolean IS NULL OR m.processed = ${processedFilter})
  `

  const { won, total } = result[0]
  return {
    won: Number(won),
    total: Number(total),
    rate: total > 0 ? ((won / total) * 100).toFixed(2) : "0.00"
  }
}

export async function getSalespersonStatsRaw(filters: AnalyticsFilters = {}) {
  const { salesperson, closedFilter, industryIdFilter, processedFilter } = mapFiltersToDatabase(filters)

  return await sql`
    SELECT
      sales_person,
      COUNT(*) as total,
      COUNT(CASE WHEN closed = true THEN 1 END) as closed,
      ROUND(
        CASE
          WHEN COUNT(*) > 0
          THEN (COUNT(CASE WHEN closed = true THEN 1 END)::numeric / COUNT(*)::numeric) * 100
          ELSE 0
        END,
        1
      ) as close_rate
    FROM meetings m
    WHERE (${salesperson} = 'all' OR m.sales_person = ${salesperson})
      AND (${closedFilter}::boolean IS NULL OR m.closed = ${closedFilter})
      AND (${industryIdFilter}::integer IS NULL OR m.industry_id = ${industryIdFilter})
      AND (${processedFilter}::boolean IS NULL OR m.processed = ${processedFilter})
    GROUP BY sales_person
    ORDER BY total DESC
  `
}

export async function getIndustryStatsRaw(filters: AnalyticsFilters = {}) {
  const { salesperson, closedFilter, industryIdFilter, processedFilter } = mapFiltersToDatabase(filters)

  return await sql`
    SELECT
      COALESCE(i.name, 'sin_asignar') as industry,
      COUNT(*) as total,
      COUNT(CASE WHEN m.closed = true THEN 1 END) as closed,
      ROUND(
        CASE
          WHEN COUNT(*) > 0
          THEN (COUNT(CASE WHEN m.closed = true THEN 1 END)::numeric / COUNT(*)::numeric) * 100
          ELSE 0
        END,
        1
      ) as close_rate
    FROM meetings m
    LEFT JOIN industries i ON m.industry_id = i.id
    WHERE (${salesperson} = 'all' OR m.sales_person = ${salesperson})
      AND (${closedFilter}::boolean IS NULL OR m.closed = ${closedFilter})
      AND (${industryIdFilter}::integer IS NULL OR m.industry_id = ${industryIdFilter})
      AND (${processedFilter}::boolean IS NULL OR m.processed = ${processedFilter})
    GROUP BY i.name
    ORDER BY total DESC
  `
}

export async function getPainPointsByCategoryRaw(filters: AnalyticsFilters = {}) {
  const { salesperson, closedFilter, industryIdFilter, processedFilter } = mapFiltersToDatabase(filters)

  return await sql`
    SELECT
      ppc.name as category,
      COUNT(*) as count
    FROM meeting_pain_points mpp
    JOIN pain_point_categories ppc ON mpp.pain_point_id = ppc.id
    JOIN meetings m ON mpp.meeting_id = m.id
    WHERE (${salesperson} = 'all' OR m.sales_person = ${salesperson})
      AND (${closedFilter}::boolean IS NULL OR m.closed = ${closedFilter})
      AND (${industryIdFilter}::integer IS NULL OR m.industry_id = ${industryIdFilter})
      AND (${processedFilter}::boolean IS NULL OR m.processed = ${processedFilter})
    GROUP BY ppc.name
    ORDER BY count DESC
  `
}

export async function getTriggerStatsRaw(filters: AnalyticsFilters = {}) {
  const { salesperson, closedFilter, industryIdFilter, processedFilter } = mapFiltersToDatabase(filters)

  return await sql`
    SELECT
      dtc.name as trigger,
      COUNT(*) as count
    FROM meeting_discovery_triggers mdt
    JOIN discovery_trigger_categories dtc ON mdt.trigger_id = dtc.id
    JOIN meetings m ON mdt.meeting_id = m.id
    WHERE (${salesperson} = 'all' OR m.sales_person = ${salesperson})
      AND (${closedFilter}::boolean IS NULL OR m.closed = ${closedFilter})
      AND (${industryIdFilter}::integer IS NULL OR m.industry_id = ${industryIdFilter})
      AND (${processedFilter}::boolean IS NULL OR m.processed = ${processedFilter})
    GROUP BY dtc.name
    ORDER BY count DESC
  `
}

export async function getObjectiveStatsRaw(filters: AnalyticsFilters = {}) {
  const { salesperson, closedFilter, industryIdFilter, processedFilter } = mapFiltersToDatabase(filters)

  return await sql`
    SELECT
      oc.name as objective,
      COUNT(*) as count
    FROM meeting_objectives mo
    JOIN objective_categories oc ON mo.objective_id = oc.id
    JOIN meetings m ON mo.meeting_id = m.id
    WHERE (${salesperson} = 'all' OR m.sales_person = ${salesperson})
      AND (${closedFilter}::boolean IS NULL OR m.closed = ${closedFilter})
      AND (${industryIdFilter}::integer IS NULL OR m.industry_id = ${industryIdFilter})
      AND (${processedFilter}::boolean IS NULL OR m.processed = ${processedFilter})
    GROUP BY oc.name
    ORDER BY count DESC
  `
}

export async function getRequirementStatsRaw(filters: AnalyticsFilters = {}) {
  const { salesperson, closedFilter, industryIdFilter, processedFilter } = mapFiltersToDatabase(filters)

  return await sql`
    SELECT
      trc.name as requirement,
      COUNT(*) as count
    FROM meeting_technical_requirements mtr
    JOIN technical_requirement_categories trc ON mtr.requirement_id = trc.id
    JOIN meetings m ON mtr.meeting_id = m.id
    WHERE (${salesperson} = 'all' OR m.sales_person = ${salesperson})
      AND (${closedFilter}::boolean IS NULL OR m.closed = ${closedFilter})
      AND (${industryIdFilter}::integer IS NULL OR m.industry_id = ${industryIdFilter})
      AND (${processedFilter}::boolean IS NULL OR m.processed = ${processedFilter})
    GROUP BY trc.name
    ORDER BY count DESC
  `
}
