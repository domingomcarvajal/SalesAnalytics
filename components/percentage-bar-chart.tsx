import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { LucideIcon } from "lucide-react"

interface PercentageBarChartProps {
  title: string
  description: string
  icon: LucideIcon
  data: any[]
  dataKey: string
  categoryKey: string
  color: string
  height?: number
}

export function PercentageBarChart({
  title,
  description,
  icon: Icon,
  data,
  dataKey,
  categoryKey,
  color,
  height = 220,
}: PercentageBarChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Icon className="h-4 w-4" />
          {title}
        </CardTitle>
        <CardDescription className="text-xs">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart data={data} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis
                type="number"
                domain={[0, 'auto']}
                tickFormatter={(v) => `${v}%`}
              />
              <YAxis
                dataKey={categoryKey}
                type="category"
                width={160}
                tick={{ fontSize: 11 }}
                interval={0}
              />
              <Tooltip formatter={(value) => [`${value}%`, title]} />
              <Bar dataKey={dataKey} fill={color} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[180px] text-muted-foreground text-sm">
            Sin datos
          </div>
        )}
      </CardContent>
    </Card>
  )
}
