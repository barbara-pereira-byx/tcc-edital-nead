"use client"

import type React from "react"

import { useState, useRef } from "react"
import { FileText, Upload, X, Check, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface FileUploadAreaProps {
  files: Array<{
    file: File | null
    label: string
    progress?: number
    status?: "idle" | "uploading" | "success" | "error"
    url?: string
  }>
  onAddFile: () => void
  onRemoveFile: (index: number) => void
  onFileChange: (index: number, file: File) => void
  onLabelChange: (index: number, label: string) => void
}

export function FileUploadArea({ files, onAddFile, onRemoveFile, onFileChange, onLabelChange }: FileUploadAreaProps) {
  const [dragActive, setDragActive] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileChange(index, e.dataTransfer.files[0])
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    if (e.target.files && e.target.files[0]) {
      onFileChange(index, e.target.files[0])
    }
  }

  const triggerFileInput = (index: number) => {
    inputRefs.current[index]?.click()
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium">Documentos do Edital</h3>
        <Button type="button" onClick={onAddFile} variant="outline" size="sm" className="flex items-center gap-1">
          <Upload className="h-3 w-3" />
          Adicionar
        </Button>
      </div>

      {files.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-lg bg-gray-50 h-full">
          <FileText className="h-10 w-10 text-gray-400 mb-2" />
          <p className="text-xs text-gray-500 text-center mb-2">Nenhum documento adicionado</p>
          <Button type="button" onClick={onAddFile} variant="secondary" size="sm">
            Adicionar Documento
          </Button>
        </div>
      ) : (
        <div className="space-y-2 overflow-y-auto max-h-[300px] pr-1">
          {files.map((fileItem, index) => (
            <div
              key={index}
              className={cn(
                "p-2 border rounded-lg transition-colors",
                dragActive ? "border-blue-500 bg-blue-50" : "border-gray-200",
                fileItem.status === "error" && "border-red-200 bg-red-50",
              )}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={(e) => handleDrop(e, index)}
            >
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor={`file-label-${index}`} className="text-xs font-medium">
                    Rótulo
                  </Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveFile(index)}
                    className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="h-3 w-3" />
                    <span className="sr-only">Remover</span>
                  </Button>
                </div>

                <Input
                  id={`file-label-${index}`}
                  value={fileItem.label}
                  onChange={(e) => onLabelChange(index, e.target.value)}
                  placeholder="Ex: Edital completo, Anexo I"
                  className="h-8 text-xs"
                />

                <div
                  className={cn(
                    "flex items-center gap-2 p-2 rounded-md cursor-pointer",
                    fileItem.file ? "bg-gray-100" : "bg-gray-50 border border-dashed",
                  )}
                  onClick={() => triggerFileInput(index)}
                >
                  <input
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="file"
                    id={`file-upload-${index}`}
                    className="hidden"
                    onChange={(e) => handleFileInputChange(e, index)}
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar"
                  />

                  {fileItem.file ? (
                    <>
                      <FileText className="h-6 w-6 text-blue-500 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{fileItem.file.name}</p>
                        <p className="text-xs text-gray-500">{(fileItem.file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                      {fileItem.status === "success" && <Check className="h-4 w-4 text-green-500" />}
                      {fileItem.status === "error" && <AlertCircle className="h-4 w-4 text-red-500" />}
                    </>
                  ) : fileItem.url ? (
                    <>
                      <FileText className="h-6 w-6 text-green-600 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{fileItem.label || "Documento anexado"}</p>
                      </div>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6 text-blue-500 hover:text-blue-700"
                        onClick={() => window.open(fileItem.url, "_blank")}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M14 3h7v7h-2V6.41l-9.29 9.3-1.42-1.42 9.3-9.29H14V3z" />
                          <path d="M5 5h6V3H3v8h2V5z" fill="none" />
                          <path d="M5 19h14V9h2v12H3V9h2v10z" />
                        </svg>
                      </Button>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center w-full py-2">
                      <Upload className="h-6 w-6 text-gray-400 mb-1" />
                      <p className="text-xs text-gray-500 text-center">Clique para selecionar ou arraste um arquivo</p>
                    </div>
                  )}
                </div>

                {fileItem.status === "uploading" && (
                  <div className="mt-1">
                    <Progress value={fileItem.progress} className="h-1" />
                    <p className="text-xs text-gray-500 mt-1">Enviando... {fileItem.progress}%</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
