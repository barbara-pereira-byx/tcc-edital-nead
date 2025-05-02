import { getServerSession } from "next-auth/next"
import { redirect, notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MainNav } from "@/components/main-nav"
import { UserNav } from "@/components/user-nav"
import { FormularioInscricao } from "@/components/formulario-inscricao"
import { Badge } from "@/components/ui/badge"

export default async function EditalPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  const edital = await prisma.edital.findUnique({
    where: { id: params.id },
    include: {
      secoes: {
        include: {
          topicos: true,
        },
        orderBy: {
          id: "asc",
        },
      },
      formulario: {
        include: {
          campos: {
            orderBy: {
              id: "asc",
            },
          },
        },
      },
    },
  })

  if (!edital) {
    notFound()
  }

  const inscricao = await prisma.formularioUsuario.findFirst({
    where: {
      formularioId: edital.formulario?.id,
      usuarioId: session.user.id,
    },
  })

  const jaInscrito = !!inscricao

  const hoje = new Date()
  const dataInicio = edital.formulario?.dataInicio ? new Date(edital.formulario.dataInicio) : null
  const dataFim = edital.formulario?.dataFim ? new Date(edital.formulario.dataFim) : null

  const inscricoesAbertas = dataInicio && dataFim && hoje >= dataInicio && hoje <= dataFim

  return (
    <div className="flex min-h-screen flex-col">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <Image src="/logo-nead.png" alt="NEAD Logo" width={120} height={40} />
            <MainNav />
          </div>
          <div className="flex items-center gap-4">
            <UserNav />
          </div>
        </div>
      </header>
      <main className="flex-1 bg-slate-50 py-8">
        <div className="container px-4">
          <div className="mb-6">
            <Link href="/editais" className="text-sm text-blue-600 hover:underline mb-2 inline-block">
              ← Voltar para editais
            </Link>
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">{edital.titulo}</h1>
              <div>
                {inscricoesAbertas ? (
                  <Badge>Inscrições Abertas</Badge>
                ) : dataInicio && hoje < dataInicio ? (
                  <Badge variant="warning">Inscrições em Breve</Badge>
                ) : (
                  <Badge variant="secondary">Inscrições Encerradas</Badge>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              <div>Publicado em: {new Date(edital.dataPublicacao).toLocaleDateString("pt-BR")}</div>
              {edital.dataEncerramento && (
                <div>Encerra em: {new Date(edital.dataEncerramento).toLocaleDateString("pt-BR")}</div>
              )}
              {edital.formulario && (
                <div>
                  Inscrições: {new Date(edital.formulario.dataInicio).toLocaleDateString("pt-BR")} a{" "}
                  {new Date(edital.formulario.dataFim).toLocaleDateString("pt-BR")}
                </div>
              )}
            </div>
          </div>

          <Tabs defaultValue="detalhes">
            <TabsList className="mb-4 flex-wrap">
              <TabsTrigger value="detalhes">Detalhes do Edital</TabsTrigger>
              <TabsTrigger value="inscricao" disabled={!inscricoesAbertas && !jaInscrito}>
                {jaInscrito ? "Minha Inscrição" : "Formulário de Inscrição"}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="detalhes" className="bg-white p-6 rounded-md shadow-sm">
              {edital.secoes.map((secao: { id: string; titulo: string; topicos: { id: string; texto: string }[] }) => (
                <div key={secao.id} className="mb-8">
                  <h2 className="text-xl font-semibold mb-4">{secao.titulo}</h2>
                  <div className="space-y-4">
                    {secao.topicos.map((topico: { id: string; texto: string }) => (
                      <div key={topico.id}>
                        <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: topico.texto }} />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="inscricao" className="bg-white p-6 rounded-md shadow-sm">
              {jaInscrito ? (
                <div className="text-center py-8">
                  <h2 className="text-xl font-semibold mb-2">Inscrição Realizada</h2>
                  {inscricao?.dataHora && (
                    <p className="text-muted-foreground mb-4">
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
                    <Button aria-label="Ver detalhes da inscrição">Ver Detalhes da Inscrição</Button>
                  </Link>
                </div>
              ) : (
                <>
                  {inscricoesAbertas ? (
                    <>
                      <h2 className="text-xl font-semibold mb-6">Formulário de Inscrição</h2>
                      {edital.formulario ? (
                        <FormularioInscricao formulario={edital.formulario} />
                      ) : (
                        <p className="text-muted-foreground">Formulário não disponível.</p>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <h2 className="text-xl font-semibold mb-2">Inscrições Encerradas</h2>
                      <p className="text-muted-foreground">O período de inscrições para este edital está encerrado.</p>
                    </div>
                  )}
                </>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <footer className="border-t bg-white">
        <div className="container py-6 px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center">
              <Image src="/logo-nead.png" alt="NEAD Logo" width={100} height={30} />
              <p className="text-sm text-muted-foreground ml-4">© 2024 Sistema de Editais</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
