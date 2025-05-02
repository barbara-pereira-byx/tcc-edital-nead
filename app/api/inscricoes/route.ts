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

    const body = await req.json()
    const { formularioId, campos } = body

    if (!formularioId || !campos || campos.length === 0) {
      return NextResponse.json({ message: "Dados incompletos" }, { status: 400 })
    }

    // Verificar se o formulário existe
    const formulario = await prisma.formulario.findUnique({
      where: { id: formularioId },
      include: { campos: true },
    })

    if (!formulario) {
      return NextResponse.json({ message: "Formulário não encontrado" }, { status: 404 })
    }

    // Verificar se o usuário já se inscreveu neste formulário
    const inscricaoExistente = await prisma.formularioUsuario.findFirst({
      where: {
        formularioId,
        usuarioId: session.user.id,
      },
    })

    if (inscricaoExistente) {
      return NextResponse.json({ message: "Você já se inscreveu neste edital" }, { status: 400 })
    }

    // Verificar se o período de inscrições está aberto
    const hoje = new Date()
    if (hoje < formulario.dataInicio || hoje > formulario.dataFim) {
      return NextResponse.json({ message: "O período de inscrições não está aberto" }, { status: 400 })
    }

    // Verificar campos obrigatórios
    const camposObrigatorios = formulario.campos.filter((campo) => campo.obrigatorio === 1)
    const camposPreenchidos = campos.map((campo:any) => campo.campoId)

    for (const campo of camposObrigatorios) {
      if (!camposPreenchidos.includes(campo.id)) {
        return NextResponse.json({ message: `O campo "${campo.rotulo}" é obrigatório` }, { status: 400 })
      }
    }

    // Criar a inscrição
    const inscricao = await prisma.formularioUsuario.create({
      data: {
        usuarioId: session.user.id,
        formularioId,
      },
    })

    // Salvar as respostas dos campos
    for (const campo of campos) {
      await prisma.formularioUsuarioCampo.create({
        data: {
          valor: campo.valor,
          campoFormularioId: campo.campoId,
          formularioUsuarioId: inscricao.id,
        },
      })
    }

    return NextResponse.json({ id: inscricao.id }, { status: 201 })
  } catch (error) {
    console.error("Erro ao realizar inscrição:", error)
    return NextResponse.json({ message: "Erro ao realizar inscrição" }, { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const formularioId = searchParams.get("formularioId")

    const where: any = {}

    // Se for administrador e tiver um formularioId, busca todas as inscrições daquele formulário
    if (session.user.tipo === 1 && formularioId) {
      where.formularioId = formularioId
    } else {
      // Se for usuário comum, busca apenas suas inscrições
      where.usuarioId = session.user.id

      // Se tiver um formularioId, filtra por ele também
      if (formularioId) {
        where.formularioId = formularioId
      }
    }

    const inscricoes = await prisma.formularioUsuario.findMany({
      where,
      include: {
        formulario: {
          include: {
            edital: true,
          },
        },
        usuario: true,
      },
      orderBy: {
        dataHora: "desc",
      },
    })

    return NextResponse.json(inscricoes)
  } catch (error) {
    console.error("Erro ao buscar inscrições:", error)
    return NextResponse.json({ message: "Erro ao buscar inscrições" }, { status: 500 })
  }
}
