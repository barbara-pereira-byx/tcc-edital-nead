// app/api/inscricoes/[id]/arquivos/[arquivoId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string, arquivoId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id: inscricaoId, arquivoId } = params;

    if (!inscricaoId || !arquivoId) {
      return NextResponse.json(
        { error: "ID da inscrição ou do arquivo não fornecido" },
        { status: 400 }
      );
    }

    console.log(`Buscando arquivo ${arquivoId} da inscrição ${inscricaoId}`);

    // Verificar se a inscrição existe e se o usuário tem permissão para acessá-la
    const inscricao = await prisma.formularioUsuario.findUnique({
      where: { id: inscricaoId },
    });

    if (!inscricao) {
      console.log(`Inscrição não encontrada: ${inscricaoId}`);
      return NextResponse.json({ error: "Inscrição não encontrada" }, { status: 404 });
    }

    // Verificar se o usuário tem permissão para acessar esta inscrição
    if (inscricao.usuarioId !== session.user.id && session.user.tipo !== 1) {
      console.log(`Usuário ${session.user.id} não tem permissão para acessar a inscrição ${inscricaoId}`);
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }

    // Buscar o arquivo específico
    const arquivo = await prisma.arquivoUsuario.findUnique({
      where: { 
        id: arquivoId,
        inscricaoId: inscricaoId
      }
    });

    if (!arquivo) {
      console.log(`Arquivo não encontrado: ${arquivoId}`);
      return NextResponse.json({ error: "Arquivo não encontrado" }, { status: 404 });
    }

    console.log(`Arquivo encontrado: ${arquivo.nomeOriginal}, tamanho: ${arquivo.tamanho}`);

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

    console.log(`Servindo arquivo: ${finalFilename}, tipo: ${contentType}, disposição: ${disposition}`);

    // Verificar se o arquivo.arquivo é um Buffer ou Uint8Array
    if (!arquivo.arquivo || !(arquivo.arquivo instanceof Buffer || arquivo.arquivo instanceof Uint8Array)) {
      console.error("Conteúdo do arquivo inválido:", typeof arquivo.arquivo);
      return NextResponse.json(
        { error: "Conteúdo do arquivo inválido" },
        { status: 500 }
      );
    }

    return new Response(arquivo.arquivo, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": disposition,
        "Cache-Control": "no-cache",
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