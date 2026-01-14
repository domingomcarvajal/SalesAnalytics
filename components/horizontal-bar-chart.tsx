import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { AlertTriangle } from "lucide-react"

interface HorizontalBarChartProps {
  title: string
  description: string
  data: any[]
  dataKey: string
  categoryKey: string
  color: string
  height?: number
}

export function HorizontalBarChart({
  title,
  description,
  data,
  dataKey,
  categoryKey,
  color,
  height = 250,
}: HorizontalBarChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart data={data} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                type="number"
                domain={[0, 'dataMax']}
                tickFormatter={(v) => `${v}%`}
              />
              <YAxis
                type="category"
                dataKey={categoryKey}
                width={120}
                tick={{ fontSize: 11 }}
              />
              <Tooltip formatter={(value) => [`${value}%`, title]} />
              <Bar dataKey={dataKey} fill={color} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[250px] text-muted-foreground">
            Sin datos disponibles
          </div>
        )}
      </CardContent>
    </Card>
  )
}
