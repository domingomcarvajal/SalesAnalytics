import { AnalyticsDashboard } from "@/components/analytics-dashboard"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Upload, Sparkles } from "lucide-react"

export default function Home() {
  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">KampAI🍾</h1>
          <p className="text-muted-foreground mt-2">
            Insights de las conversaciones de ventas con el equipo de Vambe
          </p>
        </div>

        <div className="flex gap-2">
          <Button asChild size="sm" className="h-9">
            <Link href="/upload">
              <Upload className="mr-2 h-4 w-4" />
              Ingresar Datos
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="h-9">
            <Link href="/process">
              <Sparkles className="mr-2 h-4 w-4" />
              Procesar Transcripciones
            </Link>
          </Button>
        </div>
      </div>

      <AnalyticsDashboard />
    </div>
  )
}
