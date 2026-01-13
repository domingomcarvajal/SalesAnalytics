"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, FileText, CheckCircle2, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

export function UploadForm({ onUploadComplete }: { onUploadComplete?: () => void }) {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (selectedFile: File | null) => {
    setFile(selectedFile)
    setMessage(null)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile && droppedFile.type === "text/csv") {
      handleFileChange(droppedFile)
    } else {
      setMessage({ type: "error", text: "Por favor sube un archivo CSV" })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!file) {
      setMessage({ type: "error", text: "Por favor selecciona un archivo" })
      return
    }

    setUploading(true)
    setMessage(null)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({ type: "success", text: data.message })
        setFile(null)
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
        onUploadComplete?.()
      } else {
        setMessage({ type: "error", text: data.error || "Falló la subida" })
      }
    } catch (error) {
      setMessage({ type: "error", text: "Ocurrió un error durante la subida" })
    } finally {
      setUploading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subir Datos de las Reuniones de Ventas</CardTitle>
        <CardDescription>
          Sube un archivo CSV con las transcripciones de las reuniones de ventas. El formato esperado es: client_name, client_email, client_phone_number,
          meeting_date, sales_person, closed (0 o 1), transcript.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center transition-colors relative",
              isDragging ? "border-primary bg-primary/5" : "border-border",
              file && "border-primary",
            )}
          >
            <div className="flex flex-col items-center gap-2">
              {file ? (
                <>
                  <FileText className="h-12 w-12 text-primary" />
                  <p className="text-sm font-medium">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(2)} KB</p>
                </>
              ) : (
                <>
                  <Upload className="h-12 w-12 text-muted-foreground" />
                  <p className="text-sm font-medium">Arrastra y suelta tu archivo CSV aquí</p>
                  <p className="text-xs text-muted-foreground">o haz clic para navegar</p>
                </>
              )}
            </div>
            <input
              type="file"
              accept=".csv"
              onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
              className="hidden"
              id="file-upload"
              ref={fileInputRef}
            />
            <label htmlFor="file-upload" className="cursor-pointer absolute inset-0" />
          </div>

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

          <Button type="submit" disabled={!file || uploading} className="w-full">
            {uploading ? "Subiendo..." : "Subir CSV"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
