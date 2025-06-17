import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 })
    }

    const inscricao = await prisma.formularioUsuario.findUnique({
      where: { id: params.id },
      include: {
        formulario: {
          include: {
            edital: true,
          },
        },
      },
    })

    if (!inscricao) {
      return NextResponse.json({ message: "Inscrição não encontrada" }, { status: 404 })
    }

    // Verificar se o usuário tem permissão para ver esta inscrição
    const isAdmin = session.user.tipo === 1
    const isOwner = inscricao.usuarioId === session.user.id
    const hasPassword = req.headers.get("x-edital-password") === inscricao.formulario.edital.senha

    if (!isAdmin && !isOwner && !hasPassword) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 403 })
    }

    // Buscar as respostas com os arquivos associados
    const respostas = await prisma.formularioUsuarioCampo.findMany({
      where: { formularioUsuarioId: params.id },
      include: {
        campo: true,
        arquivos: true,
      },
      orderBy: {
        campoFormularioId: "asc",
      },
    })

    return NextResponse.json(respostas)
  } catch (error) {
    console.error("Erro ao buscar respostas:", error)
    return NextResponse.json({ message: "Erro ao buscar respostas" }, { status: 500 })
  }
}
