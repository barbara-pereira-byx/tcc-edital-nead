import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { hash } from "bcryptjs"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// Rota para buscar um usuário específico
export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    // Verificar se o usuário está autenticado
    if (!session) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 })
    }

    // Verificar se o usuário é administrador ou está buscando o próprio perfil
    if (session.user.tipo !== 1 && session.user.id !== params.id) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 403 })
    }

    const usuario = await prisma.usuario.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        nome: true,
        email: true,
        cpf: true,
        telefone: true,
        tipo: true,
      },
    })

    if (!usuario) {
      return NextResponse.json({ message: "Usuário não encontrado" }, { status: 404 })
    }

    return NextResponse.json(usuario)
  } catch (error) {
    console.error("Erro ao buscar usuário:", error)
    return NextResponse.json({ message: "Erro ao buscar usuário" }, { status: 500 })
  }
}

// Rota para atualizar um usuário
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    // Verificar se o usuário está autenticado e é administrador
    if (!session || session.user.tipo !== 1) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 })
    }

    const { nome, email, telefone, tipo, senha } = await req.json()

    // Validar campos obrigatórios
    if (!nome || !email || tipo === undefined) {
      return NextResponse.json({ message: "Todos os campos obrigatórios devem ser preenchidos" }, { status: 400 })
    }

    // Verificar se o usuário existe
    const usuario = await prisma.usuario.findUnique({
      where: { id: params.id },
    })

    if (!usuario) {
      return NextResponse.json({ message: "Usuário não encontrado" }, { status: 404 })
    }

    // Verificar se o email já está em uso por outro usuário
    const existingUser = await prisma.usuario.findFirst({
      where: {
        email,
        id: { not: params.id },
      },
    })

    if (existingUser) {
      return NextResponse.json({ message: "Este email já está em uso por outro usuário" }, { status: 400 })
    }

    // Preparar dados para atualização
    const updateData: any = {
      nome,
      email,
      telefone,
      tipo,
    }

    // Se a senha foi fornecida, criar o hash
    if (senha) {
      updateData.senha = await hash(senha, 10)
    }

    // Atualizar o usuário
    const updatedUser = await prisma.usuario.update({
      where: { id: params.id },
      data: updateData,
      select: {
        id: true,
        nome: true,
        email: true,
        cpf: true,
        telefone: true,
        tipo: true,
      },
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error)
    return NextResponse.json({ message: "Erro ao atualizar usuário" }, { status: 500 })
  }
}

// Rota para excluir um usuário
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    const userId = params.id

    // Verificar se o usuário está autenticado
    if (!session) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 })
    }

    // Verificar se o usuário é administrador ou está excluindo a própria conta
    if (session.user.tipo !== 1 && session.user.id !== userId) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 403 })
    }

    // Verificar se o usuário existe
    const usuario = await prisma.usuario.findUnique({
      where: { id: userId },
    })

    if (!usuario) {
      return NextResponse.json({ message: "Usuário não encontrado" }, { status: 404 })
    }

    // Primeiro, buscar todas as inscrições do usuário
    const inscricoes = await prisma.formularioUsuario.findMany({
      where: { usuarioId: userId },
      select: { id: true },
    })

    const inscricoesIds = inscricoes.map((inscricao) => inscricao.id)

    // Excluir os campos das inscrições, se houver inscrições
    if (inscricoesIds.length > 0) {
      await prisma.formularioUsuarioCampo.deleteMany({
        where: {
          formularioUsuarioId: {
            in: inscricoesIds,
          },
        },
      })
    }

    // Excluir as inscrições do usuário
    await prisma.formularioUsuario.deleteMany({
      where: {
        usuarioId: userId,
      },
    })

    // Excluir o usuário
    await prisma.usuario.delete({
      where: { id: userId },
    })

    return NextResponse.json({ message: "Usuário excluído com sucesso" })
  } catch (error) {
    console.error("Erro ao excluir usuário:", error)
    return NextResponse.json({ message: "Erro ao excluir usuário" }, { status: 500 })
  }
}
