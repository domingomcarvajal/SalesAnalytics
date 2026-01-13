import { ProcessTranscripts } from "@/components/process-transcripts"

export default function ProcessPage() {
  return (
    <div className="container mx-auto py-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Procesar Transcripciones de Reuniones de Ventas</h1>
        <p className="text-muted-foreground mt-2">
          Usa IA para extraer insights valiosos de las transcripciones de las reuniones de ventas
        </p>
      </div>
      <ProcessTranscripts />
    </div>
  )
}
