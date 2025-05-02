import { redirect } from "next/navigation"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { UserNav } from "@/components/user-nav"
import { AdminNav } from "@/components/admin-nav"
import { EditalEditForm } from "@/components/edital-edit-form"
import { FormularioEditForm } from "@/components/formulario-edit-form"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default async function EditarEditalPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.tipo !== 1) {
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
    redirect("/admin/editais")
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container flex h-16 items-center justify-between px-4">
          <AdminNav />
          <div className="flex items-center gap-4">
            <UserNav />
          </div>
        </div>
      </header>
      <main className="flex-1 bg-slate-50 py-8">
        <div className="container px-4">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Editar Edital</h1>
            <p className="text-muted-foreground">Edite as informações do edital e seu formulário de inscrição</p>
          </div>

          <Tabs defaultValue="edital" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="edital">Informações do Edital</TabsTrigger>
              <TabsTrigger value="formulario">Formulário de Inscrição</TabsTrigger>
            </TabsList>
            <TabsContent value="edital" className="bg-white rounded-lg shadow p-6">
              <EditalEditForm edital={edital} />
            </TabsContent>
            <TabsContent value="formulario" className="bg-white rounded-lg shadow p-6">
              {edital.formulario ? (
                <FormularioEditForm formulario={edital.formulario} />
              ) : (
                <div className="text-center py-8">
                  <h3 className="text-lg font-medium mb-2">Nenhum formulário associado</h3>
                  <p className="text-muted-foreground mb-4">Este edital ainda não possui um formulário de inscrição.</p>
                  <a 
                    href={`/admin/editais/novo/pages`} 
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                  >
                    Criar Formulário
                  </a>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
