import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import fs from "fs"
import path from "path"

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return new NextResponse("Não autorizado", { status: 401 })
    }

    // Buscar o campo do formulário que contém o arquivo
    const campo = await prisma.formularioUsuarioCampo.findUnique({
      where: { id: params.id },
      include: {
        inscricao: true,
      },
    })

    if (!campo) {
      return new NextResponse("Arquivo não encontrado", { status: 404 })
    }

    // Verificar se o usuário tem permissão para acessar o arquivo
    const isAdmin = session.user.tipo === 1
    const isOwner = campo.inscricao.usuarioId === session.user.id

    if (!isAdmin && !isOwner) {
      return new NextResponse("Não autorizado", { status: 403 })
    }

    // Buscar o arquivo associado ao campo
    const arquivo = await prisma.arquivoUsuario.findFirst({
      where: { campoId: params.id },
    })

    if (!arquivo) {
      return new NextResponse("Arquivo não encontrado", { status: 404 })
    }

    // Obter o caminho completo do arquivo
    const filePath = path.join(process.cwd(), arquivo.caminho)

    // Verificar se o arquivo existe
    if (!fs.existsSync(filePath)) {
      return new NextResponse("Arquivo não encontrado no sistema", { status: 404 })
    }

    // Ler o arquivo
    const fileBuffer = fs.readFileSync(filePath)

    // Determinar o tipo MIME com base na extensão
    const ext = path.extname(arquivo.nomeOriginal).toLowerCase()
    let contentType = "application/octet-stream"

    if (ext === ".pdf") contentType = "application/pdf"
    else if (ext === ".doc" || ext === ".docx") contentType = "application/msword"
    else if (ext === ".jpg" || ext === ".jpeg") contentType = "image/jpeg"
    else if (ext === ".png") contentType = "image/png"

    // Retornar o arquivo
    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `inline; filename="${arquivo.nomeOriginal}"`,
      },
    })
  } catch (error) {
    console.error("Erro ao buscar arquivo:", error)
    return new NextResponse("Erro ao buscar arquivo", { status: 500 })
  }
}
