import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const formulario = await prisma.formulario.findUnique({
      where: { id: params.id },
      include: {
        campos: {
          orderBy: {
            ordem: "asc", // Ordenar por ordem em vez de id
          },
        },
        edital: true,
      },
    })

    if (!formulario) {
      return NextResponse.json({ message: "Formulário não encontrado" }, { status: 404 })
    }

    return NextResponse.json(formulario)
  } catch (error) {
    console.error("Erro ao buscar formulário:", error)
    return NextResponse.json({ message: "Erro ao buscar formulário" }, { status: 500 })
  }
}

// Adicione logs mais detalhados na rota de atualização
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    console.log(`Iniciando atualização do formulário ID: ${params.id}`)
    const session = await getServerSession(authOptions)

    if (!session || session.user.tipo !== 1) {
      console.log("Usuário não autorizado")
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 })
    }

    const body = await req.json()
    console.log(`Dados recebidos para atualização:`, {
      titulo: body.titulo,
      dataInicio: body.dataInicio,
      dataFim: body.dataFim,
      camposCount: body.campos?.length || 0,
    })

    const { titulo, dataInicio, dataFim, campos } = body

    if (!titulo || !dataInicio || !dataFim || !campos || campos.length === 0) {
      console.log("Dados incompletos para atualização")
      return NextResponse.json({ message: "Dados incompletos" }, { status: 400 })
    }

    // Verificar se o formulário existe
    console.log(`Verificando se o formulário ID: ${params.id} existe`)
    const formularioExistente = await prisma.formulario.findUnique({
      where: { id: params.id },
      include: {
        campos: true,
      },
    })

    if (!formularioExistente) {
      console.log(`Formulário ID: ${params.id} não encontrado`)
      return NextResponse.json({ message: "Formulário não encontrado" }, { status: 404 })
    }

    console.log(`Formulário ID: ${params.id} encontrado, atualizando...`)
    // Atualizar o formulário
    const formulario = await prisma.formulario.update({
      where: { id: params.id },
      data: {
        titulo,
        dataInicio: new Date(dataInicio),
        dataFim: new Date(dataFim),
      },
    })

    console.log(`Formulário base atualizado, processando ${campos.length} campos...`)
    // Processar campos considerando a ordem
    for (const campo of campos) {
      if (campo.id.startsWith("temp-")) {
        // Novo campo
        console.log(`Criando novo campo: ${campo.rotulo}`)
        await prisma.campoFormulario.create({
          data: {
            rotulo: campo.rotulo,
            tipo: campo.tipo,
            obrigatorio: campo.obrigatorio,
            ordem: campo.ordem, // Incluir ordem
            formularioId: formulario.id,
          },
        })
      } else {
        // Campo existente
        const campoExistente = formularioExistente.campos.find((c) => c.id === campo.id)

        if (campoExistente) {
          // Atualizar campo incluindo a ordem
          console.log(`Atualizando campo existente ID: ${campo.id}`)
          await prisma.campoFormulario.update({
            where: { id: campo.id },
            data: {
              rotulo: campo.rotulo,
              tipo: campo.tipo,
              obrigatorio: campo.obrigatorio,
              ordem: campo.ordem, // Atualizar ordem
            },
          })
        } else {
          console.log(`Campo ID: ${campo.id} não encontrado, criando como novo`)
          // Campo com ID não-temp mas que não existe no banco - criar como novo
          await prisma.campoFormulario.create({
            data: {
              rotulo: campo.rotulo,
              tipo: campo.tipo,
              obrigatorio: campo.obrigatorio,
              ordem: campo.ordem,
              formularioId: formulario.id,
            },
          })
        }
      }
    }

    // Remover campos que não estão mais presentes
    const camposIds = campos.map((c: any) => c.id).filter((id: any) => !id.startsWith("temp-"))
    const camposParaRemover = formularioExistente.campos.filter((c) => !camposIds.includes(c.id))

    console.log(`Removendo ${camposParaRemover.length} campos que não estão mais presentes`)
    for (const campo of camposParaRemover) {
      await prisma.campoFormulario.delete({
        where: { id: campo.id },
      })
    }

    console.log(`Atualização do formulário ID: ${params.id} concluída com sucesso`)
    return NextResponse.json({ id: formulario.id })
  } catch (error) {
    console.error("Erro ao atualizar formulário:", error)
    return NextResponse.json(
      {
        message: "Erro ao atualizar formulário",
        error: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 },
    )
  }
}
