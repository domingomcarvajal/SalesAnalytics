"use client"

import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

type ExportButtonProps = {
  selectedSalesperson: string
  selectedClosed: string
  selectedIndustryId: string
  selectedProcessed: string
}

export function ExportButton({
  selectedSalesperson,
  selectedClosed,
  selectedIndustryId,
  selectedProcessed,
}: ExportButtonProps) {
  const handleExport = () => {
    const params = new URLSearchParams()
    if (selectedSalesperson !== "all") params.append("salesperson", selectedSalesperson)
    if (selectedClosed !== "all") params.append("closed", selectedClosed)
    if (selectedIndustryId !== "all") params.append("industryId", selectedIndustryId)
    if (selectedProcessed !== "all") params.append("processed", selectedProcessed)

    const url = `/api/export?${params.toString()}`
    window.open(url, "_blank")
  }

  return (
    <Button variant="outline" size="sm" onClick={handleExport} className="h-9">
      <Download className="h-4 w-4 mr-2" />
      Export
    </Button>
  )
}

