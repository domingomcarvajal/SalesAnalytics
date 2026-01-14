import { getMeetingsForExportRaw, type ExportFilters } from "../db/export"

export function formatMeetingsForCSV(meetings: any[]): string {
  const csvHeader =
    "ID,Meeting Date,Client Name,Client Email,Client Phone,Salesperson,Status,Industry,Pain Points,Triggers,Objectives,Requirements\n"
  const csvRows = meetings
    .map(
      (m) =>
        `${m.id},${m.meeting_date},${m.client_name},${m.client_email || ""},${m.client_phone_number || ""},${m.sales_person},${m.closed ? "Won" : "Open"},${m.industry || ""},"${m.pain_points}","${m.triggers}","${m.objectives}","${m.requirements}"`,
    )
    .join("\n")

  return csvHeader + csvRows
}

export async function getMeetingsForExport(filters: ExportFilters = {}) {
  const meetings = await getMeetingsForExportRaw(filters)
  const csv = formatMeetingsForCSV(meetings)
  return csv
}
