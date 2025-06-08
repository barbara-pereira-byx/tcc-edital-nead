import { type NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"

// Função para verificar se estamos em produção e se o Vercel Blob está disponível
const isVercelBlobAvailable = () => {
  return process.env.BLOB_READ_WRITE_TOKEN && process.env.NODE_ENV === "production"
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const label = formData.get("label") as string

    if (!file) {
      return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 })
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
    ]

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Tipo de arquivo não permitido" }, { status: 400 })
    }

    // Validar tamanho do arquivo (máximo 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: "Arquivo muito grande. Máximo 10MB permitido." }, { status: 400 })
    }

    // Gerar nome de arquivo único
    const timestamp = Date.now()
    const originalName = file.name.replace(/\s+/g, "-").toLowerCase()
    const fileName = `${timestamp}-${originalName}`

    // Verificar se deve usar Vercel Blob ou sistema de arquivos local
    if (isVercelBlobAvailable()) {
      // Usar Vercel Blob em produção
      const { put } = await import("@vercel/blob")

      const blob = await put(`editais/${fileName}`, file, {
        access: "public",
      })

      return NextResponse.json({
        url: blob.url,
        label: label,
        fileName: file.name,
      })
    } else {
      // Usar sistema de arquivos local em desenvolvimento
      const uploadDir = join(process.cwd(), "public", "uploads")
      if (!existsSync(uploadDir)) {
        await mkdir(uploadDir, { recursive: true })
      }

      const filePath = join(uploadDir, fileName)
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      await writeFile(filePath, buffer)

      const relativePath = `/uploads/${fileName}`

      return NextResponse.json({
        url: relativePath,
        label: label,
        fileName: file.name,
      })
    }
  } catch (error) {
    console.error("Erro ao fazer upload do arquivo:", error)
    return NextResponse.json({ error: "Falha ao processar o upload do arquivo" }, { status: 500 })
  }
}
