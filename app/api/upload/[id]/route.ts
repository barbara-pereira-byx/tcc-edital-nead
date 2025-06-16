import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: "ID do arquivo não fornecido" },
        { status: 400 }
      );
    }

    const arquivo = await prisma.arquivoEdital.findUnique({
      where: { id },
      select: {
        rotulo: true,
        arquivo: true,
      },
    });

    if (!arquivo) {
      return NextResponse.json(
        { error: "Arquivo não encontrado" },
        { status: 404 }
      );
    }

    // Determinar o tipo de conteúdo com base no nome do arquivo
    const getContentType = (filename: string) => {
      const extension = filename.split('.').pop()?.toLowerCase();
      
      const mimeTypes: Record<string, string> = {
        'pdf': 'application/pdf',
        'doc': 'application/msword',
        'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'xls': 'application/vnd.ms-excel',
        'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'png': 'image/png',
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'gif': 'image/gif',
        'txt': 'text/plain',
        'zip': 'application/zip',
        'rar': 'application/x-rar-compressed',
        'ppt': 'application/vnd.ms-powerpoint',
        'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'csv': 'text/csv',
        'json': 'application/json',
        'xml': 'application/xml',
        'html': 'text/html',
        'js': 'text/javascript',
        'css': 'text/css',
      };
      
      return extension && mimeTypes[extension] 
        ? mimeTypes[extension] 
        : 'application/octet-stream';
    };

    // Extrair a extensão do nome do arquivo, se houver
    const getFileExtension = (filename: string) => {
      const parts = filename.split('.');
      return parts.length > 1 ? `.${parts.pop()}` : '';
    };

    const contentType = getContentType(arquivo.rotulo);
    const extension = getFileExtension(arquivo.rotulo);
    const sanitizedFilename = arquivo.rotulo.replace(/[^\w\s.-]/g, '_');
    
    // Garantir que o nome do arquivo tenha a extensão correta
    const finalFilename = sanitizedFilename.includes('.') 
      ? sanitizedFilename 
      : `${sanitizedFilename}${extension}`;

    return new Response(arquivo.arquivo, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${finalFilename}"`,
      },
    });
  } catch (error: any) {
    console.error("Erro ao buscar arquivo:", error);
    return NextResponse.json(
      { error: error.message || "Erro interno do servidor" },
      { status: 500 }
    );
  }
}