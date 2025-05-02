import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// Helper function to convert string type to integer
function convertTipoToInt(tipo: string): number {
  return parseInt(tipo, 10)
}

// Helper function to convert boolean to integer (0/1)
function convertBoolToInt(value: boolean): number {
  return value ? 1 : 0
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.tipo !== 1) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 })
    }

    const body = await req.json()
    const { titulo, dataInicio, dataFim, campos, editalId } = body

    if (!titulo || !dataInicio || !dataFim || !campos || campos.length === 0) {
      return NextResponse.json({ message: "Dados incompletos" }, { status: 400 })
    }

    // Criar o formulário
    const formulario = await prisma.formulario.create({
      data: {
        titulo,
        dataInicio: new Date(dataInicio),
        dataFim: new Date(dataFim),
        ...(editalId && {
          edital: {
            connect: {
              id: editalId,
            },
          },
        }),
      },
    })

    // Criar os campos do formulário
    for (const campo of campos) {
      await prisma.campoFormulario.create({
        data: {
          rotulo: campo.nome,
          tipo: convertTipoToInt(campo.tipo),
          obrigatorio: convertBoolToInt(campo.obrigatorio),
          formularioId: formulario.id,
          // Adicionar metadados como JSON se necessário
          metadados: {
            categoria: campo.categoria,
            tamanho: campo.tamanho,
            opcoes: campo.opcoes,
          },
        },
      })
    }

    return NextResponse.json({ id: formulario.id })
  } catch (error) {
    console.error("Erro ao criar formulário:", error)
    return NextResponse.json({ message: "Erro ao criar formulário" }, { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 })
    }

    const formularios = await prisma.formulario.findMany({
      include: {
        campos: true,
        edital: {
          select: {
            id: true,
            titulo: true,
          },
        },
      },
      orderBy: {
        dataInicio: "desc",
      },
    })

    return NextResponse.json(formularios)
  } catch (error) {
    console.error("Erro ao buscar formulários:", error)
    return NextResponse.json({ message: "Erro ao buscar formulários" }, { status: 500 })
  }
}
