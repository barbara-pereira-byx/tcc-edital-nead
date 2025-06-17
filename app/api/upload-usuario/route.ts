// app/api/upload-usuario/route.ts
import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const campoId = formData.get("campoId") as string;
    const inscricaoId = formData.get("inscricaoId") as string;

    if (!file || !campoId || !inscricaoId) {
      return NextResponse.json({ error: "Arquivo, campoId ou inscricaoId faltando." }, { status: 400 });
    }

    // Verificar se o campo e a inscrição existem
    const campo = await prisma.formularioUsuarioCampo.findUnique({
      where: { id: campoId },
      include: { inscricao: true }
    });

    if (!campo) {
      return NextResponse.json({ error: "Campo não encontrado." }, { status: 404 });
    }

    // Verificar se a inscrição pertence ao usuário logado ou se é admin
    if (campo.inscricao.usuarioId !== session.user.id && session.user.tipo !== 1) {
      return NextResponse.json({ error: "Não autorizado a modificar esta inscrição." }, { status: 403 });
    }

    // Processar o arquivo
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Preservar o nome original do arquivo incluindo a extensão
    const nomeArquivo = file.name;
    
    // Criar o registro do arquivo
    const novoArquivo = await prisma.arquivoUsuario.create({
      data: {
        nomeOriginal: nomeArquivo,
        arquivo: buffer,
        tamanho: file.size,
        tipo: file.type,
        campoId: campoId,
        inscricaoId: inscricaoId,
      },
    });

    return NextResponse.json({
      message: "Arquivo salvo com sucesso!",
      id: novoArquivo.id,
    });

  } catch (error: any) {
    console.error("Erro ao salvar ArquivoUsuario:", error);
    return NextResponse.json({ error: error.message || "Erro interno" }, { status: 500 });
  }
}
