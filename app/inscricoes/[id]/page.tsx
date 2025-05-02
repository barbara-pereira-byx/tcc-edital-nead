import { getServerSession } from "next-auth/next"
import { redirect, notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CancelInscricaoButton } from "@/components/cancel-inscricao-button"

export default async function InscricaoDetalhesPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/editais")
  }
  
  // Obter o tipo do usuário
  const user = await prisma.usuario.findUnique({
    where: { email: session.user?.email },
    select: { tipo: true },
  });

  const userType = user?.tipo ?? 0;
  const inscricao = await prisma.formularioUsuario.findUnique({
    where: {
      id: params.id,
      usuarioId: session.user.id,
    },
    include: {
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
      usuario: true,
    },
  })

  if (!inscricao) {
    notFound()
  }

  // Verificar se o período de inscrições ainda está aberto para permitir cancelamento
  const hoje = new Date()
  const dataFim = inscricao.formulario.dataFim ? new Date(inscricao.formulario.dataFim) : null
  const podeEditar = dataFim && hoje <= dataFim

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 bg-slate-50 py-8">
        <div className="container px-4">
          <div className="mb-6">
            <Link href="/inscricoes" className="text-sm text-blue-600 hover:underline mb-2 inline-block">
              ← Voltar para minhas inscrições
            </Link>
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">{inscricao.formulario.edital.titulo}</h1>
              <Badge>Inscrito</Badge>
            </div>
            <p className="text-muted-foreground mt-2">
              Inscrição realizada em{" "}
              {new Date(inscricao.dataHora).toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>

          <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Dados da Inscrição</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {inscricao.campos.map((resposta: { id: string; campo: { rotulo: string }; valor: string }) => (
                  <div key={resposta.id} className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div className="font-medium">{resposta.campo.rotulo}</div>
                    <div className="text-muted-foreground">{resposta.valor}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

            <Card>
              <CardHeader>
                <CardTitle>Informações do Edital</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="font-medium">Data de Publicação</div>
                    <div className="text-muted-foreground">
                      {new Date(inscricao.formulario.edital.dataPublicacao).toLocaleDateString("pt-BR")}
                    </div>
                  </div>
                  {inscricao.formulario.edital.dataEncerramento && (
                    <div>
                      <div className="font-medium">Data de Encerramento</div>
                      <div className="text-muted-foreground">
                        {new Date(inscricao.formulario.edital.dataEncerramento).toLocaleDateString("pt-BR")}
                      </div>
                    </div>
                  )}
                  <div>
                    <div className="font-medium">Período de Inscrições</div>
                    <div className="text-muted-foreground">
                      {new Date(inscricao.formulario.dataInicio).toLocaleDateString("pt-BR")} a{" "}
                      {new Date(inscricao.formulario.dataFim).toLocaleDateString("pt-BR")}
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <Link href={`/editais/${inscricao.formulario.editalId}`}>
                    <Button variant="outline">Ver Edital Completo</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-4">
              <Link href="/inscricoes">
                <Button variant="outline">Voltar</Button>
              </Link>
              {podeEditar && <CancelInscricaoButton inscricaoId={inscricao.id} />}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
