import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    console.log(`Buscando respostas para inscrição: ${params.id}`);
    
    const session = await getServerSession(authOptions)

    if (!session) {
      console.log("Sessão não encontrada");
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 })
    }

    // Verificar se o usuário é administrador
    if (session.user.tipo !== 1) {
      console.log(`Usuário ${session.user.id} não é administrador`);
      return NextResponse.json({ message: "Apenas administradores podem acessar esta rota" }, { status: 403 })
    }

    const inscricao = await prisma.formularioUsuario.findUnique({
      where: { id: params.id },
      include: {
        formulario: {
          include: {
            edital: true,
          },
        },
      },
    })

    if (!inscricao) {
      console.log(`Inscrição não encontrada: ${params.id}`);
      return NextResponse.json({ message: "Inscrição não encontrada" }, { status: 404 })
    }

    // Buscar as respostas com os arquivos associados
    const respostas = await prisma.formularioUsuarioCampo.findMany({
      where: { formularioUsuarioId: params.id },
      include: {
        campo: true,
        arquivos: true,
      },
      orderBy: {
        campoFormularioId: "asc",
      },
    })

    console.log(`Encontradas ${respostas.length} respostas para a inscrição ${params.id}`);
    
    // Verificar se há arquivos
    let totalArquivos = 0;
    respostas.forEach(resposta => {
      if (resposta.arquivos && resposta.arquivos.length > 0) {
        totalArquivos += resposta.arquivos.length;
        console.log(`Campo ${resposta.campoFormularioId} tem ${resposta.arquivos.length} arquivos`);
      }
    });
    
    console.log(`Total de arquivos encontrados: ${totalArquivos}`);

    return NextResponse.json(respostas)
  } catch (error) {
    console.error("Erro ao buscar respostas:", error)
    return NextResponse.json({ message: "Erro ao buscar respostas" }, { status: 500 })
  }
}