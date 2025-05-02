import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { hash } from "bcryptjs"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { nome, email, cpf, senha, tipo = 0 } = body

    if (!nome || !email || !cpf || !senha) {
      return NextResponse.json({ message: "Dados incompletos" }, { status: 400 })
    }

    // Verificar se o e-mail já está em uso
    const usuarioExistente = await prisma.usuario.findFirst({
      where: {
        OR: [{ email }, { cpf }],
      },
    })

    if (usuarioExistente) {
      return NextResponse.json({ message: "E-mail ou CPF já cadastrado" }, { status: 400 })
    }

    // Hash da senha
    const senhaHash = await hash(senha, 10)

    // Criar o usuário
    const usuario = await prisma.usuario.create({
      data: {
        nome,
        email,
        cpf,
        senha: senhaHash,
        tipo,
      },
    })

    return NextResponse.json({ id: usuario.id, nome: usuario.nome, email: usuario.email }, { status: 201 })
  } catch (error) {
    console.error("Erro ao criar usuário:", error)
    return NextResponse.json({ message: "Erro ao criar usuário" }, { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.tipo !== 1) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const search = searchParams.get("search") || ""
    const page = Number.parseInt(searchParams.get("page") || "1")
    const perPage = Number.parseInt(searchParams.get("perPage") || "10")
    const tipo = searchParams.get("tipo")

    const where: any = {}

    if (search) {
      where.OR = [
        { nome: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { cpf: { contains: search } },
      ]
    }

    if (tipo) {
      where.tipo = Number.parseInt(tipo)
    }

    const usuarios = await prisma.usuario.findMany({
      where,
      select: {
        id: true,
        nome: true,
        email: true,
        cpf: true,
        tipo: true,
        createdAt: true,
        _count: {
          select: {
            formularios: true,
          },
        },
      },
      orderBy: { nome: "asc" },
      skip: (page - 1) * perPage,
      take: perPage,
    })

    const total = await prisma.usuario.count({ where })

    return NextResponse.json({
      usuarios,
      pagination: {
        total,
        page,
        perPage,
        totalPages: Math.ceil(total / perPage),
      },
    })
  } catch (error) {
    console.error("Erro ao buscar usuários:", error)
    return NextResponse.json({ message: "Erro ao buscar usuários" }, { status: 500 })
  }
}
