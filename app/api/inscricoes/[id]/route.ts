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
      where: {
        id: params.id,
      },
      include: {
        formulario: {
          include: {
            edital: true,
          },
        },
        campos: {
          include: {
            campo: true,
          },
        },
        usuario: true,
      },
    })

    if (!inscricao) {
      return NextResponse.json({ message: "Inscrição não encontrada" }, { status: 404 })
    }

    // Verificar se o usuário tem permissão para acessar esta inscrição
    if (inscricao.usuarioId !== session.user.id && session.user.tipo !== 1) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 })
    }

    return NextResponse.json(inscricao)
  } catch (error) {
    console.error("Erro ao buscar inscrição:", error)
    return NextResponse.json({ message: "Erro ao buscar inscrição" }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 })
    }

    const inscricao = await prisma.formularioUsuario.findUnique({
      where: {
        id: params.id,
      },
      include: {
        formulario: true,
      },
    })

    if (!inscricao) {
      return NextResponse.json({ message: "Inscrição não encontrada" }, { status: 404 })
    }

    // Verificar se o usuário tem permissão para cancelar esta inscrição
    if (inscricao.usuarioId !== session.user.id && session.user.tipo !== 1) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 })
    }

    // Verificar se o período de inscrições ainda está aberto
    const hoje = new Date()
    const dataFim = inscricao.formulario.dataFim ? new Date(inscricao.formulario.dataFim) : null

    if (!dataFim || hoje > dataFim) {
      return NextResponse.json(
        { message: "O período de inscrições já foi encerrado, não é possível cancelar" },
        { status: 400 },
      )
    }

    // Excluir as respostas dos campos
    await prisma.formularioUsuarioCampo.deleteMany({
      where: {
        formularioUsuarioId: params.id,
      },
    })

    // Excluir a inscrição
    await prisma.formularioUsuario.delete({
      where: {
        id: params.id,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro ao cancelar inscrição:", error)
    return NextResponse.json({ message: "Erro ao cancelar inscrição" }, { status: 500 })
  }
}
