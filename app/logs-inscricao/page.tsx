"use client"
import Link from "next/link";
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { ChevronLeft, ChevronRight, ScrollText, Search, Filter } from "lucide-react"

interface LogInscricao {
  id: string
  usuarioInscricaoId: string
  usuarioInscricaoCpf: string
  usuarioInscricaoNome: string
  usuarioAcaoId: string
  usuarioAcaoCpf: string
  usuarioAcaoNome: string
  acao: string
  editalTitulo?: string
  editalCodigo?: string
  createdAt: string
}

const acaoLabels = {
  INSCRICAO: "Inscrição",
  CANCELAMENTO_USUARIO: "Cancelamento pelo usuário",
  CANCELAMENTO_ADMIN: "Cancelamento pelo admin",
}

const acaoColors = {
  INSCRICAO: "bg-green-100 text-green-800",
  CANCELAMENTO_USUARIO: "bg-yellow-100 text-yellow-800",
  CANCELAMENTO_ADMIN: "bg-red-100 text-red-800",
  CANCELAMENTO_COMISSAO: "bg-orange-100 text-orange-800",
}

export default function LogsInscricaoPage() {
  const { data: session, status } = useSession()
  const [logs, setLogs] = useState<LogInscricao[]>([])
  const [loading, setLoading] = useState(true)
  const [pageLoading, setPageLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const itemsPerPage = 10
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedAcao, setSelectedAcao] = useState("")
  const [dataInicio, setDataInicio] = useState("")
  const [dataFim, setDataFim] = useState("")

  useEffect(() => {
    // Verificar se é administrador
    if (status === "authenticated" && (!session || session.user.tipo !== 1)) {
      redirect("/editais")
      return
    }

    if (status !== "authenticated") return
    async function fetchLogs() {
      try {
        if (currentPage > 1) setPageLoading(true)
        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: itemsPerPage.toString(),
        })
        
        if (searchTerm) params.append('search', searchTerm)
        if (selectedAcao) params.append('acao', selectedAcao)
        if (dataInicio) params.append('dataInicio', dataInicio)
        if (dataFim) params.append('dataFim', dataFim)
        
        const response = await fetch(`/api/logs-inscricao?${params}`)
        if (response.ok) {
          const data = await response.json()
          setLogs(data.logs || data)
          setTotalPages(data.totalPages || Math.ceil(data.length / itemsPerPage))
        }
      } catch (error) {
        console.error("Erro ao carregar logs:", error)
      } finally {
        setLoading(false)
        setPageLoading(false)
      }
    }

    fetchLogs()
  }, [session, status, currentPage, searchTerm, selectedAcao, dataInicio, dataFim])

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <ScrollText className="h-5 w-5 text-blue-600 animate-pulse" />
                <Skeleton className="h-6 w-48" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-5 gap-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-4 w-full" />
                  ))}
                </div>
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="grid grid-cols-5 gap-4">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Skeleton key={j} className="h-8 w-full" />
                    ))}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!session || session.user.tipo !== 1) {
    return null // O redirect já foi chamado no useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <Link href="/editais" className="text-sm text-blue-600 hover:underline mb-2 inline-block">
            ← Voltar para editais
        </Link>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Logs de Inscrição</h1>
          <p className="mt-2 text-gray-600">
            Histórico de todas as ações relacionadas às inscrições
          </p>
        </div>

        {/* Filtros */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="search">Buscar</Label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Nome, CPF, edital, código..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value)
                      setCurrentPage(1)
                    }}
                    className="pl-8"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="acao">Ação</Label>
                <Select value={selectedAcao || undefined} onValueChange={(value) => {
                  setSelectedAcao(value || "")
                  setCurrentPage(1)
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas as ações" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INSCRICAO">Inscrição</SelectItem>
                    <SelectItem value="CANCELAMENTO_USUARIO">Cancelamento pelo usuário</SelectItem>
                    <SelectItem value="CANCELAMENTO_ADMIN">Cancelamento pelo admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="dataInicio">Data Início</Label>
                <Input
                  id="dataInicio"
                  type="date"
                  value={dataInicio}
                  onChange={(e) => {
                    setDataInicio(e.target.value)
                    setCurrentPage(1)
                  }}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="dataFim">Data Fim</Label>
                <Input
                  id="dataFim"
                  type="date"
                  value={dataFim}
                  onChange={(e) => {
                    setDataFim(e.target.value)
                    setCurrentPage(1)
                  }}
                />
              </div>
            </div>
            
            <div className="flex justify-end mt-4">
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm("")
                  setSelectedAcao("")
                  setDataInicio("")
                  setDataFim("")
                  setCurrentPage(1)
                }}
              >
                Limpar Filtros
              </Button>
            </div>
          </CardContent>
        </Card>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de Ações</CardTitle>
        </CardHeader>
        <CardContent className={pageLoading ? "opacity-50 transition-opacity" : ""}>
          {logs.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Nenhum log encontrado
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Usuário da Inscrição</TableHead>
                  <TableHead>Quem Realizou</TableHead>
                  <TableHead>Ação</TableHead>
                  <TableHead>Edital</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      {format(new Date(log.createdAt), "dd/MM/yyyy HH:mm", {
                        locale: ptBR,
                      })}
                    </TableCell>
                    <TableCell className="font-medium">
                      <div>
                        <div>{log.usuarioInscricaoNome}</div>
                        <div className="text-xs text-gray-500">{log.usuarioInscricaoCpf}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div>{log.usuarioAcaoNome}</div>
                        <div className="text-xs text-gray-500">{log.usuarioAcaoCpf}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          `${
                            acaoColors[log.acao as keyof typeof acaoColors] ||
                            "bg-gray-100 text-gray-800"
                          } hover:bg-gray-200 hover:text-gray-900`
                        }
                      >
                        {acaoLabels[log.acao as keyof typeof acaoLabels] || log.acao}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <div>
                        {log.editalCodigo && (
                          <div className="font-medium text-sm">{log.editalCodigo}</div>
                        )}
                        <div className="text-xs text-gray-500">{log.editalTitulo || "-"}</div>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
        {logs.length > 0 && (
          <div className="flex items-center justify-between px-6 py-4 border-t">
            <div className="text-sm text-gray-500">
              Página {currentPage} de {totalPages}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1 || pageLoading}
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages || pageLoading}
              >
                Próxima
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>
      </div>
    </div>
  )
}