"use client"

import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

type ExportButtonProps = {
  selectedSalesperson: string
  selectedClosed: string
  selectedIndustryId: string
}

export function ExportButton({
  selectedSalesperson,
  selectedClosed,
  selectedIndustryId,
}: ExportButtonProps) {
  const handleExport = () => {
    const params = new URLSearchParams()
    if (selectedSalesperson !== "all") params.append("salesperson", selectedSalesperson)
    if (selectedClosed !== "all") params.append("closed", selectedClosed)
    if (selectedIndustryId !== "all") params.append("industryId", selectedIndustryId)

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

