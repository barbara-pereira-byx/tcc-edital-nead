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

    const editalId = params.id

    // Buscar o formulário associado ao edital
    const formulario = await prisma.formulario.findUnique({
      where: { editalId },
      include: {
        campos: {
          orderBy: {
            ordem: "asc",
          },
        },
      },
    })

    if (!formulario) {
      return NextResponse.json({ message: "Formulário não encontrado" }, { status: 404 })
    }

    return NextResponse.json(formulario)
  } catch (error) {
    console.error("Erro ao buscar formulário:", error)
    return NextResponse.json({ message: "Erro ao buscar formulário" }, { status: 500 })
  }
}