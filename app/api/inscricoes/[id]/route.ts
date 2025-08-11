// app/api/inscricoes/[id]/arquivos/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { registrarLogInscricao } from "@/lib/log-inscricao";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
    }

    const inscricaoId = params.id;
    const { searchParams } = new URL(request.url);
    const campoId = searchParams.get("campoId");

    if (!campoId) {
      return NextResponse.json({ message: "ID do campo não fornecido" }, { status: 400 });
    }

    // Verificar se a inscrição existe e se o usuário tem permissão para acessá-la
    const inscricao = await prisma.formularioUsuario.findUnique({
      where: { id: inscricaoId },
    });

    if (!inscricao) {
      return NextResponse.json({ message: "Inscrição não encontrada" }, { status: 404 });
    }

    // Verificar se o usuário tem permissão para acessar esta inscrição
    if (inscricao.usuarioId !== session.user.id && session.user.tipo !== 1) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 403 });
    }

    // Buscar os arquivos do campo
    const arquivos = await prisma.arquivoUsuario.findMany({
      where: {
        inscricaoId,
        campoId,
      },
      select: {
        id: true,
        nomeOriginal: true,
        tipo: true,
        tamanho: true,
      },
    });

    return NextResponse.json(arquivos);
  } catch (error) {
    console.error("Erro ao buscar arquivos:", error);
    return NextResponse.json({ message: "Erro ao buscar arquivos" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 })
    }

    const { observacao } = await req.json().catch(() => ({ observacao: null }))
    const inscricao = await prisma.formularioUsuario.findUnique({
      where: {
        id: params.id,
      },
      include: {
        formulario: {
          include: {
            edital: true,
          },
        },
        usuario: true,
      },
    })
    if (!inscricao) {
      return NextResponse.json({ message: "Inscrição não encontrada" }, { status: 404 })
    }

    if (inscricao.usuarioId !== session.user.id && session.user.tipo !== 1) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 })
    }

    const hoje = new Date()
    const dataFim = inscricao.formulario.dataFim ? new Date(inscricao.formulario.dataFim) : null

    if (!dataFim || hoje > dataFim) {
      return NextResponse.json(
        { message: "O período de inscrições já foi encerrado, não é possível cancelar" },
        { status: 400 }
      )
    }

    const updatedInscricao = await prisma.formularioUsuario.update({
      where: { id: params.id },
      data: {
        status: "CANCELADO",
        observacaoCancelamento: observacao || null,
      },
    })

    // Registrar log de cancelamento
    const acao = inscricao.usuarioId === session.user.id ? "CANCELAMENTO_USUARIO" : "CANCELAMENTO_ADMIN"
    await registrarLogInscricao({
      usuarioInscricaoId: inscricao.usuario.id,
      usuarioInscricaoCpf: inscricao.usuario.cpf,
      usuarioInscricaoNome: inscricao.usuario.nome,
      usuarioAcaoId: session.user.id,
      usuarioAcaoCpf: session.user.cpf,
      usuarioAcaoNome: session.user.nome,
      acao,
      editalTitulo: inscricao.formulario.edital?.titulo,
      editalCodigo: inscricao.formulario.edital?.codigo,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro ao cancelar inscrição:", error)
    return NextResponse.json({ message: "Erro ao cancelar inscrição" }, { status: 500 })
  }
}