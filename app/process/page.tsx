import { ProcessTranscripts } from "@/components/process-transcripts"

export default function ProcessPage() {
  return (
    <div className="container mx-auto py-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Process Meeting Transcripts</h1>
        <p className="text-muted-foreground mt-2">
          Use AI to extract valuable insights from your sales meeting transcripts
        </p>
      </div>
      <ProcessTranscripts />
    </div>
  )
}
