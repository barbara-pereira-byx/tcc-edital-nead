import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileText, ClipboardCheck } from "lucide-react"
import {
  ChevronLeft,
  FileIcon as FilePdf,
} from "lucide-react"

type Inscricao = {
  id: string
  dataHora: Date
  formulario: {
    dataFim: string | null
    edital: {
      titulo: string
    }
  }
}

export default async function InscricoesPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/editais")
  }

  const inscricoes = await prisma.formularioUsuario.findMany({
    where: {
      usuarioId: session.user.id,
    },
    include: {
      formulario: {
        include: {
          edital: true,
        },
      },
    },
    orderBy: {
      dataHora: "desc",
    },
  })

  const editaisDisponiveis = await prisma.edital.count({
    where: {
      formulario: {
        dataFim: {
          gte: new Date(),
        },
      },
    },
  })

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 bg-slate-50 py-8">
        <div className="container px-4">
          <div className="flex gap-4 mb-4">
            <Link
              href="/editais"
              className="flex items-center text-sm text-blue-600 hover:text-blue-800 transition-colors"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Voltar para editais
            </Link>
          </div>
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Minhas Inscrições</h1>
          </div>

          <div className="grid gap-4 md:grid-cols-2 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Inscrições</CardTitle>
                <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{inscricoes.length}</div>
                <p className="text-xs text-muted-foreground">Inscrições realizadas em editais</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Editais Disponíveis</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{editaisDisponiveis}</div>
                <p className="text-xs text-muted-foreground">Editais com inscrições abertas</p>
              </CardContent>
            </Card>
          </div>

          {inscricoes.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <h2 className="text-xl font-semibold mb-2">Nenhuma inscrição encontrada</h2>
                <p className="text-muted-foreground mb-6">Você ainda não se inscreveu em nenhum edital.</p>
                <Link href="/editais">
                  <Button>Ver Editais Disponíveis</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {inscricoes.map((inscricao) => (
                <Card key={inscricao.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <CardTitle>{inscricao.formulario.edital.titulo}</CardTitle>
                      <Badge className="self-start md:self-auto">
                        {inscricao.status === 'CANCELADO' ? 'CANCELADO' : 'ATIVO'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="font-medium">Data da Inscrição</div>
                          <div className="text-muted-foreground">
                            {new Date(inscricao.dataHora).toLocaleDateString("pt-BR", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        </div>
                        <div>
                          <div className="font-medium">Prazo do Edital</div>
                          <div className="text-muted-foreground">
                            {inscricao.formulario.dataFim
                              ? new Date(inscricao.formulario.dataFim).toLocaleDateString("pt-BR")
                              : "Não especificado"}
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <Link href={`/inscricoes/${inscricao.id}`}>
                          <Button variant="outline">Ver Detalhes</Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
