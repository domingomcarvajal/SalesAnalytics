import { sql } from "./config"

export interface ExportFilters {
  salesperson?: string
  closed?: string
  industryId?: string
  processed?: string
}

// Helper function to map frontend filter labels to database boolean values
function mapExportFiltersToDatabase(filters: ExportFilters) {
  const { salesperson = "all", closed = "all", industryId = "all", processed = "all" } = filters

  // Map closed status: "Won" -> true, "Open" -> false
  let closedFilter: boolean | null = null
  if (closed !== "all") {
    closedFilter = closed === "Won" ? true : false
  }

  const industryIdFilter = industryId === "all" ? null : parseInt(industryId, 10)

  // Map processed status: "Procesada" -> true, "Sin procesar" -> false
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

export async function getMeetingsForExportRaw(filters: ExportFilters = {}) {
  const { salesperson, closedFilter, industryIdFilter, processedFilter } = mapExportFiltersToDatabase(filters)

  return await sql`
    SELECT
      m.id,
      m.meeting_date,
      m.client_name,
      m.client_email,
      m.client_phone_number,
      m.sales_person,
      m.closed,
      i.name as industry,
      COALESCE(STRING_AGG(DISTINCT ppc.name, ' / ') FILTER (WHERE ppc.name IS NOT NULL), '') as pain_points,
      COALESCE(STRING_AGG(DISTINCT dtc.name, ' / ') FILTER (WHERE dtc.name IS NOT NULL), '') as triggers,
      COALESCE(STRING_AGG(DISTINCT oc.name, ' / ') FILTER (WHERE oc.name IS NOT NULL), '') as objectives,
      COALESCE(STRING_AGG(DISTINCT trc.name, ' / ') FILTER (WHERE trc.name IS NOT NULL), '') as requirements
    FROM meetings m
    LEFT JOIN industries i ON m.industry_id = i.id
    LEFT JOIN meeting_pain_points mpp ON m.id = mpp.meeting_id
    LEFT JOIN pain_point_categories ppc ON mpp.pain_point_id = ppc.id
    LEFT JOIN meeting_discovery_triggers mdt ON m.id = mdt.meeting_id
    LEFT JOIN discovery_trigger_categories dtc ON mdt.trigger_id = dtc.id
    LEFT JOIN meeting_objectives mo ON m.id = mo.meeting_id
    LEFT JOIN objective_categories oc ON mo.objective_id = oc.id
    LEFT JOIN meeting_technical_requirements mtr ON m.id = mtr.meeting_id
    LEFT JOIN technical_requirement_categories trc ON mtr.requirement_id = trc.id
    WHERE (${salesperson} = 'all' OR m.sales_person = ${salesperson})
      AND (${closedFilter}::boolean IS NULL OR m.closed = ${closedFilter})
      AND (${industryIdFilter}::integer IS NULL OR m.industry_id = ${industryIdFilter})
      AND (${processedFilter}::boolean IS NULL OR m.processed = ${processedFilter})
    GROUP BY m.id, m.meeting_date, m.client_name, m.client_email, m.client_phone_number, m.sales_person, m.closed, i.name
    ORDER BY m.meeting_date DESC
  `
}
