import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { hash } from "bcryptjs"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// Rota para criar um novo usuário
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    // Verificar se o usuário está autenticado e é administrador
    if (!session || session.user.tipo !== 1) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 })
    }

    const { nome, email, cpf, telefone, tipo, senha } = await req.json()

    // Validar campos obrigatórios
    if (!nome || !email || !cpf || !senha || tipo === undefined) {
      return NextResponse.json({ message: "Todos os campos obrigatórios devem ser preenchidos" }, { status: 400 })
    }

    // Verificar se já existe um usuário com o mesmo CPF ou email
    const existingUser = await prisma.usuario.findFirst({
      where: {
        OR: [{ cpf }, { email }],
      },
    })

    if (existingUser) {
      return NextResponse.json({ message: "Já existe um usuário com este CPF ou email" }, { status: 400 })
    }

    // Criar o hash da senha
    const hashedPassword = await hash(senha, 10)

    // Criar o usuário
    const usuario = await prisma.usuario.create({
      data: {
        nome,
        email,
        cpf,
        tipo,
        senha: hashedPassword,
      },
    })

    // Remover a senha do objeto retornado
    const { senha: _, ...usuarioSemSenha } = usuario

    return NextResponse.json(usuarioSemSenha, { status: 201 })
  } catch (error) {
    console.error("Erro ao criar usuário:", error)
    return NextResponse.json({ message: "Erro ao criar usuário" }, { status: 500 })
  }
}

// Rota para listar todos os usuários
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    // Verificar se o usuário está autenticado e é administrador
    if (!session || session.user.tipo !== 1) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 })
    }

    const usuarios = await prisma.usuario.findMany({
      select: {
        id: true,
        nome: true,
        email: true,
        cpf: true,
        telefone: true,
        tipo: true,
      },
      orderBy: {
        nome: "asc",
      },
    })

    return NextResponse.json(usuarios)
  } catch (error) {
    console.error("Erro ao listar usuários:", error)
    return NextResponse.json({ message: "Erro ao listar usuários" }, { status: 500 })
  }
}
