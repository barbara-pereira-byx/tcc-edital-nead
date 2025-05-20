import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const edital = await prisma.edital.findUnique({
      where: { id: params.id },
      include: {
        secoes: {
          include: {
            topicos: true,
          },
          orderBy: {
            id: "asc",
          },
        },
        formulario: {
          include: {
            campos: {
              orderBy: {
                id: "asc",
              },
            },
          },
        },
      },
    })

    if (!edital) {
      return NextResponse.json({ message: "Edital não encontrado" }, { status: 404 })
    }

    return NextResponse.json(edital)
  } catch (error) {
    console.error("Erro ao buscar edital:", error)
    return NextResponse.json({ message: "Erro ao buscar edital" }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.tipo !== 1) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 })
    }

    const body = await req.json()
    const { titulo, dataPublicacao, dataEncerramento } = body

    if (!titulo || !dataPublicacao) {
      return NextResponse.json({ message: "Dados incompletos" }, { status: 400 })
    }

    // Verificar se o edital existe
    const editalExistente = await prisma.edital.findUnique({
      where: { id: params.id },
      include: {
        secoes: {
          include: {
            topicos: true,
          },
        },
      },
    })

    if (!editalExistente) {
      return NextResponse.json({ message: "Edital não encontrado" }, { status: 404 })
    }

    // Atualizar o edital
    const edital = await prisma.edital.update({
      where: { id: params.id },
      data: {
        titulo,
        dataPublicacao: new Date(dataPublicacao),
        dataEncerramento: dataEncerramento ? new Date(dataEncerramento) : null,
      },
    })

    return NextResponse.json({ id: edital.id })
  } catch (error) {
    console.error("Erro ao atualizar edital:", error)
    return NextResponse.json({ message: "Erro ao atualizar edital" }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.tipo !== 1) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 })
    }

    // Verificar se o edital existe
    const edital = await prisma.edital.findUnique({
      where: { id: params.id },
    })

    if (!edital) {
      return NextResponse.json({ message: "Edital não encontrado" }, { status: 404 })
    }

    // Excluir o edital (as seções e tópicos serão excluídos em cascata)
    await prisma.edital.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro ao excluir edital:", error)
    return NextResponse.json({ message: "Erro ao excluir edital" }, { status: 500 })
  }
}
