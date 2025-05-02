import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const formulario = await prisma.formulario.findUnique({
      where: { id: params.id },
      include: {
        campos: {
          orderBy: {
            id: "asc",
          },
        },
        edital: true,
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

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.tipo !== 1) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 })
    }

    const body = await req.json()
    const { titulo, dataInicio, dataFim, campos } = body

    if (!titulo || !dataInicio || !dataFim || !campos || campos.length === 0) {
      return NextResponse.json({ message: "Dados incompletos" }, { status: 400 })
    }

    // Verificar se o formulário existe
    const formularioExistente = await prisma.formulario.findUnique({
      where: { id: params.id },
      include: {
        campos: true,
      },
    })

    if (!formularioExistente) {
      return NextResponse.json({ message: "Formulário não encontrado" }, { status: 404 })
    }

    // Atualizar o formulário
    const formulario = await prisma.formulario.update({
      where: { id: params.id },
      data: {
        titulo,
        dataInicio: new Date(dataInicio),
        dataFim: new Date(dataFim),
      },
    })

    // Processar campos
    for (const campo of campos) {
      if (campo.id.startsWith("temp-")) {
        // Novo campo
        await prisma.campoFormulario.create({
          data: {
            rotulo: campo.rotulo,
            tipo: campo.tipo,
            obrigatorio: campo.obrigatorio,
            formularioId: formulario.id,
          },
        })
      } else {
        // Campo existente
        const campoExistente = formularioExistente.campos.find((c) => c.id === campo.id)

        if (campoExistente) {
          // Atualizar campo
          await prisma.campoFormulario.update({
            where: { id: campo.id },
            data: {
              rotulo: campo.rotulo,
              tipo: campo.tipo,
              obrigatorio: campo.obrigatorio,
            },
          })
        }
      }
    }

    // Remover campos que não estão mais presentes
    const camposIds = campos.map((c) => c.id).filter((id) => !id.startsWith("temp-"))
    const camposParaRemover = formularioExistente.campos.filter((c) => !camposIds.includes(c.id))

    for (const campo of camposParaRemover) {
      await prisma.campoFormulario.delete({
        where: { id: campo.id },
      })
    }

    return NextResponse.json({ id: formulario.id })
  } catch (error) {
    console.error("Erro ao atualizar formulário:", error)
    return NextResponse.json({ message: "Erro ao atualizar formulário" }, { status: 500 })
  }
}
