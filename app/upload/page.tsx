import { UploadForm } from "@/components/upload-form"

export default function UploadPage() {
  return (
    <div className="container mx-auto py-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Sube datos de las reuniones de ventas</h1>
        <p className="text-muted-foreground mt-2">Importa los datos de las reuniones de ventas para generar insights y analíticas</p>
      </div>
      <UploadForm />
    </div>
  )
}
