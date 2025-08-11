import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { descriptografarDadosLog } from "@/lib/crypto-logs"

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 })
    }

    // Apenas administradores podem visualizar os logs
    if (session.user.tipo !== 1) {
      return NextResponse.json({ message: "Acesso negado" }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const skip = (page - 1) * limit
    const search = searchParams.get("search") || ""
    const acao = searchParams.get("acao") || ""
    const dataInicio = searchParams.get("dataInicio")
    const dataFim = searchParams.get("dataFim")

    // Construir filtros (apenas data, pois outros campos estão criptografados)
    const where: any = {}
    
    if (dataInicio || dataFim) {
      where.createdAt = {}
      if (dataInicio) {
        where.createdAt.gte = new Date(dataInicio + 'T00:00:00.000Z')
      }
      if (dataFim) {
        where.createdAt.lte = new Date(dataFim + 'T23:59:59.999Z')
      }
    }

    const [logs, total] = await Promise.all([
      prisma.logInscricao.findMany({
        where,
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.logInscricao.count({ where }),
    ])

    const totalPages = Math.ceil(total / limit)
    
    // Descriptografar logs antes de retornar
    let logsDescriptografados = logs.map(log => descriptografarDadosLog(log))
    
    // Aplicar filtros após descriptografar
    if (search) {
      logsDescriptografados = logsDescriptografados.filter(log => 
        log.usuarioInscricaoNome?.toLowerCase().includes(search.toLowerCase()) ||
        log.usuarioInscricaoCpf?.toLowerCase().includes(search.toLowerCase()) ||
        log.usuarioAcaoNome?.toLowerCase().includes(search.toLowerCase()) ||
        log.usuarioAcaoCpf?.toLowerCase().includes(search.toLowerCase()) ||
        log.editalTitulo?.toLowerCase().includes(search.toLowerCase()) ||
        log.editalCodigo?.toLowerCase().includes(search.toLowerCase())
      )
    }
    
    if (acao) {
      logsDescriptografados = logsDescriptografados.filter(log => log.acao === acao)
    }
    
    // Recalcular paginação após filtros
    const totalFiltrado = logsDescriptografados.length
    const totalPagesFiltrado = Math.ceil(totalFiltrado / limit)
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const logsPaginados = logsDescriptografados.slice(startIndex, endIndex)

    return NextResponse.json({
      logs: logsPaginados,
      totalPages: totalPagesFiltrado,
      currentPage: page,
      total: totalFiltrado,
    })
  } catch (error) {
    console.error("Erro ao buscar logs de inscrição:", error)
    return NextResponse.json({ message: "Erro ao buscar logs" }, { status: 500 })
  }
}