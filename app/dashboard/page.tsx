import { redirect } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getCurrentUser } from "@/lib/session"
import { getEditais } from "@/lib/data"

export default async function DashboardPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/editais")
  }

  const editais = await getEditais()
  const inscricoesAtivas = 2 // Simulando dados
  const editaisAbertos = editais.filter((edital) => edital.status === "aberto").length

  return (
    <>
      <DashboardHeader heading="Painel" text="Bem-vindo ao seu painel de editais acadêmicos" />
      <DashboardShell>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Editais Disponíveis</CardTitle>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="h-4 w-4 text-muted-foreground"
              >
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{editaisAbertos}</div>
              <p className="text-xs text-muted-foreground">Editais com inscrições abertas</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Minhas Inscrições</CardTitle>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="h-4 w-4 text-muted-foreground"
              >
                <rect width="20" height="14" x="2" y="5" rx="2" />
                <path d="M2 10h20" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{inscricoesAtivas}</div>
              <p className="text-xs text-muted-foreground">Inscrições ativas</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Próximos Prazos</CardTitle>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="h-4 w-4 text-muted-foreground"
              >
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">Editais com prazo próximo</p>
            </CardContent>
          </Card>
        </div>
        <div className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Editais Recentes</CardTitle>
              <CardDescription>Editais publicados recentemente</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {editais.slice(0, 3).map((edital) => (
                  <div key={edital.id} className="flex items-center justify-between border-b pb-4">
                    <div>
                      <h3 className="font-medium">{edital.titulo}</h3>
                      <p className="text-sm text-muted-foreground">Prazo: {edital.prazo}</p>
                    </div>
                    <div className="flex items-center">
                      <span
                        className={`mr-2 rounded-full px-2 py-1 text-xs ${
                          edital.status === "aberto" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}
                      >
                        {edital.status === "aberto" ? "Aberto" : "Fechado"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardShell>
    </>
  )
}
