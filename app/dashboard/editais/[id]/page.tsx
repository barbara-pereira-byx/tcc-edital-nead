import { redirect } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getCurrentUser } from "@/lib/session"
import { getEditalById } from "@/lib/data"

export default async function EditalDetailPage({ params }: { params: { id: string } }) {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/editais")
  }

  const edital = await getEditalById(params.id)

  if (!edital) {
    redirect("/dashboard/editais")
  }

  return (
    <>
      <DashboardHeader heading={edital.titulo} text="Detalhes do edital e formulário de inscrição">
        <div className="flex items-center gap-2">
          <Badge variant={edital.status === "aberto" ? "default" : "secondary"}>
            {edital.status === "aberto" ? "Aberto" : "Fechado"}
          </Badge>
          <span className="text-sm text-muted-foreground">Prazo: {edital.prazo}</span>
        </div>
      </DashboardHeader>
      <DashboardShell>
        <Tabs defaultValue="detalhes" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="detalhes">Detalhes do Edital</TabsTrigger>
            <TabsTrigger value="inscricao" disabled={edital.status !== "aberto"}>
              Formulário de Inscrição
            </TabsTrigger>
          </TabsList>
          <TabsContent value="detalhes">
            <Card>
              <CardHeader>
                <CardTitle>Informações do Edital</CardTitle>
                <CardDescription>Detalhes completos sobre o edital e requisitos</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium">Descrição</h3>
                  <p className="mt-1 text-muted-foreground">{edital.descricao}</p>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium">Departamento</h3>
                    <p className="mt-1 text-muted-foreground">{edital.departamento}</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">Vagas</h3>
                    <p className="mt-1 text-muted-foreground">{edital.vagas}</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">Valor da Bolsa</h3>
                    <p className="mt-1 text-muted-foreground">{edital.valorBolsa}</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">Carga Horária</h3>
                    <p className="mt-1 text-muted-foreground">{edital.cargaHoraria}</p>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-medium">Requisitos</h3>
                  <ul className="mt-1 list-inside list-disc text-muted-foreground">
                    {edital.requisitos.map((requisito, index) => (
                      <li key={index}>{requisito}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-medium">Documentos Necessários</h3>
                  <ul className="mt-1 list-inside list-disc text-muted-foreground">
                    {edital.documentos.map((documento, index) => (
                      <li key={index}>{documento}</li>
                    ))}
                  </ul>
                </div>
                <div className="flex justify-end">
                  {edital.status === "aberto" ? (
                    <Button>Inscrever-se</Button>
                  ) : (
                    <Button variant="outline" disabled>
                      Inscrições Encerradas
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="inscricao">
            <Card>
              <CardHeader>
                <CardTitle>Formulário de Inscrição</CardTitle>
                <CardDescription>Preencha todos os campos para se inscrever neste edital</CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label htmlFor="nome" className="text-sm font-medium">
                        Nome Completo
                      </label>
                      <input
                        id="nome"
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        defaultValue={user.name}
                        readOnly
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium">
                        E-mail
                      </label>
                      <input
                        id="email"
                        type="email"
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        defaultValue={user.email}
                        readOnly
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="cpf" className="text-sm font-medium">
                        CPF
                      </label>
                      <input
                        id="cpf"
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        placeholder="000.000.000-00"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="telefone" className="text-sm font-medium">
                        Telefone
                      </label>
                      <input
                        id="telefone"
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        placeholder="(00) 00000-0000"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="matricula" className="text-sm font-medium">
                        Matrícula
                      </label>
                      <input
                        id="matricula"
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        placeholder="Número de matrícula"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="curso" className="text-sm font-medium">
                        Curso
                      </label>
                      <input
                        id="curso"
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        placeholder="Nome do curso"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="motivacao" className="text-sm font-medium">
                      Carta de Motivação
                    </label>
                    <textarea
                      id="motivacao"
                      className="h-32 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      placeholder="Descreva sua motivação para participar deste edital"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Documentos</label>
                    <div className="rounded-md border border-dashed border-input p-6 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-8 w-8 text-muted-foreground"
                        >
                          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                          <polyline points="14 2 14 8 20 8" />
                        </svg>
                        <p className="text-sm text-muted-foreground">
                          Arraste e solte arquivos aqui ou clique para selecionar
                        </p>
                        <input type="file" className="hidden" multiple />
                        <Button variant="outline" size="sm" type="button">
                          Selecionar Arquivos
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button type="submit">Enviar Inscrição</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DashboardShell>
    </>
  )
}
