import { redirect } from "next/navigation"
import Link from "next/link"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getCurrentUser } from "@/lib/session"
import { getInscricaoById } from "@/lib/data"

export default async function InscricaoDetailPage({ params }: { params: { id: string } }) {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/ediatis")
  }

  const inscricao = await getInscricaoById(params.id)

  if (!inscricao) {
    redirect("/dashboard/inscricoes")
  }

  return (
    <>
      <DashboardHeader heading="Detalhes da Inscrição" text={`Inscrição para ${inscricao.edital.titulo}`}>
        <div className="flex items-center gap-2">
          <Badge
            variant={
              inscricao.status === "aprovado"
                ? "success"
                : inscricao.status === "pendente"
                  ? "default"
                  : inscricao.status === "rejeitado"
                    ? "destructive"
                    : "secondary"
            }
          >
            {inscricao.status === "aprovado"
              ? "Aprovado"
              : inscricao.status === "pendente"
                ? "Em Análise"
                : inscricao.status === "rejeitado"
                  ? "Rejeitado"
                  : "Finalizado"}
          </Badge>
        </div>
      </DashboardHeader>
      <DashboardShell>
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações da Inscrição</CardTitle>
              <CardDescription>Detalhes da sua inscrição no edital</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium">Data de Inscrição</h3>
                  <p className="mt-1 text-muted-foreground">{inscricao.dataInscricao}</p>
                </div>
                <div>
                  <h3 className="text-lg font-medium">Status</h3>
                  <p className="mt-1 text-muted-foreground">
                    {inscricao.status === "aprovado"
                      ? "Aprovado"
                      : inscricao.status === "pendente"
                        ? "Em Análise"
                        : inscricao.status === "rejeitado"
                          ? "Rejeitado"
                          : "Finalizado"}
                  </p>
                </div>
              </div>
              {inscricao.feedback && (
                <div>
                  <h3 className="text-lg font-medium">Feedback</h3>
                  <p className="mt-1 text-muted-foreground">{inscricao.feedback}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Dados do Edital</CardTitle>
              <CardDescription>Informações sobre o edital</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-medium">Título</h3>
                <p className="mt-1 text-muted-foreground">{inscricao.edital.titulo}</p>
              </div>
              <div>
                <h3 className="text-lg font-medium">Descrição</h3>
                <p className="mt-1 text-muted-foreground">{inscricao.edital.descricao}</p>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium">Departamento</h3>
                  <p className="mt-1 text-muted-foreground">{inscricao.edital.departamento}</p>
                </div>
                <div>
                  <h3 className="text-lg font-medium">Prazo</h3>
                  <p className="mt-1 text-muted-foreground">{inscricao.edital.prazo}</p>
                </div>
                <div>
                  <h3 className="text-lg font-medium">Valor da Bolsa</h3>
                  <p className="mt-1 text-muted-foreground">{inscricao.edital.valorBolsa}</p>
                </div>
                <div>
                  <h3 className="text-lg font-medium">Carga Horária</h3>
                  <p className="mt-1 text-muted-foreground">{inscricao.edital.cargaHoraria}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Dados da Inscrição</CardTitle>
              <CardDescription>Informações fornecidas no formulário de inscrição</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium">Nome</h3>
                  <p className="mt-1 text-muted-foreground">{inscricao.nome}</p>
                </div>
                <div>
                  <h3 className="text-lg font-medium">E-mail</h3>
                  <p className="mt-1 text-muted-foreground">{inscricao.email}</p>
                </div>
                <div>
                  <h3 className="text-lg font-medium">CPF</h3>
                  <p className="mt-1 text-muted-foreground">{inscricao.cpf}</p>
                </div>
                <div>
                  <h3 className="text-lg font-medium">Telefone</h3>
                  <p className="mt-1 text-muted-foreground">{inscricao.telefone}</p>
                </div>
                <div>
                  <h3 className="text-lg font-medium">Matrícula</h3>
                  <p className="mt-1 text-muted-foreground">{inscricao.matricula}</p>
                </div>
                <div>
                  <h3 className="text-lg font-medium">Curso</h3>
                  <p className="mt-1 text-muted-foreground">{inscricao.curso}</p>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium">Carta de Motivação</h3>
                <p className="mt-1 text-muted-foreground">{inscricao.motivacao}</p>
              </div>
              <div>
                <h3 className="text-lg font-medium">Documentos Enviados</h3>
                <ul className="mt-1 list-inside list-disc text-muted-foreground">
                  {inscricao.documentos.map((documento, index) => (
                    <li key={index}>
                      <a href="#" className="text-blue-600 hover:underline">
                        {documento}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Link href="/dashboard/inscricoes">
              <Button variant="outline">Voltar</Button>
            </Link>
            {inscricao.status === "pendente" && <Button variant="destructive">Cancelar Inscrição</Button>}
          </div>
        </div>
      </DashboardShell>
    </>
  )
}
