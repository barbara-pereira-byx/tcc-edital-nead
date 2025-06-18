// app/api/upload-usuario/[id]/route.ts
import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const inscricaoId = params.id;
    const { searchParams } = new URL(request.url);
    const campoId = searchParams.get('campoId');

    // Verificar se a inscrição existe
    const inscricao = await prisma.formularioUsuario.findUnique({
      where: { id: inscricaoId },
    });

    if (!inscricao) {
      return NextResponse.json({ error: "Inscrição não encontrada" }, { status: 404 });
    }

    // Verificar se o usuário tem permissão para acessar esta inscrição
    if (inscricao.usuarioId !== session.user.id && session.user.tipo !== 1) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }

    // Buscar arquivos
    const query = {
      where: {
        inscricaoId: inscricaoId,
        ...(campoId ? { campoId: campoId } : {})
      },
      orderBy: {
        createdAt: 'desc'
      }
    };

    const arquivos = await prisma.arquivoUsuario.findMany(query);

    return NextResponse.json(arquivos);
  } catch (error: any) {
    console.error("Erro ao buscar arquivos:", error);
    return NextResponse.json(
      { error: error.message || "Erro interno do servidor" },
      { status: 500 }
    );
  }
}