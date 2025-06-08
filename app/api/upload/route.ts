import { type NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

// Função para verificar se estamos em produção e se o Vercel Blob está disponível
const isVercelBlobAvailable = () => {
  const hasToken = !!process.env.BLOB_READ_WRITE_TOKEN;
  const isProd = process.env.NODE_ENV === "production";
  console.log(`Verificando disponibilidade do Vercel Blob - Token disponível: ${hasToken}, Ambiente: ${process.env.NODE_ENV}`);
  return hasToken && isProd;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const label = formData.get("label") as string;

    if (!file) {
      return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 });
    }

    // Validar tipo de arquivo
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "image/jpeg",
      "image/png",
      "image/gif",
      "text/plain",
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Tipo de arquivo não permitido" }, { status: 400 });
    }

    // Validar tamanho do arquivo (máximo 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: "Arquivo muito grande. Máximo 10MB permitido." }, { status: 400 });
    }

    // Gerar nome de arquivo único
    const timestamp = Date.now();
    const originalName = file.name.replace(/\s+/g, "-").toLowerCase();
    const fileName = `${timestamp}-${originalName}`;

    // Usar sistema de arquivos local para todos os ambientes temporariamente
    // até resolver o problema com o Vercel Blob
    console.log("Usando sistema de arquivos local para upload");
    
    // Criar diretório de uploads se não existir
    const uploadDir = join(process.cwd(), "public", "uploads");
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    const filePath = join(uploadDir, fileName);
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    await writeFile(filePath, buffer);

    // Em produção, os arquivos estáticos são servidos da pasta .next/static
    const relativePath = `/uploads/${fileName}`;
    
    return NextResponse.json({
      url: relativePath,
      label: label,
      fileName: file.name,
    });
  } catch (error) {
    console.error("Erro ao fazer upload do arquivo:", error);
    return NextResponse.json({ error: "Falha ao processar o upload do arquivo" }, { status: 500 });
  }
}

// Configuração para o limite de tamanho do corpo da requisição
export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Tempo máximo em segundos
export const runtime = 'nodejs';