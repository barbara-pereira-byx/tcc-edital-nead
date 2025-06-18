"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { useSession } from 'next-auth/react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/components/ui/use-toast"
import { Search, Eye, Download, FileText, Trash, AlertTriangle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ListaInscritosProps {
  inscricoes: any[]
  formulario: any
}

export function ListaInscritos({ inscricoes, formulario }: ListaInscritosProps) {
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedInscricao, setSelectedInscricao] = useState<any>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false)
  const [respostas, setRespostas] = useState<any[]>([])
  const { data: session } = useSession()

  const isAdmin = session?.user?.tipo === 1

  // Filtrar inscrições com base no termo de busca
  const filteredInscricoes = inscricoes.filter(
    (inscricao) =>
      inscricao.usuario.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inscricao.usuario.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Formatar data
  const formatarData = (dataString: string) => {
    const data = new Date(dataString)
    return data.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Abrir detalhes da inscrição
  const abrirDetalhes = async (inscricao: any) => {
    try {
      setIsLoading(true)
      // Buscar respostas do formulário
      const response = await fetch(`/api/inscricoes/${inscricao.id}/respostas`)
      if (response.ok) {
        const respostasData = await response.json()
        setRespostas(respostasData)
        setSelectedInscricao(inscricao)
        setIsDialogOpen(true)
      } else {
        toast({
          title: "Erro ao carregar respostas",
          description: "Não foi possível carregar as respostas desta inscrição.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erro ao carregar respostas",
        description: "Ocorreu um erro ao tentar carregar as respostas.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Cancelar uma inscrição
  const cancelarInscricao = async (inscricaoId: string) => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/inscricoes/${inscricaoId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "Inscrição cancelada",
          description: "A inscrição foi cancelada com sucesso.",
        })
        // Fechar o diálogo e atualizar a página
        setIsDialogOpen(false)
        setIsConfirmDialogOpen(false)
        window.location.reload()
      } else {
        const error = await response.json()
        toast({
          title: "Erro ao cancelar inscrição",
          description: error.message || "Ocorreu um erro ao tentar cancelar a inscrição.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erro ao cancelar inscrição",
        description: "Ocorreu um erro ao tentar cancelar a inscrição.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Cancelar múltiplas inscrições
  const cancelarMultiplasInscricoes = async () => {
    if (selectedIds.length === 0) return

    try {
      setIsLoading(true)
      const response = await fetch(`/api/inscricoes/bulk-delete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ids: selectedIds }),
      })

      if (response.ok) {
        toast({
          title: "Inscrições canceladas",
          description: `${selectedIds.length} inscrições foram canceladas com sucesso.`,
        })
        // Limpar seleção e atualizar a página
        setSelectedIds([])
        setIsBulkDeleteDialogOpen(false)
        window.location.reload()
      } else {
        const error = await response.json()
        toast({
          title: "Erro ao cancelar inscrições",
          description: error.message || "Ocorreu um erro ao tentar cancelar as inscrições.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erro ao cancelar inscrições",
        description: "Ocorreu um erro ao tentar cancelar as inscrições.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Gerenciar seleção de checkbox
  const toggleSelectAll = () => {
    if (selectedIds.length === filteredInscricoes.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(filteredInscricoes.map((inscricao) => inscricao.id))
    }
  }

  const toggleSelectInscricao = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((selectedId) => selectedId !== id))
    } else {
      setSelectedIds([...selectedIds, id])
    }
  }

  // Verificar se um campo é do tipo arquivo
  const isCampoArquivo = (campoId: string) => {
    if (!formulario?.campos) return false
    const campo = formulario.campos.find((c: any) => c.id === campoId)
    return campo?.tipo === 6
  }

  if (inscricoes.length === 0) {
    return (
      <Alert>
        <AlertDescription>Nenhuma inscrição encontrada para este edital.</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-4">
      {/* Barra de busca e estatísticas */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar por nome ou email..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-sm py-1 px-3">
            Total: {inscricoes.length} inscrições
          </Badge>
          {selectedIds.length > 0 && isAdmin && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setIsBulkDeleteDialogOpen(true)}
              disabled={isLoading}
            >
              <Trash className="h-4 w-4 mr-1" /> Cancelar selecionados ({selectedIds.length})
            </Button>
          )}
        </div>
      </div>

      {/* Tabela de inscritos */}
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedIds.length === filteredInscricoes.length && filteredInscricoes.length > 0}
                  onCheckedChange={toggleSelectAll}
                  aria-label="Selecionar todas as inscrições"
                />
              </TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Data de Inscrição</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredInscricoes.length > 0 ? (
              filteredInscricoes.map((inscricao) => (
                <TableRow key={inscricao.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.includes(inscricao.id)}
                      onCheckedChange={() => toggleSelectInscricao(inscricao.id)}
                      aria-label={`Selecionar inscrição de ${inscricao.usuario.nome}`}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{inscricao.usuario.nome}</TableCell>
                  <TableCell>{inscricao.usuario.email}</TableCell>
                  <TableCell>{formatarData(inscricao.dataHora)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => abrirDetalhes(inscricao)} disabled={isLoading}>
                        <Eye className="h-4 w-4 mr-1" /> Ver
                      </Button>
                      {isAdmin && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-800 hover:bg-red-100"
                          onClick={() => {
                            setSelectedInscricao(inscricao)
                            setIsConfirmDialogOpen(true)
                          }}
                          disabled={isLoading}
                        >
                          <Trash className="h-4 w-4 mr-1" /> Cancelar
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                  Nenhum resultado encontrado para "{searchTerm}"
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Modal de detalhes da inscrição */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes da Inscrição</DialogTitle>
            <DialogDescription>
              {selectedInscricao?.usuario?.nome} - {formatarData(selectedInscricao?.dataHora || "")}
            </DialogDescription>
          </DialogHeader>

          {selectedInscricao && (
            <>
              <Tabs defaultValue="respostas">
                <TabsList className="mb-4">
                  <TabsTrigger value="respostas">Respostas</TabsTrigger>
                  <TabsTrigger value="anexos">Arquivos</TabsTrigger>
                  <TabsTrigger value="info">Informações do Candidato</TabsTrigger>
                </TabsList>

                <TabsContent value="respostas">
                  <div className="space-y-4">
                    {respostas?.length > 0 ? (
                      respostas.map((resposta: any) => {
                        // Encontrar o campo correspondente para obter o rótulo
                        const campo = resposta.campo
                        const rotulo = campo
                          ? campo.rotulo.includes("|")
                            ? campo.rotulo.split("|")[0]
                            : campo.rotulo
                          : "Campo"

                        // Verificar se é um campo de arquivo
                        const isArquivo = campo?.tipo === 6

                        return (
                          <Card key={resposta.id}>
                            <CardContent className="p-4">
                              <div className="grid grid-cols-3 gap-4">
                                <div className="font-medium">{rotulo}</div>
                                <div className="col-span-2">
                                  {isArquivo ? (
                                    <div className="flex flex-col gap-2">
                                      <div className="flex items-center gap-2">
                                        <FileText className="h-4 w-4 text-blue-600 flex-shrink-0" />
                                        <span className="truncate max-w-[calc(100%-4rem)] block">{resposta.valor || "-"}</span>
                                      </div>
                                      
                                      {/* Lista de arquivos */}
                                  {resposta.arquivos && resposta.arquivos.length > 0 ? (
                                    <div className="space-y-2 mt-2">
                                      {resposta.arquivos.map((arquivo) => (
                                        <div key={arquivo.id} className="flex items-center justify-between bg-slate-50 p-2 rounded-md border">
                                          <div className="flex items-center gap-2">
                                            <FileText className="h-4 w-4 text-blue-500" />
                                            <span className="text-sm">{arquivo.nomeOriginal}</span>
                                            <span className="text-xs text-slate-500">
                                              ({Math.round(arquivo.tamanho / 1024)} KB)
                                            </span>
                                          </div>
                                          <div className="flex gap-2">
                                            <a
                                              href={`/api/arquivo/${arquivo.id}`}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              title="Visualizar"
                                              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 px-2"
                                            >
                                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-eye"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                                            </a>
                                            <a
                                              href={`/api/arquivo/${arquivo.id}?download=true`}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              title="Baixar"
                                              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 px-2"
                                            >
                                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-download"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                                            </a>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <div className="text-sm text-slate-500">Nenhum arquivo disponível</div>
                                  )}
                                    </div>
                                  ) : (
                                    resposta.valor || "-"
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        )
                      })
                    ) : (
                      <Alert>
                        <AlertDescription>Nenhuma resposta encontrada para esta inscrição.</AlertDescription>
                      </Alert>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="anexos">
                  <div className="space-y-4">
                    {respostas?.some((r: any) => r.campo?.tipo === 6 && r.arquivos?.length > 0) ? (
                      respostas
                        .filter((r: any) => r.campo?.tipo === 6)
                        .map((resposta: any) => {
                          const campo = resposta.campo
                          const rotulo = campo
                            ? campo.rotulo.includes("|")
                              ? campo.rotulo.split("|")[0]
                              : campo.rotulo
                            : "Arquivo"

                          return (
                            <div key={resposta.id} className="p-3 border rounded-lg">
                              <div className="flex items-center gap-3 mb-2">
                                <FileText className="h-5 w-5 text-muted-foreground" />
                                <div>
                                  <p className="font-medium">{rotulo}</p>
                                  <p className="text-xs text-muted-foreground">{resposta.valor}</p>
                                </div>
                              </div>
                              
                              {/* Lista de arquivos */}
                              {resposta.arquivos && resposta.arquivos.length > 0 ? (
                                <div className="space-y-2 mt-3 pl-8">
                                  {resposta.arquivos.map((arquivo: any) => (
                                    <div key={arquivo.id} className="flex items-center justify-between bg-slate-50 p-2 rounded-md border">
                                      <div className="flex items-center gap-2">
                                        <FileText className="h-4 w-4 text-blue-500" />
                                        <span className="text-sm">{arquivo.nomeOriginal}</span>
                                        <span className="text-xs text-slate-500">
                                          ({Math.round(arquivo.tamanho / 1024)} KB)
                                        </span>
                                      </div>
                                      <div className="flex gap-2">
                                        <Button variant="outline" size="sm" asChild title="Visualizar">
                                          <a href={`/api/arquivos/${inscricoes.id}/respostas/${arquivo.id}`} target="_blank" rel="noopener noreferrer">
                                            <Eye className="h-4 w-4" />
                                          </a>
                                        </Button>
                                        <Button variant="outline" size="sm" asChild title="Baixar">
                                          <a href={`/api/arquivos/${inscricoes.id}/respostas/${arquivo.id}?download=true`} download>
                                            <Download className="h-4 w-4" />
                                          </a>
                                        </Button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-sm text-slate-500 pl-8">Nenhum arquivo disponível</div>
                              )}
                            </div>
                          )
                        })
                    ) : (
                      <Alert>
                        <AlertDescription>Nenhum anexo encontrado para esta inscrição.</AlertDescription>
                      </Alert>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="info">
                  <Card>
                    <CardContent className="p-4 space-y-4">
                      <div className="grid grid-cols-3 gap-4 py-2 border-b">
                        <div className="font-medium">Nome</div>
                        <div className="col-span-2">{selectedInscricao.usuario.nome}</div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 py-2 border-b">
                        <div className="font-medium">Email</div>
                        <div className="col-span-2">{selectedInscricao.usuario.email}</div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 py-2 border-b">
                        <div className="font-medium">Data de Inscrição</div>
                        <div className="col-span-2">{formatarData(selectedInscricao.dataHora)}</div>
                      </div>
                      {selectedInscricao.usuario.telefone && (
                        <div className="grid grid-cols-3 gap-4 py-2 border-b">
                          <div className="font-medium">Telefone</div>
                          <div className="col-span-2">{selectedInscricao.usuario.telefone}</div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
              <DialogFooter>
                {isAdmin && (
                  <Button
                    variant="destructive"
                    onClick={() => {
                      setIsDialogOpen(false)
                      setIsConfirmDialogOpen(true)
                    }}
                    disabled={isLoading}
                  >
                    <Trash className="h-4 w-4 mr-1" /> Cancelar Inscrição
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Diálogo de confirmação para cancelar uma inscrição */}
      <AlertDialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar Inscrição</AlertDialogTitle>
            <AlertDialogDescription>
              Você tem certeza que deseja cancelar a inscrição de <strong>{selectedInscricao?.usuario?.nome}</strong>?
              <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded-md flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <span className="text-amber-800 text-sm">
                  Esta ação não pode ser desfeita. A inscrição será permanentemente removida do sistema.
                </span>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                if (selectedInscricao) {
                  cancelarInscricao(selectedInscricao.id)
                }
              }}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isLoading ? "Cancelando..." : "Sim, cancelar inscrição"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Diálogo de confirmação para cancelar múltiplas inscrições */}
      <AlertDialog open={isBulkDeleteDialogOpen} onOpenChange={setIsBulkDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar Múltiplas Inscrições</AlertDialogTitle>
            <AlertDialogDescription>
              Você tem certeza que deseja cancelar <strong>{selectedIds.length}</strong> inscrições?
              <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded-md flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <span className="text-amber-800 text-sm">
                  Esta ação não pode ser desfeita. Todas as inscrições selecionadas serão permanentemente removidas do
                  sistema.
                </span>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                cancelarMultiplasInscricoes()
              }}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isLoading ? "Cancelando..." : `Sim, cancelar ${selectedIds.length} inscrições`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
