// app/api/inscricoes/[id]/arquivos/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
    const inscricao = await prisma.formularioUsuario.findUnique({
      where: {
        id: params.id,
      },
      include: {
        formulario: true,
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

    await prisma.formularioUsuario.update({
      where: { id: params.id },
      data: {
        status: "CANCELADO" as any,
      },
    })


    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro ao cancelar inscrição:", error)
    return NextResponse.json({ message: "Erro ao cancelar inscrição" }, { status: 500 })
  }
}