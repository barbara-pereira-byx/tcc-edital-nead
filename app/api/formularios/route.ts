import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// Helper function to convert string type to integer
function convertTipoToInt(tipo: string): number {
  return Number.parseInt(tipo, 10)
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

    // Verificar se editalId foi fornecido
    if (!editalId) {
      return NextResponse.json({ message: "O ID do edital é obrigatório para criar um formulário" }, { status: 400 })
    }

    // Verificar se o edital existe
    const editalExiste = await prisma.edital.findUnique({
      where: { id: editalId },
    })

    if (!editalExiste) {
      return NextResponse.json({ message: "O edital especificado não existe" }, { status: 404 })
    }

    // Criar o formulário com editalId diretamente
    const formulario = await prisma.formulario.create({
      data: {
        titulo,
        dataInicio: new Date(dataInicio),
        dataFim: new Date(dataFim),
        editalId: editalId, // Usar editalId diretamente
      },
    })

    // Criar os campos do formulário com ordem
    for (const campo of campos) {
      await prisma.campoFormulario.create({
        data: {
          rotulo: campo.nome,
          tipo: convertTipoToInt(campo.tipo),
          obrigatorio: convertBoolToInt(campo.obrigatorio),
          ordem: campo.ordem || 0, // Incluir ordem com fallback
          formularioId: formulario.id,
        },
      })
    }

    return NextResponse.json({ id: formulario.id })
  } catch (error) {
    console.error("Erro ao criar formulário:", error)
    return NextResponse.json(
      {
        message: `Erro ao criar formulário: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    )
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
        campos: {
          orderBy: {
            ordem: "asc", // Ordenar por ordem em vez de id
          },
        },
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
