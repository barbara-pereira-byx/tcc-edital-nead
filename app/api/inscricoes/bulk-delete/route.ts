import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 })
    }

    // Apenas administradores podem excluir inscrições em massa
    if (session.user.tipo !== 1) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 403 })
    }

    const { ids } = await req.json()

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ message: "IDs inválidos" }, { status: 400 })
    }

    // Primeiro, excluir os campos relacionados
    await prisma.formularioUsuarioCampo.deleteMany({
      where: {
        formularioUsuarioId: {
          in: ids,
        },
      },
    })

    // Em seguida, excluir as inscrições
    const result = await prisma.formularioUsuario.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    })

    return NextResponse.json({
      message: `${result.count} inscrições canceladas com sucesso`,
      count: result.count,
    })
  } catch (error) {
    console.error("Erro ao cancelar inscrições em massa:", error)
    return NextResponse.json({ message: "Erro ao cancelar inscrições" }, { status: 500 })
  }
}
