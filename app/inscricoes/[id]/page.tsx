import { getServerSession } from "next-auth/next"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { ChevronLeft, FileText, Download } from "lucide-react"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

export default async function InscricaoDetalhesPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  // Buscar a inscrição com todos os detalhes
  const inscricao = await prisma.formularioUsuario.findUnique({
    where: { id: params.id },
    include: {
      usuario: true,
      formulario: {
        include: {
          edital: true,
          campos: true,
        },
      },
      campos: {
        include: {
          campo: true,
        },
      },
    },
  })

  if (!inscricao) {
    notFound()
  }

  // Verificar se o usuário tem permissão para ver esta inscrição
  const isAdmin = session.user.tipo === 1
  const isOwner = inscricao.usuarioId === session.user.id

  if (!isAdmin && !isOwner) {
    redirect("/inscricoes")
  }

  // Formatar data
  const formatarData = (data: Date) => {
    return new Date(data).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 bg-slate-50 py-8">
        <div className="container px-4 max-w-3xl mx-auto">
          <Link
            href="/inscricoes"
            className="flex items-center text-sm text-blue-600 hover:text-blue-800 mb-4 transition-colors"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Voltar para minhas inscrições
          </Link>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-slate-200 mb-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">{inscricao.formulario.edital.titulo}</h1>
                <p className="text-slate-500">Inscrição realizada em {formatarData(inscricao.dataHora)}</p>
              </div>
              <Badge className="self-start md:self-auto">Inscrito</Badge>
            </div>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Dados da Inscrição</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {inscricao.campos.map((resposta) => {
                const campo = resposta.campo
                const rotulo = campo.rotulo.includes("|") ? campo.rotulo.split("|")[0] : campo.rotulo
                const isArquivo = campo.tipo === 6

                return (
                  <div key={resposta.id} className="grid grid-cols-3 gap-4 py-2 border-b">
                    <div className="font-medium">{rotulo}</div>
                    <div className="col-span-2">
                      {isArquivo ? (
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-blue-600" />
                          <span>{resposta.valor || "-"}</span>
                          <Button variant="outline" size="sm" asChild className="ml-2">
                            <a href={`/api/arquivos/${resposta.id}`} target="_blank" rel="noopener noreferrer">
                              <Download className="h-4 w-4 mr-1" /> Abrir
                            </a>
                          </Button>
                        </div>
                      ) : (
                        resposta.valor || "-"
                      )}
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Informações do Edital</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-slate-500">Data de Publicação</h3>
                  <p>{formatarData(inscricao.formulario.edital.dataPublicacao)}</p>
                </div>
                {inscricao.formulario.edital.dataEncerramento && (
                  <div>
                    <h3 className="text-sm font-medium text-slate-500">Data de Encerramento</h3>
                    <p>{formatarData(inscricao.formulario.edital.dataEncerramento)}</p>
                  </div>
                )}
              </div>

              <Separator />

              <div>
                <h3 className="text-sm font-medium text-slate-500 mb-2">Período de Inscrições</h3>
                <p>
                  {formatarData(inscricao.formulario.dataInicio)} a {formatarData(inscricao.formulario.dataFim)}
                </p>
              </div>

              <div className="flex justify-between mt-4">
                <Button variant="outline" asChild>
                  <Link href={`/editais/${inscricao.formulario.edital.id}`}>Ver Edital Completo</Link>
                </Button>
                <Button variant="destructive" asChild>
                  <Link href={`/inscricoes/${inscricao.id}/cancelar`}>Cancelar Inscrição</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
