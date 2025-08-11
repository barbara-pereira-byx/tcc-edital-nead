import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { registrarLogInscricao } from "@/lib/log-inscricao"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 })
    }

    // Apenas administradores podem excluir inscrições em massa
    if (session.user.tipo !== 1) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 403 })
    }

    const { ids, observacao } = await req.json()

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ message: "IDs inválidos" }, { status: 400 })
    }

    // Buscar as inscrições antes de cancelar para registrar logs
    const inscricoes = await prisma.formularioUsuario.findMany({
      where: {
        id: {
          in: ids,
        },
      },
      include: {
        usuario: true,
        formulario: {
          include: {
            edital: true,
          },
        },
      },
    })

    // Atualizar status para CANCELADO ao invés de deletar
    const result = await prisma.formularioUsuario.updateMany({
      where: {
        id: {
          in: ids,
        },
      },
      data: {
        status: "CANCELADO",
        observacaoCancelamento: observacao || null,
      },
    })

    // Registrar logs para cada inscrição cancelada
    for (const inscricao of inscricoes) {
      await registrarLogInscricao({
        usuarioInscricaoId: inscricao.usuario.id,
        usuarioInscricaoCpf: inscricao.usuario.cpf,
        usuarioInscricaoNome: inscricao.usuario.nome,
        usuarioAcaoId: session.user.id,
        usuarioAcaoCpf: session.user.cpf,
        usuarioAcaoNome: session.user.nome,
        acao: "CANCELAMENTO_ADMIN",
        editalTitulo: inscricao.formulario.edital?.titulo,
        editalCodigo: inscricao.formulario.edital?.codigo,
      })
    }

    return NextResponse.json({
      message: `${result.count} inscrições canceladas com sucesso`,
      count: result.count,
    })
  } catch (error) {
    console.error("Erro ao cancelar inscrições em massa:", error)
    return NextResponse.json({ message: "Erro ao cancelar inscrições" }, { status: 500 })
  }
}
