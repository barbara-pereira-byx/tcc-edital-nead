import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.tipo !== 1) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 })
    }

    // Buscar todas as categorias únicas dos campos de formulário
    const categorias = await prisma.campoFormulario.findMany({
      select: {
        categoria: true,
      },
      distinct: ['categoria'],
      where: {
        categoria: {
          not: null,
        },
      },
    })

    const categoriasUnicas = categorias
      .map(c => c.categoria)
      .filter(Boolean)
      .sort()

    // Categorias padrão
    const categoriasDefault = [
      "Dados Pessoais",
      "Identidade", 
      "Endereço",
      "Contato",
      "Documentos",
      "Outros"
    ]

    // Combinar categorias padrão com as do banco, removendo duplicatas
    const todasCategorias = [...new Set([...categoriasDefault, ...categoriasUnicas])]

    return NextResponse.json(todasCategorias)
  } catch (error) {
    console.error("Erro ao buscar categorias:", error)
    return NextResponse.json({ message: "Erro ao buscar categorias" }, { status: 500 })
  }
}