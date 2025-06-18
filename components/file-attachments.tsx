// components/file-attachments.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Eye, Download, File, FileText, FileImage, Loader2 } from "lucide-react";

interface FileAttachmentsProps {
  campoId: string;
  inscricaoId: string;
}

export function FileAttachments({ campoId, inscricaoId }: FileAttachmentsProps) {
  const [arquivos, setArquivos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function carregarArquivos() {
      try {
        setLoading(true);
        setError(null);
        
        // Buscar diretamente os arquivos do usuário
        const response = await fetch(`/api/upload-usuario/${inscricaoId}?campoId=${campoId}`);
        
        if (!response.ok) {
          throw new Error(`Erro ao buscar arquivos: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("Arquivos carregados:", data);
        setArquivos(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Erro ao carregar arquivos:", err);
        setError("Não foi possível carregar os arquivos");
      } finally {
        setLoading(false);
      }
    }
    
    carregarArquivos();
  }, [campoId, inscricaoId]);

  const getFileIcon = (tipo: string) => {
    if (!tipo) return File;
    if (tipo.startsWith("image/")) return FileImage;
    if (tipo.includes("pdf")) return FileText;
    return File;
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        Carregando arquivos...
      </div>
    );
  }

  if (error) {
    return <div className="text-sm text-red-500">{error}</div>;
  }

  if (!arquivos || arquivos.length === 0) {
    return <div className="text-sm text-slate-500">Nenhum arquivo anexado</div>;
  }

  return (
    <div className="space-y-2">
      {arquivos.map((arquivo) => {
        const FileIconComponent = getFileIcon(arquivo.tipo);
        
        return (
          <div
            key={arquivo.id}
            className="flex items-center justify-between bg-slate-50 p-2 rounded-md border"
          >
            <div className="flex items-center gap-2">
              <FileIconComponent size={16} className="text-blue-500" />
              <span className="text-sm truncate max-w-[200px]">
                {arquivo.nomeOriginal}
              </span>
              <span className="text-xs text-slate-500">
                ({Math.round(arquivo.tamanho / 1024)} KB)
              </span>
            </div>
            <div className="flex gap-2">
              <a
                href={`/api/arquivo/${arquivo.id}`}
                target="_blank"
                rel="noopener noreferrer"
                title="Visualizar"
              >
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                >
                  <Eye size={14} />
                </Button>
              </a>
              <a
                href={`/api/arquivo/${arquivo.id}?download=true`}
                target="_blank"
                rel="noopener noreferrer"
                title="Baixar"
              >
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                >
                  <Download size={14} />
                </Button>
              </a>
            </div>
          </div>
        );
      })}
    </div>
  );
}