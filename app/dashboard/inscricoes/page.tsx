import Link from "next/link"
import { redirect } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getCurrentUser } from "@/lib/session"
import { getInscricoes } from "@/lib/data"

export default async function InscricoesPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/editais")
  }

  const inscricoes = await getInscricoes()

  return (
    <>
      <DashboardHeader heading="Minhas Inscrições" text="Acompanhe o status das suas inscrições em editais" />
      <DashboardShell>
        {inscricoes.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Nenhuma inscrição encontrada</CardTitle>
              <CardDescription>Você ainda não se inscreveu em nenhum edital.</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/dashboard/editais">
                <Button>Ver Editais Disponíveis</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {inscricoes.map((inscricao) => (
              <Card key={inscricao.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{inscricao.edital.titulo}</CardTitle>
                      <CardDescription className="mt-1">
                        Inscrição realizada em {inscricao.dataInscricao}
                      </CardDescription>
                    </div>
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
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="font-medium">Departamento</div>
                        <div className="text-muted-foreground">{inscricao.edital.departamento}</div>
                      </div>
                      <div>
                        <div className="font-medium">Prazo</div>
                        <div className="text-muted-foreground">{inscricao.edital.prazo}</div>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <Link href={`/dashboard/inscricoes/${inscricao.id}`}>
                        <Button variant="outline">Ver Detalhes</Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </DashboardShell>
    </>
  )
}
