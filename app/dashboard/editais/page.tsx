import Link from "next/link"
import { redirect } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getCurrentUser } from "@/lib/session"
import { getEditais } from "@/lib/data"

export default async function EditaisPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  const editais = await getEditais()

  return (
    <>
      <DashboardHeader heading="Editais Disponíveis" text="Confira os editais disponíveis para inscrição" />
      <DashboardShell>
        <div className="grid gap-4">
          {editais.map((edital) => (
            <Card key={edital.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{edital.titulo}</CardTitle>
                    <CardDescription className="mt-1">{edital.descricao}</CardDescription>
                  </div>
                  <Badge variant={edital.status === "aberto" ? "default" : "secondary"}>
                    {edital.status === "aberto" ? "Aberto" : "Fechado"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="font-medium">Departamento</div>
                      <div className="text-muted-foreground">{edital.departamento}</div>
                    </div>
                    <div>
                      <div className="font-medium">Prazo</div>
                      <div className="text-muted-foreground">{edital.prazo}</div>
                    </div>
                    <div>
                      <div className="font-medium">Vagas</div>
                      <div className="text-muted-foreground">{edital.vagas}</div>
                    </div>
                    <div>
                      <div className="font-medium">Valor da Bolsa</div>
                      <div className="text-muted-foreground">{edital.valorBolsa}</div>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Link href={`/dashboard/editais/${edital.id}`}>
                      <Button
                        variant={edital.status === "aberto" ? "default" : "outline"}
                        disabled={edital.status !== "aberto"}
                      >
                        {edital.status === "aberto" ? "Ver Detalhes" : "Inscrições Encerradas"}
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </DashboardShell>
    </>
  )
}
