"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { TrendingUp, Users, DollarSign, Target, AlertCircle, MessageSquare, Loader2 } from "lucide-react"
import { AnalyticsFilters } from "./analytics-filters"

type AnalyticsData = {
  totalMeetings: number
  conversionRate: string
  avgDealValue: number
  topPainPoints: Array<{ pain_point: string; category: string; priority: string; frequency: number }>
  topObjections: Array<{ objection: string; objection_type: string; frequency: number }>
  competitorData: Array<{ competitor_name: string; mentions: number; sentiment: string }>
  industryBreakdown: Array<{ industry: string; count: number }>
}

type Filters = {
  industries: string[]
  salespeople: string[]
  dealStatuses: string[]
}

const COLORS = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981"]

export function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [filters, setFilters] = useState<Filters | null>(null)
  const [loading, setLoading] = useState(true)

  const [selectedIndustry, setSelectedIndustry] = useState("all")
  const [selectedSalesperson, setSelectedSalesperson] = useState("all")
  const [selectedDealStatus, setSelectedDealStatus] = useState("all")

  useEffect(() => {
    fetchFilters()
  }, [])

  useEffect(() => {
    fetchAnalytics()
  }, [selectedIndustry, selectedSalesperson, selectedDealStatus])

  const fetchFilters = async () => {
    try {
      const response = await fetch("/api/filters")
      const data = await response.json()
      setFilters(data)
    } catch (error) {
      console.error("[v0] Failed to fetch filters:", error)
    }
  }

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (selectedIndustry !== "all") params.append("industry", selectedIndustry)
      if (selectedSalesperson !== "all") params.append("salesperson", selectedSalesperson)
      if (selectedDealStatus !== "all") params.append("dealStatus", selectedDealStatus)

      const response = await fetch(`/api/analytics?${params.toString()}`)
      const data = await response.json()
      console.log('debug data', data);
      setAnalytics(data)
    } catch (error) {
      console.error("[v0] Failed to fetch analytics:", error)
      console.log(error);
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setSelectedIndustry("all")
    setSelectedSalesperson("all")
    setSelectedDealStatus("all")
  }

  const handleExport = async () => {
    const params = new URLSearchParams()
    if (selectedIndustry !== "all") params.append("industry", selectedIndustry)
    if (selectedSalesperson !== "all") params.append("salesperson", selectedSalesperson)
    if (selectedDealStatus !== "all") params.append("dealStatus", selectedDealStatus)

    const url = `/api/export?${params.toString()}`
    window.open(url, "_blank")
  }

  if (loading || !analytics) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <AnalyticsFilters
        filters={filters}
        selectedIndustry={selectedIndustry}
        selectedSalesperson={selectedSalesperson}
        selectedDealStatus={selectedDealStatus}
        onIndustryChange={setSelectedIndustry}
        onSalespersonChange={setSelectedSalesperson}
        onDealStatusChange={setSelectedDealStatus}
        onReset={handleReset}
        onExport={handleExport}
      />

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Meetings</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalMeetings}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.conversionRate}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg Deal Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${Number(analytics.avgDealValue).toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Insights</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.topPainPoints.length + analytics.topObjections.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Industry Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Industry Breakdown</CardTitle>
            <CardDescription>Distribution of meetings across industries</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.industryBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ industry, percent }) => `${industry} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                  nameKey="industry"
                >
                  {analytics.industryBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Competitor Mentions */}
        <Card>
          <CardHeader>
            <CardTitle>Competitive Landscape</CardTitle>
            <CardDescription>Most mentioned competitors</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.competitorData.slice(0, 5)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="competitor_name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="mentions" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Pain Points and Objections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Pain Points */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Top Pain Points
            </CardTitle>
            <CardDescription>Most frequent customer challenges</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.topPainPoints.slice(0, 5).map((point, index) => (
                <div key={index} className="flex items-start justify-between gap-4 pb-3 border-b last:border-0">
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-tight">{point.pain_point}</p>
                    <div className="flex items-center gap-2">
                      {point.category && (
                        <Badge variant="secondary" className="text-xs">
                          {point.category}
                        </Badge>
                      )}
                      {point.priority && (
                        <Badge
                          variant={
                            point.priority === "High"
                              ? "destructive"
                              : point.priority === "Medium"
                                ? "default"
                                : "outline"
                          }
                          className="text-xs"
                        >
                          {point.priority}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">{point.frequency}</div>
                    <div className="text-xs text-muted-foreground">mentions</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Objections */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Common Objections
            </CardTitle>
            <CardDescription>Frequently raised sales objections</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.topObjections.slice(0, 5).map((objection, index) => (
                <div key={index} className="flex items-start justify-between gap-4 pb-3 border-b last:border-0">
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-tight">{objection.objection}</p>
                    {objection.objection_type && (
                      <Badge variant="secondary" className="text-xs">
                        {objection.objection_type}
                      </Badge>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">{objection.frequency}</div>
                    <div className="text-xs text-muted-foreground">mentions</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
