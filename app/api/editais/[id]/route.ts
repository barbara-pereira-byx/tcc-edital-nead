import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const edital = await prisma.edital.findUnique({
      where: { id: params.id },
      include: {
        formulario: {
          include: {
            campos: {
              orderBy: {
                id: "asc",
              },
            },
          },
        },
        arquivos: true,
        inscricoes: true,
      },
    })

    if (!edital) {
      return NextResponse.json({ message: "Edital não encontrado" }, { status: 404 })
    }

    return NextResponse.json(edital)
  } catch (error) {
    console.error("Erro ao buscar edital:", error)
    return NextResponse.json({ message: "Erro ao buscar edital" }, { status: 500 })
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id

  if (!id) {
    return NextResponse.json({ message: "ID do edital ausente" }, { status: 400 });
  }
  const session = await getServerSession(authOptions)

  if (!session || session.user.tipo !== 1) {
    return NextResponse.json({ message: "Não autorizado" }, { status: 401 })
  }

  const body = await req.json()
  const { codigo, titulo, senha, dataPublicacao, dataEncerramento, arquivos } = body

  if (!titulo || !dataPublicacao) {
    return NextResponse.json({ message: "Dados incompletos" }, { status: 400 })
  }

  const editalExistente = await prisma.edital.findUnique({
    where: { id: id },
    include: { arquivos: true, inscricoes: true },
  })

  if (!editalExistente) {
    return NextResponse.json({ message: "Edital não encontrado" }, { status: 404 })
  }

  const editalAtualizado = await prisma.edital.update({
    where: { id: id },
    data: {
      codigo,
      titulo,
      senha,
      dataPublicacao: new Date(dataPublicacao),
      dataEncerramento: dataEncerramento ? new Date(dataEncerramento) : null,
    },
  })

  // Obter IDs dos arquivos enviados
  const idsNovos = arquivos.map((a: { id: string }) => a.id).filter(Boolean)
  
  // Encontrar arquivos que não estão na nova lista para remover
  const arquivosParaRemover = editalExistente.arquivos.filter(
    (a) => !idsNovos.includes(a.id)
  )

  // Remover arquivos que não estão mais na lista
  if (arquivosParaRemover.length > 0) {
    await Promise.all(
      arquivosParaRemover.map((arquivo: { id: string }) =>
        prisma.arquivoEdital.delete({ where: { id: arquivo.id } })
      )
    )
  }

  // Atualizar rótulos dos arquivos existentes
  for (const arquivo of arquivos) {
    if (arquivo.id) {
      await prisma.arquivoEdital.update({
        where: { id: arquivo.id },
        data: { rotulo: arquivo.rotulo }
      })
    }
  }

  return NextResponse.json({ id: editalAtualizado.id })
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.tipo !== 1) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 })
    }

    const edital = await prisma.edital.findUnique({
      where: { id: params.id },
    })

    if (!edital) {
      return NextResponse.json({ message: "Edital não encontrado" }, { status: 404 })
    }

    await prisma.edital.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro ao excluir edital:", error)
    return NextResponse.json({ message: "Erro interno ao excluir edital" }, { status: 500 })
  }
}
