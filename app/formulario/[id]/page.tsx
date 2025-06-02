import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const formulario = await prisma.formulario.findUnique({
      where: { id: params.id },
      include: {
        campos: {
          orderBy: {
            id: "asc",
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

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const { titulo, dataInicio, dataFim, campos } = body;

    // Atualizar o formulário
    await prisma.formulario.update({
      where: { id: params.id },
      data: {
        titulo,
      },
    });

    // Atualizar os campos
    for (const campo of campos) {
      await prisma.campoFormulario.upsert({
        where: { id: campo.id },
        update: {
          rotulo: campo.rotulo,
          tipo: campo.tipo,
          obrigatorio: campo.obrigatorio,
          ordem: campo.ordem,
        },
        create: {
          id: campo.id,
          rotulo: campo.rotulo,
          tipo: campo.tipo,
          obrigatorio: campo.obrigatorio,
          ordem: campo.ordem,
          formularioId: params.id,
        },
      });
    }

    return NextResponse.json({ message: "Formulário atualizado com sucesso" });
  } catch (error) {
    console.error("Erro ao atualizar formulário:", error);
    return NextResponse.json({ message: "Erro ao atualizar formulário" }, { status: 500 });
  }
}
