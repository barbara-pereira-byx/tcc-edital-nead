// components/file-attachments.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FileIcon, Download, File, FileText, FileImage } from "lucide-react";

interface FileAttachment {
  id: string;
  nomeOriginal: string;
  tipo: string;
  tamanho: number;
}

interface FileAttachmentsProps {
  campoId: string;
  inscricaoId: string;
}

export function FileAttachments({ campoId, inscricaoId }: FileAttachmentsProps) {
  const [files, setFiles] = useState<FileAttachment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await fetch(`/api/inscricoes/${inscricaoId}/arquivos?campoId=${campoId}`);
        if (response.ok) {
          const data = await response.json();
          setFiles(data);
        }
      } catch (error) {
        console.error("Erro ao buscar arquivos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFiles();
  }, [campoId, inscricaoId]);

  const getFileIcon = (tipo: string) => {
    if (tipo.startsWith("image/")) return FileImage;
    if (tipo.includes("pdf")) return FileText;
    return File;
  };

  if (loading) {
    return <div className="text-sm text-slate-500">Carregando arquivos...</div>;
  }

  if (files.length === 0) {
    return <div className="text-sm text-slate-500">Nenhum arquivo anexado</div>;
  }

  return (
    <div className="space-y-2">
      {files.map((file) => {
        const FileIconComponent = getFileIcon(file.tipo);
        
        return (
          <div
            key={file.id}
            className="flex items-center justify-between bg-slate-50 p-2 rounded-md border"
          >
            <div className="flex items-center gap-2">
              <FileIconComponent size={16} className="text-blue-500" />
              <span className="text-sm truncate max-w-[200px]">
                {file.nomeOriginal}
              </span>
              <span className="text-xs text-slate-500">
                ({(file.tamanho / 1024).toFixed(1)} KB)
              </span>
            </div>
            <a
              href={`/api/upload-usuario/${file.id}`}
              target="_blank"
              rel="noopener noreferrer"
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
        );
      })}
    </div>
  );
}
