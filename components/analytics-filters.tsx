"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Building2, RefreshCw, Target, User, CheckCircle } from "lucide-react"

type FiltersData = {
  salespeople: string[]
  closedStatuses: string[]
  industries: Array<{ id: number; name: string }>
  processedStatuses: string[]
}

type AnalyticsFiltersProps = {
  filters: FiltersData | null
  selectedSalesperson: string
  selectedClosed: string
  selectedIndustryId: string
  selectedProcessed: string
  onSalespersonChange: (value: string) => void
  onClosedChange: (value: string) => void
  onIndustryChange: (value: string) => void
  onProcessedChange: (value: string) => void
  onReset: () => void
}

export function AnalyticsFilters({
  filters,
  selectedSalesperson,
  selectedClosed,
  selectedIndustryId,
  selectedProcessed,
  onSalespersonChange,
  onClosedChange,
  onIndustryChange,
  onProcessedChange,
  onReset,
}: AnalyticsFiltersProps) {
  const hasActiveFilters =
    selectedSalesperson !== "all" ||
    selectedClosed !== "all" ||
    selectedIndustryId !== "all" ||
    selectedProcessed !== "all"

  return (
    <div className="flex items-end gap-4 flex-wrap">
      {/* Industria */}
      <div className="flex flex-col gap-1">
        <span className="text-xs text-muted-foreground flex items-center gap-1">
          <Building2 className="h-5 w-5" />
            Industria
        </span>
        <Select value={selectedIndustryId} onValueChange={onIndustryChange}>
          <SelectTrigger className="w-[140px] h-9">
            <SelectValue placeholder="Todos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {filters?.industries.map((industry) => (
              <SelectItem key={industry.id} value={String(industry.id)}>
                {industry.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Vendedor */}
      <div className="flex flex-col gap-1">
        <span className="text-xs text-muted-foreground flex items-center gap-1">
          <User className="h-5 w-5" />
           Vendedor
        </span>
        <Select value={selectedSalesperson} onValueChange={onSalespersonChange}>
          <SelectTrigger className="w-[140px] h-9">
            <SelectValue placeholder="Todos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {filters?.salespeople.map((person) => (
              <SelectItem key={person} value={person}>
                {person}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Estado */}
      <div className="flex flex-col gap-1">
        <span className="text-xs text-muted-foreground flex items-center gap-1">
          <Target className="h-4 w-4 text-muted-foreground" />
            Estado
        </span>
        <Select value={selectedClosed} onValueChange={onClosedChange}>
          <SelectTrigger className="w-[120px] h-9">
            <SelectValue placeholder="Todos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {filters?.closedStatuses.map((status) => (
              <SelectItem key={status} value={status}>
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Procesada */}
      <div className="flex flex-col gap-1">
        <span className="text-xs text-muted-foreground flex items-center gap-1">
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
            Procesada
        </span>
        <Select value={selectedProcessed} onValueChange={onProcessedChange}>
          <SelectTrigger className="w-[130px] h-9">
            <SelectValue placeholder="Todos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {filters?.processedStatuses.map((status) => (
              <SelectItem key={status} value={status}>
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Reset */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
          className="h-9 px-2 self-end"
          title="Resetear filtros"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}
