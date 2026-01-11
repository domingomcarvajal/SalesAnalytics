import { UploadForm } from "@/components/upload-form"

export default function UploadPage() {
  return (
    <div className="container mx-auto py-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Upload Sales Data</h1>
        <p className="text-muted-foreground mt-2">Import your sales meeting data to generate insights and analytics</p>
      </div>
      <UploadForm />
    </div>
  )
}
