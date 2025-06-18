// app/api/inscricoes/[id]/arquivos/route.ts
import { NextRequest, NextResponse } from "next/server";
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
    console.log(`Buscando arquivos para inscrição: ${params.id}`);
    
    const session = await getServerSession(authOptions);
    if (!session) {
      console.log("Sessão não encontrada");
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
    }

    const inscricaoId = params.id;

    // Verificar se a inscrição existe e se o usuário tem permissão para acessá-la
    const inscricao = await prisma.formularioUsuario.findUnique({
      where: { id: inscricaoId },
    });

    if (!inscricao) {
      console.log(`Inscrição não encontrada: ${inscricaoId}`);
      return NextResponse.json({ message: "Inscrição não encontrada" }, { status: 404 });
    }

    // Verificar se o usuário tem permissão para acessar esta inscrição
    if (inscricao.usuarioId !== session.user.id && session.user.tipo !== 1) {
      console.log(`Usuário ${session.user.id} não tem permissão para acessar a inscrição ${inscricaoId}`);
      return NextResponse.json({ message: "Não autorizado" }, { status: 403 });
    }

    // Buscar todos os campos da inscrição com seus arquivos
    const campos = await prisma.formularioUsuarioCampo.findMany({
      where: { 
        formularioUsuarioId: inscricaoId 
      },
      include: {
        campo: true,
        arquivos: true,
      },
      orderBy: {
        campo: {
          ordem: 'asc'
        }
      }
    });

    console.log(`Encontrados ${campos.length} campos para a inscrição ${inscricaoId}`);
    
    // Verificar se há arquivos
    let totalArquivos = 0;
    
    // Adicionar URLs de download para cada arquivo
    const camposComUrls = campos.map(campo => {
      // Criar uma cópia do campo para não modificar o objeto original
      const campoComUrls = {
        ...campo,
        arquivos: campo.arquivos.map(arquivo => {
          // Adicionar URL de download e visualização para cada arquivo
          return {
            ...arquivo,
            downloadUrl: `/api/inscricoes/${inscricaoId}/arquivos/${arquivo.id}?download=true`,
            viewUrl: `/api/inscricoes/${inscricaoId}/arquivos/${arquivo.id}`
          };
        })
      };
      
      if (campoComUrls.arquivos && campoComUrls.arquivos.length > 0) {
        totalArquivos += campoComUrls.arquivos.length;
        console.log(`Campo ${campoComUrls.campoFormularioId} tem ${campoComUrls.arquivos.length} arquivos`);
      }
      
      return campoComUrls;
    });
    
    console.log(`Total de arquivos encontrados: ${totalArquivos}`);

    return NextResponse.json(camposComUrls);
  } catch (error) {
    console.error("Erro ao buscar arquivos:", error);
    return NextResponse.json({ message: "Erro ao buscar arquivos" }, { status: 500 });
  }
}