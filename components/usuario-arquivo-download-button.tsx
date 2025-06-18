"use client"

import { useState } from "react"
import { Eye, Download, Loader2 } from "lucide-react"

interface UsuarioArquivoDownloadButtonProps {
  inscricaoId: string
  arquivoId: string
  isDownload?: boolean
}

export function UsuarioArquivoDownloadButton({ inscricaoId, arquivoId, isDownload = false }: UsuarioArquivoDownloadButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  
  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      console.log(`${isDownload ? 'Baixando' : 'Visualizando'} arquivo: ${arquivoId}`)
      
      // Abrir em uma nova aba
      const url = `/api/inscricoes/${inscricaoId}/arquivos/${arquivoId}${isDownload ? '?download=true' : ''}`
      window.open(url, '_blank')
    } catch (error) {
      console.error(`Erro ao ${isDownload ? 'baixar' : 'visualizar'} arquivo:`, error)
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <a 
      href={`/api/inscricoes/${inscricaoId}/arquivos/${arquivoId}${isDownload ? '?download=true' : ''}`}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 px-2"
      title={isDownload ? "Baixar" : "Visualizar"}
      onClick={handleClick}
      download={isDownload}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isDownload ? (
        <Download className="h-4 w-4" />
      ) : (
        <Eye className="h-4 w-4" />
      )}
    </a>
  )
}