import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const edital = await prisma.edital.findUnique({
      where: { id: params.id },
      include: {
        secoes: {
          include: {
            topicos: true,
          },
          orderBy: {
            id: "asc",
          },
        },
        formulario: {
          include: {
            campos: {
              orderBy: {
                id: "asc",
              },
            },
          },
        },
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

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.tipo !== 1) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 })
    }

    const body = await req.json()
    const { titulo, dataPublicacao, dataEncerramento, secoes } = body

    if (!titulo || !dataPublicacao || !secoes || secoes.length === 0) {
      return NextResponse.json({ message: "Dados incompletos" }, { status: 400 })
    }

    // Verificar se o edital existe
    const editalExistente = await prisma.edital.findUnique({
      where: { id: params.id },
      include: {
        secoes: {
          include: {
            topicos: true,
          },
        },
      },
    })

    if (!editalExistente) {
      return NextResponse.json({ message: "Edital não encontrado" }, { status: 404 })
    }

    // Atualizar o edital
    const edital = await prisma.edital.update({
      where: { id: params.id },
      data: {
        titulo,
        dataPublicacao: new Date(dataPublicacao),
        dataEncerramento: dataEncerramento ? new Date(dataEncerramento) : null,
      },
    })

    // Processar seções e tópicos
    for (const secao of secoes) {
      if (secao.id.startsWith("temp-")) {
        // Nova seção
        const secaoCriada = await prisma.secaoEdital.create({
          data: {
            titulo: secao.titulo,
            editalId: edital.id,
          },
        })

        // Criar tópicos para a nova seção
        for (const topico of secao.topicos) {
          await prisma.topicoEdital.create({
            data: {
              texto: topico.texto,
              secaoEditalId: secaoCriada.id,
            },
          })
        }
      } else {
        // Seção existente
        const secaoExistente = editalExistente.secoes.find((s) => s.id === secao.id)

        if (secaoExistente) {
          // Atualizar seção
          await prisma.secaoEdital.update({
            where: { id: secao.id },
            data: {
              titulo: secao.titulo,
            },
          })

          // Processar tópicos
          for (const topico of secao.topicos) {
            if (topico.id.startsWith("temp-")) {
              // Novo tópico
              await prisma.topicoEdital.create({
                data: {
                  texto: topico.texto,
                  secaoEditalId: secao.id,
                },
              })
            } else {
              // Tópico existente
              const topicoExistente = secaoExistente.topicos.find((t) => t.id === topico.id)

              if (topicoExistente) {
                // Atualizar tópico
                await prisma.topicoEdital.update({
                  where: { id: topico.id },
                  data: {
                    texto: topico.texto,
                  },
                })
              }
            }
          }

          // Remover tópicos que não estão mais presentes
          const topicosIds = secao.topicos.map((t) => t.id).filter((id) => !id.startsWith("temp-"))
          const topicosParaRemover = secaoExistente.topicos.filter((t) => !topicosIds.includes(t.id))

          for (const topico of topicosParaRemover) {
            await prisma.topicoEdital.delete({
              where: { id: topico.id },
            })
          }
        }
      }
    }

    // Remover seções que não estão mais presentes
    const secoesIds = secoes.map((s) => s.id).filter((id) => !id.startsWith("temp-"))
    const secoesParaRemover = editalExistente.secoes.filter((s) => !secoesIds.includes(s.id))

    for (const secao of secoesParaRemover) {
      await prisma.secaoEdital.delete({
        where: { id: secao.id },
      })
    }

    return NextResponse.json({ id: edital.id })
  } catch (error) {
    console.error("Erro ao atualizar edital:", error)
    return NextResponse.json({ message: "Erro ao atualizar edital" }, { status: 500 })
  }
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
