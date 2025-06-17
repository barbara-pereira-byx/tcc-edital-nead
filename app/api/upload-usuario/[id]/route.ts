// app/api/upload-usuario/[id]/route.ts
import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: "ID do arquivo não fornecido" },
        { status: 400 }
      );
    }

    const arquivo = await prisma.arquivoUsuario.findUnique({
      where: { id },
      include: {
        inscricao: true,
      },
    });

    if (!arquivo) {
      return NextResponse.json(
        { error: "Arquivo não encontrado" },
        { status: 404 }
      );
    }

    // Verificar se o usuário tem permissão para acessar este arquivo
    if (arquivo.inscricao.usuarioId !== session.user.id && session.user.tipo !== 1) {
      return NextResponse.json(
        { error: "Não autorizado a acessar este arquivo" },
        { status: 403 }
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

    const contentType = getContentType(arquivo.nomeOriginal);
    const extension = getFileExtension(arquivo.nomeOriginal);
    const sanitizedFilename = arquivo.nomeOriginal.replace(/[^\w\s.-]/g, '_');
    
    // Garantir que o nome do arquivo tenha a extensão correta
    const finalFilename = sanitizedFilename.includes('.') 
      ? sanitizedFilename 
      : `${sanitizedFilename}${extension}`;

    // Verificar se é para download ou visualização
    const { searchParams } = new URL(request.url);
    const isDownload = searchParams.has('download');
    
    // Definir o Content-Disposition com base no parâmetro
    const disposition = isDownload 
      ? `attachment; filename="${finalFilename}"` 
      : `inline; filename="${finalFilename}"`;

    return new Response(arquivo.arquivo, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": disposition,
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
