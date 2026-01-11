import { AnalyticsDashboard } from "@/components/analytics-dashboard"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Upload, Sparkles } from "lucide-react"

export default function Home() {
  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Sales Meeting Analytics</h1>
          <p className="text-muted-foreground mt-2">
            AI-powered insights from your sales conversations with the Vambe team
          </p>
        </div>

        <div className="flex gap-3">
          <Button asChild>
            <Link href="/upload">
              <Upload className="mr-2 h-4 w-4" />
              Upload Data
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/process">
              <Sparkles className="mr-2 h-4 w-4" />
              Process Transcripts
            </Link>
          </Button>
        </div>
      </div>

      <AnalyticsDashboard />
    </div>
  )
}
