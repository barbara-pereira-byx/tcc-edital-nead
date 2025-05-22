import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { hash, compare } from "bcryptjs"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// Rota para atualizar o próprio perfil
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    // Verificar se o usuário está autenticado
    if (!session) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 })
    }

    // Verificar se o usuário está atualizando o próprio perfil
    if (session.user.id !== params.id) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 403 })
    }

    const { nome, email, senhaAtual, novaSenha } = await req.json()

    // Validar campos obrigatórios
    if (!nome || !email) {
      return NextResponse.json({ message: "Nome e email são obrigatórios" }, { status: 400 })
    }

    // Buscar o usuário atual
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
    }

    // Se a senha atual e nova senha foram fornecidas, verificar e atualizar
    if (senhaAtual && novaSenha) {
      // Verificar se a senha atual está correta
      const senhaCorreta = await compare(senhaAtual, usuario.senha)
      if (!senhaCorreta) {
        return NextResponse.json({ message: "Senha atual incorreta" }, { status: 400 })
      }

      // Criar hash da nova senha
      updateData.senha = await hash(novaSenha, 10)
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
        tipo: true,
      },
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error("Erro ao atualizar perfil:", error)
    return NextResponse.json({ message: "Erro ao atualizar perfil" }, { status: 500 })
  }
}
