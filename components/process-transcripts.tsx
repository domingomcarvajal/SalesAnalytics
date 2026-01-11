"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, CheckCircle2, AlertCircle, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

export function ProcessTranscripts({ onProcessComplete }: { onProcessComplete?: () => void }) {
  const [processing, setProcessing] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

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
      } else {
        setMessage({ type: "error", text: data.error || "Processing failed" })
      }
    } catch (error) {
      setMessage({ type: "error", text: "An error occurred during processing" })
    } finally {
      setProcessing(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          Process Transcripts with AI
        </CardTitle>
        <CardDescription>
          Use AI to extract pain points, objections, competitive mentions, and questions from meeting transcripts
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
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

        <Button onClick={handleProcess} disabled={processing} className="w-full">
          {processing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing Transcripts...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Process Unprocessed Transcripts
            </>
          )}
        </Button>

        <div className="text-xs text-muted-foreground space-y-1">
          <p>This will process up to 10 unprocessed meetings at a time.</p>
          <p>AI will extract:</p>
          <ul className="list-disc list-inside ml-2 space-y-0.5">
            <li>Customer pain points and priorities</li>
            <li>Sales objections and resolution status</li>
            <li>Competitive mentions and sentiment</li>
            <li>Questions asked and their categories</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
