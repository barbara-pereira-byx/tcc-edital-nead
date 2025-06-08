import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const { id } = params
  console.log("Iniciando PATCH para encerrar edital, id:", id)

  try {
    // Verificar se o edital existe
    const editalExistente = await prisma.edital.findUnique({
      where: { id },
    })

    if (!editalExistente) {
      return NextResponse.json({ message: "Edital não encontrado" }, { status: 404 })
    }

    // Atualizar o edital com a data de encerramento atual
    const editalAtualizado = await prisma.edital.update({
      where: { id },
      data: {
        dataEncerramento: new Date(), // Define a data atual como data de encerramento
      },
    })

    console.log("Edital encerrado com sucesso:", editalAtualizado)

    return NextResponse.json({
      message: "Edital encerrado com sucesso",
      edital: editalAtualizado,
    })
  } catch (error) {
    console.error("Erro ao encerrar edital:", error)
    return NextResponse.json(
      {
        message: "Erro interno no servidor",
      },
      { status: 500 },
    )
  }
}
