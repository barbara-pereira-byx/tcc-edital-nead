import { getServerSession } from "next-auth/next"
import { redirect, notFound } from "next/navigation"
import {
  Calendar,
  Clock,
  Users,
  AlertCircle,
  CheckCircle,
  ChevronLeft,
  FileText,
  FileIcon as FilePdf,
  FileImage,
  FileArchive,
  FileSpreadsheet,
  File,
} from "lucide-react"
import Link from "next/link"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FormularioInscricao } from "@/components/formulario-inscricao"
import { FormularioPreview } from "@/components/formulario-preview"
import { ListaInscritos } from "@/components/lista-inscritos"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default async function EditalPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

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
    notFound()
  }

  // Verificar se o usuário é administrador
  const isAdmin = session.user.tipo === 1

  let inscricao = null
  if (edital.formulario?.id) {
    inscricao = await prisma.formularioUsuario.findFirst({
      where: {
        formularioId: edital.formulario.id,
        usuarioId: session.user.id,
      },
    })
  }
  const jaInscrito = !!inscricao

  const hoje = new Date()
  const dataInicio = edital.formulario?.dataInicio ? new Date(edital.formulario.dataInicio) : null
  const dataFim = edital.formulario?.dataFim ? new Date(edital.formulario.dataFim) : null

  // Função para verificar se as inscrições estão abertas
  const inscricoesAbertas = () => {
    // Se não tiver datas definidas, considera fechado
    if (!dataInicio || !dataFim) return false

    // Verifica se a data atual está entre início e fim
    const inicio = new Date(dataInicio)
    const fim = new Date(dataFim)

    // Ajusta o fim para o final do dia (23:59:59)
    fim.setHours(23, 59, 59, 999)

    return hoje >= inicio && hoje <= fim
  }

  const periodoInscricoesAberto = inscricoesAbertas()

  // Função para formatar data
  const formatarData = (data: Date) => {
    return data.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  // Status do edital para exibição
  const getStatusEdital = () => {
    if (jaInscrito && inscricao.status === 'ATIVO') return { label: "Inscrito", variant: "success", icon: CheckCircle }
    if (periodoInscricoesAberto) return { label: "Inscrições Abertas", variant: "default", icon: null }
    if (dataInicio && hoje < dataInicio) return { label: "Inscrições em Breve", variant: "warning", icon: Clock }
    return { label: "Inscrições Encerradas", variant: "secondary", icon: null }
  }

  const statusEdital = getStatusEdital()

  // Buscar inscrições para administradores
  const inscricoes =
    isAdmin && edital.formulario
      ? await prisma.formularioUsuario.findMany({
          where: { formularioId: edital.formulario.id },
          include: { usuario: true },
          orderBy: { dataHora: "desc" },
        })
      : []

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 bg-slate-50 py-8">
        <div className="container px-4 max-w-5xl mx-auto">
          {/* Cabeçalho */}
          <div className="mb-8">
            <Link
              href="/editais"
              className="flex items-center text-sm text-blue-600 hover:text-blue-800 mb-4 transition-colors"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Voltar para editais
            </Link>

            <div className="bg-white rounded-lg shadow-sm p-6 border border-slate-200">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900">{edital.titulo}</h1>
                <Badge
                  variant={
                    statusEdital.variant as "default" | "secondary" | "destructive" | "outline" | "warning" | "success"
                  }
                  className="text-sm py-1 px-3 h-auto flex items-center gap-1"
                >
                  {statusEdital.icon && <statusEdital.icon className="h-4 w-4 mr-1" />}
                  {statusEdital.label}
                </Badge>
              </div>

              <Separator className="my-4" />

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2 text-slate-700">
                  <Calendar className="h-4 w-4 text-slate-500" />
                  <span>Publicado em: {formatarData(new Date(edital.dataPublicacao))}</span>
                </div>

                {edital.dataEncerramento && (
                  <div className="flex items-center gap-2 text-slate-700">
                    <Clock className="h-4 w-4 text-slate-500" />
                    <span>Encerra em: {formatarData(new Date(edital.dataEncerramento))}</span>
                  </div>
                )}

                {edital.formulario && dataInicio && dataFim && (
                  <div className="flex items-center gap-2 text-slate-700">
                    <Users className="h-4 w-4 text-slate-500" />
                    <span>
                      Inscrições: {formatarData(dataInicio)} a {formatarData(dataFim)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Conteúdo em abas */}
          <Tabs defaultValue="anexos" className="space-y-4">
            <TabsList className="bg-white border border-slate-200 p-1 rounded-lg">
              <TabsTrigger value="anexos" className="rounded-md data-[state=active]:bg-slate-100">
                Arquivos do Edital
              </TabsTrigger>
              <TabsTrigger value="formulario" className="rounded-md data-[state=active]:bg-slate-100">
                {isAdmin ? "Campos do Formulário" : jaInscrito ? "Minha Inscrição" : "Formulário de Inscrição"}
              </TabsTrigger>
              {isAdmin && (
                <TabsTrigger value="inscritos" className="rounded-md data-[state=active]:bg-slate-100">
                  Lista de Inscritos
                </TabsTrigger>
              )}
            </TabsList>
            <TabsContent value="anexos">
              <Card>
                <CardContent className="p-6 space-y-6">

                  {/* Lista de Arquivos */}
                  <div>
                    <h2 className="text-xl font-semibold mb-4">Arquivos</h2>

                    {edital.arquivos && edital.arquivos.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {edital.arquivos.map((arquivo: any) => {
                          // Determinar o ícone com base na extensão do arquivo
                          const getFileIcon = () => {
                            const url = arquivo.url.toLowerCase()
                            if (url.endsWith(".pdf")) return FilePdf
                            if (url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)) return FileImage
                            if (url.match(/\.(zip|rar|7z|tar|gz)$/)) return FileArchive
                            if (url.match(/\.(xls|xlsx|csv)$/)) return FileSpreadsheet
                            if (url.match(/\.(doc|docx|txt)$/)) return FileText
                            return File
                          }

                          const FileIcon = getFileIcon()

                          return (
                            <a
                              key={arquivo.id}
                              href={arquivo.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex flex-col items-center justify-center bg-white hover:bg-blue-50 rounded-lg p-6 border border-slate-200 hover:border-blue-300 transition-all shadow-sm hover:shadow group"
                            >
                              <div className="w-16 h-16 flex items-center justify-center bg-blue-100 rounded-full mb-3 group-hover:bg-blue-200 transition-colors">
                                <FileIcon
                                  size={32}
                                  className="text-blue-600 group-hover:text-blue-700 transition-colors"
                                />
                              </div>
                              <span className="text-blue-600 group-hover:text-blue-700 font-medium text-center line-clamp-2 transition-colors">
                                {arquivo.rotulo || "Anexo"}
                              </span>
                              {arquivo.dataPublicacao && (
                                <span className="text-xs text-slate-500 mt-2">
                                  {formatarData(new Date(arquivo.dataPublicacao))}
                                </span>
                              )}
                              <span className="mt-2 text-xs px-3 py-1 bg-slate-100 text-slate-600 rounded-full group-hover:bg-blue-100 group-hover:text-blue-700 transition-colors">
                                Baixar arquivo
                              </span>
                            </a>
                          )
                        })}
                      </div>
                    ) : (
                      <Alert variant="default" className="bg-slate-50 border-slate-200">
                        <AlertCircle className="h-4 w-4 text-slate-500" />
                        <AlertDescription>Nenhum anexo disponível para este edital.</AlertDescription>
                      </Alert>
                    )}
                  </div>


                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="formulario">
              <Card>
                <CardContent className="p-6">
                  {isAdmin ? (
                    // Visualização para administradores - apenas visualizar os campos
                    <>
                      <h2 className="text-xl font-semibold mb-6">Campos do Formulário</h2>
                      {edital.formulario ? (
                        <FormularioPreview formulario={edital.formulario} />
                      ) : (
                        <Alert variant="default" className="bg-slate-50 border-slate-200">
                          <AlertCircle className="h-4 w-4 text-slate-500" />
                          <AlertDescription>Este edital não possui formulário configurado.</AlertDescription>
                        </Alert>
                      )}
                    </>
                  ) : inscricao.status === 'ATIVO' ? (
                    // Usuário já inscrito
                    <div className="text-center py-8">
                      <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                      <h2 className="text-xl font-semibold mb-2">Inscrição Realizada</h2>
                      {inscricao?.dataHora && (
                        <p className="text-slate-500 mb-6">
                          Você já realizou sua inscrição neste edital em{" "}
                          {new Date(inscricao.dataHora).toLocaleDateString("pt-BR", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      )}
                      <Link href={`/inscricoes/${inscricao?.id ?? ""}`}>
                        <Button aria-label="Ver detalhes da inscrição" className="px-6">
                          Ver Detalhes da Inscrição
                        </Button>
                      </Link>
                    </div>
                  ) : periodoInscricoesAberto ? (
                    // Usuário pode se inscrever
                    <>
                      <h2 className="text-xl font-semibold mb-6">Formulário de Inscrição</h2>
                      {edital.formulario ? (
                        <FormularioInscricao formulario={edital.formulario} />
                      ) : (
                        <Alert variant="default" className="bg-slate-50 border-slate-200">
                          <AlertCircle className="h-4 w-4 text-slate-500" />
                          <AlertDescription>Formulário não disponível.</AlertDescription>
                        </Alert>
                      )}
                    </>
                  ) : (
                    // Período de inscrições fechado
                    <div className="text-center py-8">
                      <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
                      <h2 className="text-xl font-semibold mb-2">
                        Inscrições {dataInicio && hoje < dataInicio ? "Ainda Não Iniciadas" : "Encerradas"}
                      </h2>
                      <p className="text-slate-500 mb-2">
                        {dataInicio && hoje < dataInicio
                          ? "O período de inscrições para este edital ainda não começou."
                          : "O período de inscrições para este edital está encerrado."}
                      </p>
                      {dataInicio && dataFim && (
                        <p className="text-sm text-slate-500 mt-4">
                          Período de inscrições: {formatarData(dataInicio)} a {formatarData(dataFim)}
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {isAdmin && (
              <TabsContent value="inscritos">
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-xl font-semibold mb-6">Lista de Inscritos</h2>
                    <ListaInscritos inscricoes={inscricoes} formulario={edital.formulario} />
                  </CardContent>
                </Card>
              </TabsContent>
            )}
          </Tabs>
        </div>
      </main>
    </div>
  )
}
