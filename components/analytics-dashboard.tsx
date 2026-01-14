"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { TrendingUp, Users, Target, Loader2, Building2, User, AlertTriangle, Settings } from "lucide-react"
import { AnalyticsFilters } from "./analytics-filters"
import { ExportButton } from "./export-button"
import { HorizontalBarChart } from "./horizontal-bar-chart"
import { PercentageBarChart } from "./percentage-bar-chart"

type SalespersonStat = {
  sales_person: string
  total: number
  closed: number
  close_rate: number
}

type IndustryStat = {
  industry: string
  total: number
  closed: number
  close_rate: number
}

type CategoryStat = {
  category?: string
  trigger?: string
  objective?: string
  requirement?: string
  count: number
  percentage?: number
}

type AnalyticsData = {
  totalMeetings: number
  conversionRate: string
  totalClosed: number
  salespersonStats: SalespersonStat[]
  industryStats: IndustryStat[]
  painPointsByCategory: CategoryStat[]
  triggerStats: CategoryStat[]
  objectiveStats: CategoryStat[]
  requirementStats: CategoryStat[]
}

type Filters = {
  salespeople: string[]
  closedStatuses: string[]
  industries: Array<{ id: number; name: string }>
  processedStatuses: string[]
}

const COLORS = {
  total: "#3b82f6",
  closed: "#10b981",
  rate: "#8b5cf6",
  painPoints: "#ef4444",
  triggers: "#f59e0b",
  objectives: "#06b6d4",
  requirements: "#8b5cf6",
}

const MAX_LABELS = 5

function calculateDomain(data: any[], dataKey: string) {
  if (!data || data.length === 0) return [0, 10]

  const values = data.map(item => Number(item[dataKey]) || 0)
  const max = Math.max(...values)

  return [0, Math.ceil(max * 1.1)] // Add 10% padding
}

function MetricSkeleton() {
  return <div className="h-8 w-16 bg-muted animate-pulse rounded" />
}

function ChartLoadingOverlay() {
  return (
    <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  )
}

function CustomBarTooltip({ active, payload, label, suffix = "" }: { active?: boolean; payload?: Array<{ value: number; payload?: { count?: number } }>; label?: string; suffix?: string }) {
  if (active && payload && payload.length) {
    const count = payload[0].payload?.count
    return (
      <div className="bg-popover border rounded-lg shadow-lg px-3 py-2">
        <p className="font-medium text-sm">{label}</p>
        <p className="text-sm text-muted-foreground">
          {payload[0].value}{suffix}
          {count !== undefined && suffix === "%" && (
            <span className="text-xs ml-1">({count})</span>
          )}
        </p>
      </div>
    )
  }
  return null
}

// Helper to add percentages based on total meetings
function addPercentages<T extends { count: number }>(data: T[], totalMeetings: number): (T & { percentage: number })[] {
  if (totalMeetings === 0) return data.map(item => ({ ...item, percentage: 0 }))
  return data.map(item => ({
    ...item,
    percentage: Math.round((Number(item.count) / totalMeetings) * 100 * 10) / 10 // 1 decimal
  }))
}

export function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [filters, setFilters] = useState<Filters | null>(null)
  const [initialLoading, setInitialLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const [selectedSalesperson, setSelectedSalesperson] = useState("all")
  const [selectedClosed, setSelectedClosed] = useState("all")
  const [selectedIndustryId, setSelectedIndustryId] = useState("all")
  const [selectedProcessed, setSelectedProcessed] = useState("all")

  useEffect(() => {
    fetchFilters()
  }, [])

  useEffect(() => {
    fetchAnalytics()
  }, [selectedSalesperson, selectedClosed, selectedIndustryId, selectedProcessed])

  const fetchFilters = async () => {
    try {
      const response = await fetch("/api/filters")
      const data = await response.json()
      setFilters(data)
    } catch (error) {
      console.error("Failed to fetch filters:", error)
    }
  }

  const fetchAnalytics = async () => {
    if (analytics) {
      setRefreshing(true)
    }
    
    try {
      const params = new URLSearchParams()
      if (selectedSalesperson !== "all") params.append("salesperson", selectedSalesperson)
      if (selectedClosed !== "all") params.append("closed", selectedClosed)
      if (selectedIndustryId !== "all") params.append("industryId", selectedIndustryId)
      if (selectedProcessed !== "all") params.append("processed", selectedProcessed)

      const response = await fetch(`/api/analytics?${params.toString()}`)
      const data = await response.json()
      setAnalytics(data)
    } catch (error) {
      console.error("Failed to fetch analytics:", error)
    } finally {
      setInitialLoading(false)
      setRefreshing(false)
    }
  }

  const handleReset = () => {
    setSelectedSalesperson("all")
    setSelectedClosed("all")
    setSelectedIndustryId("all")
    setSelectedProcessed("all")
  }

  if (initialLoading && !analytics) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const salespersonCount = analytics?.salespersonStats?.length ?? 0
  const industryCount = analytics?.industryStats?.length ?? 0
  const showSalespersonLabels = salespersonCount <= MAX_LABELS
  const showIndustryLabels = industryCount <= MAX_LABELS

  return (
    <div className="space-y-6">
      {/* Compact Filter Bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
      <AnalyticsFilters
        filters={filters}
        selectedSalesperson={selectedSalesperson}
        selectedClosed={selectedClosed}
        selectedIndustryId={selectedIndustryId}
        selectedProcessed={selectedProcessed}
        onSalespersonChange={setSelectedSalesperson}
        onClosedChange={setSelectedClosed}
        onIndustryChange={setSelectedIndustryId}
        onProcessedChange={setSelectedProcessed}
        onReset={handleReset}
      />
        <ExportButton
          selectedSalesperson={selectedSalesperson}
          selectedClosed={selectedClosed}
          selectedIndustryId={selectedIndustryId}
          selectedProcessed={selectedProcessed}
        />
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total de Reuniones</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {refreshing ? <MetricSkeleton /> : <div className="text-2xl font-bold">{analytics?.totalMeetings ?? 0}</div>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Deals Cerrados</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {refreshing ? <MetricSkeleton /> : <div className="text-2xl font-bold">{analytics?.totalClosed ?? 0}</div>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Tasa de Cierre</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {refreshing ? <MetricSkeleton /> : <div className="text-2xl font-bold">{analytics?.conversionRate ?? 0}%</div>}
          </CardContent>
        </Card>
      </div>

      {/* Salesperson Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Performance por Vendedor
          </CardTitle>
          <CardDescription>
            Desglose de meetings por vendedor
            {!showSalespersonLabels && " • Hover para ver nombres"}
          </CardDescription>
        </CardHeader>
        <CardContent className="relative">
          {refreshing && <ChartLoadingOverlay />}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-3">Total de Reuniones</h4>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={analytics?.salespersonStats ?? []} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis
                    type="number"
                    domain={calculateDomain(analytics?.salespersonStats ?? [], 'total')}
                    allowDecimals={false}
                  />
                  <YAxis dataKey="sales_person" type="category" width={showSalespersonLabels ? 80 : 10} tick={showSalespersonLabels ? { fontSize: 12 } : false} />
                  <Tooltip content={<CustomBarTooltip />} />
                  <Bar dataKey="total" fill={COLORS.total} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-3">Deals Cerrados</h4>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={analytics?.salespersonStats ?? []} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis
                    type="number"
                    domain={calculateDomain(analytics?.salespersonStats ?? [], 'closed')}
                    allowDecimals={false}
                  />
                  <YAxis dataKey="sales_person" type="category" width={showSalespersonLabels ? 80 : 10} tick={showSalespersonLabels ? { fontSize: 12 } : false} />
                  <Tooltip content={<CustomBarTooltip />} />
                  <Bar dataKey="closed" fill={COLORS.closed} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-3">Tasa de Cierre (%)</h4>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={analytics?.salespersonStats ?? []} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis dataKey="sales_person" type="category" width={showSalespersonLabels ? 80 : 10} tick={showSalespersonLabels ? { fontSize: 12 } : false} />
                  <Tooltip content={<CustomBarTooltip suffix="%" />} />
                  <Bar dataKey="close_rate" fill={COLORS.rate} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Industry Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Performance por Industria
          </CardTitle>
          <CardDescription>
            Desglose de meetings por industria
            {!showIndustryLabels && " • Hover para ver nombres"}
          </CardDescription>
        </CardHeader>
        <CardContent className="relative">
          {refreshing && <ChartLoadingOverlay />}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-3">Total de Reuniones</h4>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={analytics?.industryStats ?? []} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis
                    type="number"
                    domain={calculateDomain(analytics?.industryStats ?? [], 'total')}
                    allowDecimals={false}
                  />
                  <YAxis dataKey="industry" type="category" width={showIndustryLabels ? 100 : 10} tick={showIndustryLabels ? { fontSize: 12 } : false} />
                  <Tooltip content={<CustomBarTooltip />} />
                  <Bar dataKey="total" fill={COLORS.total} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-3">Deals Cerrados</h4>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={analytics?.industryStats ?? []} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis
                    type="number"
                    domain={calculateDomain(analytics?.industryStats ?? [], 'closed')}
                    allowDecimals={false}
                  />
                  <YAxis dataKey="industry" type="category" width={showIndustryLabels ? 100 : 10} tick={showIndustryLabels ? { fontSize: 12 } : false} />
                  <Tooltip content={<CustomBarTooltip />} />
                  <Bar dataKey="closed" fill={COLORS.closed} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-3">Tasa de Cierre (%)</h4>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={analytics?.industryStats ?? []} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis dataKey="industry" type="category" width={showIndustryLabels ? 100 : 10} tick={showIndustryLabels ? { fontSize: 12 } : false} />
                  <Tooltip content={<CustomBarTooltip suffix="%" />} />
                  <Bar dataKey="close_rate" fill={COLORS.rate} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pain Points */}
        <Card>
          <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Dolores Principales
          </CardTitle>
          <CardDescription>Problemas más mencionados por los clientes (% del total)</CardDescription>
          </CardHeader>
        <CardContent className="relative">
          {refreshing && <ChartLoadingOverlay />}
          {(analytics?.painPointsByCategory ?? []).length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={addPercentages(analytics?.painPointsByCategory ?? [], analytics?.totalMeetings ?? 0)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" tick={{ fontSize: 11 }} angle={-20} textAnchor="end" height={60} />
                <YAxis domain={[0, 'auto']} tickFormatter={(v) => `${v}%`} />
                <Tooltip content={<CustomBarTooltip suffix="%" />} />
                <Bar dataKey="percentage" fill={COLORS.painPoints} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[250px] text-muted-foreground">
              Sin datos. Procesa transcripciones para ver insights.
            </div>
          )}
          </CardContent>
        </Card>

      {/* Insights Grid: Triggers, Objectives, Requirements */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <PercentageBarChart
          title="Triggers de Descubrimiento"
          description="Cómo nos encontraron (%)"
          icon={TrendingUp}
          data={addPercentages(analytics?.triggerStats ?? [], analytics?.totalMeetings ?? 0)}
          dataKey="percentage"
          categoryKey="trigger"
          color={COLORS.triggers}
        />

        <PercentageBarChart
          title="Objetivos Principales"
          description="Qué buscan lograr (%)"
          icon={Target}
          data={addPercentages(analytics?.objectiveStats ?? [], analytics?.totalMeetings ?? 0)}
          dataKey="percentage"
          categoryKey="objective"
          color={COLORS.objectives}
        />

        <PercentageBarChart
          title="Requerimientos Técnicos"
          description="Integraciones necesarias (%)"
          icon={Settings}
          data={addPercentages(analytics?.requirementStats ?? [], analytics?.totalMeetings ?? 0)}
          dataKey="percentage"
          categoryKey="requirement"
          color={COLORS.requirements}
        />
      </div>

      {/* Placeholder for future sections */}
      <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center text-muted-foreground">
        <p className="text-sm">Secciones adicionales próximamente...</p>
      </div>
    </div>
  )
}
