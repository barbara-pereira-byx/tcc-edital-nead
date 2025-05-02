import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.tipo !== 1) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 })
    }

    const body = await req.json()
    const { titulo, dataPublicacao, dataEncerramento, secoes } = body

    if (!titulo || !dataPublicacao || !secoes || secoes.length === 0) {
      return NextResponse.json({ message: "Dados incompletos" }, { status: 400 })
    }

    // Criar o edital
    const edital = await prisma.edital.create({
      data: {
        titulo,
        dataPublicacao: new Date(dataPublicacao),
        dataEncerramento: dataEncerramento ? new Date(dataEncerramento) : null,
      },
    })

    // Criar as seções e tópicos
    for (const secao of secoes) {
      const secaoCriada = await prisma.secaoEdital.create({
        data: {
          titulo: secao.titulo,
          editalId: edital.id,
        },
      })

      for (const topico of secao.topicos) {
        await prisma.topicoEdital.create({
          data: {
            texto: topico.texto,
            secaoEditalId: secaoCriada.id,
          },
        })
      }
    }

    return NextResponse.json({ id: edital.id }, { status: 201 })
  } catch (error) {
    console.error("Erro ao criar edital:", error)
    return NextResponse.json({ message: "Erro ao criar edital" }, { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const search = searchParams.get("search") || ""
    const page = Number.parseInt(searchParams.get("page") || "1")
    const perPage = Number.parseInt(searchParams.get("perPage") || "10")
    const status = searchParams.get("status")

    const hoje = new Date()
    const where: any = {}

    if (search) {
      where.OR = [
        { titulo: { contains: search, mode: "insensitive" } },
        {
          secoes: {
            some: {
              titulo: { contains: search, mode: "insensitive" },
            },
          },
        },
      ]
    }

    if (status === "abertos") {
      where.formulario = {
        NOT: null,
        dataInicio: { lte: hoje },
        dataFim: { gte: hoje },
      }
    }

    if (status === "futuros") {
      where.formulario = {
        NOT: null,
        dataInicio: { gt: hoje },
      }
    }

    if (status === "encerrados") {
      where.OR = [
        {
          formulario: {
            NOT: null,
            dataFim: { lt: hoje },
          },
        },
        {
          formulario: null,
          dataEncerramento: { lt: hoje },
        },
      ]
    }

    const editais = await prisma.edital.findMany({
      where,
      orderBy: { dataPublicacao: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
      include: {
        formulario: true,
      },
    })

    const total = await prisma.edital.count({ where })

    return NextResponse.json({
      editais,
      pagination: {
        total,
        page,
        perPage,
        totalPages: Math.ceil(total / perPage),
      },
    })
  } catch (error) {
    console.error("Erro ao buscar editais:", error)
    return NextResponse.json({ message: "Erro ao buscar editais" }, { status: 500 })
  }
}

