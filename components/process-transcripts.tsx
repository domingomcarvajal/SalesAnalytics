"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sparkles, CheckCircle2, AlertCircle, Loader2, FileText } from "lucide-react"
import { cn } from "@/lib/utils"

type CategoryItem = { id: number; name: string }

type ProcessStats = {
  unprocessedCount: number
  industries: CategoryItem[]
  painPoints: CategoryItem[]
  triggers: CategoryItem[]
  objectives: CategoryItem[]
  requirements: CategoryItem[]
}

export function ProcessTranscripts({ onProcessComplete }: { onProcessComplete?: () => void }) {
  const [processing, setProcessing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<ProcessStats | null>(null)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/process-transcripts")
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error("Failed to fetch stats:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleProcess = async () => {
    setProcessing(true)
    setMessage(null)

    try {
      const response = await fetch("/api/process-transcripts", {
        method: "POST",
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({ type: "success", text: data.message })
        onProcessComplete?.()
        fetchStats()
      } else {
        setMessage({ type: "error", text: data.error || "Falló el procesamiento" })
      }
    } catch (error) {
      setMessage({ type: "error", text: "Ocurrió un error durante el procesamiento" })
    } finally {
      setProcessing(false)
    }
  }

  const CategorySection = ({ title, items }: { title: string; items?: CategoryItem[] }) => (
    <div className="space-y-1.5">
      <div className="text-xs font-medium text-muted-foreground">{title}</div>
      <div className="flex flex-wrap gap-1">
        {items?.map((item) => (
          <Badge key={item.id} variant="outline" className="text-xs font-normal">
            {item.name}
          </Badge>
        ))}
      </div>
    </div>
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          Procesar Transcripciones con IA
        </CardTitle>
        <CardDescription>
          Extrae insights estructurados de las transcripciones de reuniones de ventas
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats section */}
        <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
          <FileText className="h-8 w-8 text-muted-foreground" />
          <div>
            <div className="text-sm text-muted-foreground">Meetings sin procesar</div>
            {loading ? (
              <div className="h-7 w-12 bg-muted animate-pulse rounded mt-1" />
            ) : (
              <div className="text-2xl font-bold">{stats?.unprocessedCount ?? 0}</div>
            )}
          </div>
        </div>

        {/* Categories sections */}
        {!loading && stats && (
          <div className="space-y-3 p-4 rounded-lg border bg-card">
            <div className="text-sm font-medium">Categorías disponibles para extracción:</div>
            <div className="grid gap-3">
              <CategorySection title="Industrias" items={stats.industries} />
              <CategorySection title="Dolores Principales" items={stats.painPoints} />
              <CategorySection title="Triggers de Descubrimiento" items={stats.triggers} />
              <CategorySection title="Objetivos Principales" items={stats.objectives} />
              <CategorySection title="Requerimientos Técnicos" items={stats.requirements} />
            </div>
          </div>
        )}

        {message && (
          <div
            className={cn(
              "flex items-center gap-2 p-3 rounded-lg text-sm",
              message.type === "success"
                ? "bg-green-50 text-green-900 dark:bg-green-900/20 dark:text-green-300"
                : "bg-red-50 text-red-900 dark:bg-red-900/20 dark:text-red-300",
            )}
          >
            {message.type === "success" ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
            <p>{message.text}</p>
          </div>
        )}

        <Button 
          onClick={handleProcess} 
          disabled={processing || loading || (stats?.unprocessedCount === 0)} 
          className="w-full"
        >
          {processing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Procesando Transcripciones...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Procesar Transcripciones
            </>
          )}
        </Button>

        <div className="text-xs text-muted-foreground space-y-1">
          <p>Se procesarán hasta 50 meetings a la vez.</p>
          <p>La IA extraerá:</p>
          <ul className="list-disc list-inside ml-2 space-y-0.5">
            <li>Industria/Vertical del cliente</li>
            <li>Dolores principales identificados</li>
            <li>Trigger de descubrimiento (cómo nos encontraron)</li>
            <li>Objetivos principales del cliente</li>
            <li>Requerimientos técnicos necesarios</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
