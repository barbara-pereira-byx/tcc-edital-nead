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
  const { titulo, senha, dataPublicacao, dataEncerramento, arquivos } = body

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
      titulo,
      senha,
      dataPublicacao: new Date(dataPublicacao),
      dataEncerramento: dataEncerramento ? new Date(dataEncerramento) : null,
    },
  })

  const urlsNovos = arquivos.map((a: { url: string }) => a.url)
  const arquivosParaRemover = editalExistente.arquivos.filter(
    (a) => !urlsNovos.includes(a.url)
  )

  await Promise.all(
    arquivosParaRemover.map((arquivo: { id: string }) =>
      prisma.arquivoEdital.delete({ where: { id: arquivo.id } })
    )
  )

  await prisma.arquivoEdital.deleteMany({
    where: { editalId: id },
  })

  await Promise.all(
    arquivos.map((a: { url: string; rotulo: string }) =>
      prisma.arquivoEdital.create({
        data: {
          url: a.url,
          rotulo: a.rotulo,
          editalId: id,
        },
      })
    )
  )

  return NextResponse.json({ id: editalAtualizado.id })
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.tipo !== 1) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 })
    }

    // Verificar se o edital existe
    const edital = await prisma.edital.findUnique({
      where: { id: params.id },
    })

    if (!edital) {
      return NextResponse.json({ message: "Edital não encontrado" }, { status: 404 })
    }

    // Excluir o edital (as seções e tópicos serão excluídos em cascata)
    await prisma.edital.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro ao excluir edital:", error)
    return NextResponse.json({ message: "Erro ao excluir edital" }, { status: 500 })
  }
}
