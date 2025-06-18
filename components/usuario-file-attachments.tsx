"use client"

import { useEffect, useState } from "react"
import { UsuarioArquivoDownloadButton } from "./usuario-arquivo-download-button"
import { Loader2 } from "lucide-react"

interface Arquivo {
  id: string
  nomeOriginal: string
  tamanho: number
  tipo: string
  downloadUrl: string
  viewUrl: string
}

interface Campo {
  id: string
  campoFormularioId: string
  campo: {
    id: string
    rotulo: string
    tipo: number
  }
  arquivos: Arquivo[]
}

interface UsuarioFileAttachmentsProps {
  inscricaoId: string
}

export function UsuarioFileAttachments({ inscricaoId }: UsuarioFileAttachmentsProps) {
  const [campos, setCampos] = useState<Campo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchArquivos = async () => {
      setIsLoading(true)
      setError(null)
      
      try {
        const response = await fetch(`/api/inscricoes/${inscricaoId}/arquivos`)
        
        if (!response.ok) {
          throw new Error(`Erro ao buscar arquivos: ${response.statusText}`)
        }
        
        const data = await response.json()
        setCampos(data)
      } catch (err) {
        console.error("Erro ao buscar arquivos:", err)
        setError("Não foi possível carregar os arquivos. Tente novamente mais tarde.")
      } finally {
        setIsLoading(false)
      }
    }
    
    if (inscricaoId) {
      fetchArquivos()
    }
  }, [inscricaoId])

  // Filtrar apenas campos que têm arquivos
  const camposComArquivos = campos.filter(campo => campo.arquivos && campo.arquivos.length > 0)
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-4">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">Carregando arquivos...</span>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="p-4 border border-red-300 bg-red-50 text-red-700 rounded-md">
        {error}
      </div>
    )
  }
  
  if (camposComArquivos.length === 0) {
    return (
      <div className="p-4 text-gray-500 italic">
        Nenhum arquivo anexado.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {camposComArquivos.map((campo) => (
        <div key={campo.id} className="border rounded-md p-4">
          <h3 className="font-medium mb-2">{campo.campo.rotulo}</h3>
          <div className="space-y-2">
            {campo.arquivos.map((arquivo) => (
              <div key={arquivo.id} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                <div className="truncate flex-1">
                  <span className="text-sm">{arquivo.nomeOriginal}</span>
                  <span className="text-xs text-gray-500 ml-2">
                    ({(arquivo.tamanho / 1024).toFixed(2)} KB)
                  </span>
                </div>
                <div className="flex space-x-2 ml-4">
                  <UsuarioArquivoDownloadButton 
                    inscricaoId={inscricaoId} 
                    arquivoId={arquivo.id} 
                  />
                  <UsuarioArquivoDownloadButton 
                    inscricaoId={inscricaoId} 
                    arquivoId={arquivo.id} 
                    isDownload 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}