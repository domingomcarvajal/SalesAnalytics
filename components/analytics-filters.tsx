"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Download, RefreshCw } from "lucide-react"

type FiltersData = {
  industries: string[]
  salespeople: string[]
  dealStatuses: string[]
}

type AnalyticsFiltersProps = {
  filters: FiltersData | null
  selectedIndustry: string
  selectedSalesperson: string
  selectedDealStatus: string
  onIndustryChange: (value: string) => void
  onSalespersonChange: (value: string) => void
  onDealStatusChange: (value: string) => void
  onReset: () => void
  onExport: () => void
}

export function AnalyticsFilters({
  filters,
  selectedIndustry,
  selectedSalesperson,
  selectedDealStatus,
  onIndustryChange,
  onSalespersonChange,
  onDealStatusChange,
  onReset,
  onExport,
}: AnalyticsFiltersProps) {
  const hasActiveFilters = selectedIndustry !== "all" || selectedSalesperson !== "all" || selectedDealStatus !== "all"

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Filters</CardTitle>
            <CardDescription>Refine your analytics view</CardDescription>
          </div>
          <div className="flex gap-2">
            {hasActiveFilters && (
              <Button variant="outline" size="sm" onClick={onReset}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={onExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Industry</label>
            <Select value={selectedIndustry} onValueChange={onIndustryChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Industries</SelectItem>
                {filters?.industries.map((industry) => (
                  <SelectItem key={industry} value={industry}>
                    {industry}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Salesperson</label>
            <Select value={selectedSalesperson} onValueChange={onSalespersonChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Salespeople</SelectItem>
                {filters?.salespeople.map((person) => (
                  <SelectItem key={person} value={person}>
                    {person}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Deal Status</label>
            <Select value={selectedDealStatus} onValueChange={onDealStatusChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {filters?.dealStatuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
