import { redirect } from "next/navigation"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { EditalEditForm } from "@/components/edital-edit-form"
import { FormularioEditForm } from "@/components/formulario-edit-form"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import {
  ChevronLeft,
  FileIcon as FilePdf,
} from "lucide-react"
import { PageRefresher } from "@/components/page-refresher"

export default async function EditarEditalPage({ params }: { params: { id: string } }) {
  // Corrigindo o erro de parâmetros dinâmicos
  // Garantindo que params.id é uma string válida antes de usar
  const id = params?.id || ""

  const session = await getServerSession(authOptions)

  if (!session || session.user.tipo !== 1) {
    redirect("/editais")
  }

  const edital = await prisma.edital.findUnique({
    where: { id },
    include: {
      arquivos: true,
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
    redirect("/gerenciar")
  }

  const editalWithStringDates = {
  ...edital,
  dataCriacao: edital.dataCriacao.toISOString(),
  dataPublicacao: edital.dataPublicacao.toISOString(),
  dataEncerramento: edital.dataEncerramento.toISOString(),
  updatedAt: edital.updatedAt?.toISOString(),
  createdAt: edital.createdAt?.toISOString(),
};

  return (
    <div className="flex min-h-screen flex-col">
      <PageRefresher />
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
            <Link
              href="/gerenciar"
              className="flex items-center text-sm text-blue-600 hover:text-blue-800 transition-colors"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Voltar para gerenciador de editais
            </Link>
          </div>
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
              <EditalEditForm
                edital={{
                  ...edital,
                  dataCriacao: edital.dataCriacao.toISOString(),
                  dataPublicacao: edital.dataPublicacao.toISOString(),
                  dataEncerramento: edital.dataEncerramento.toISOString(),
                }}
              />
            </TabsContent>
            <TabsContent value="formulario" className="bg-white rounded-lg shadow p-6">
              {edital.formulario ? (
                <FormularioEditForm formulario={edital.formulario} />
              ) : (
                <div className="text-center py-8">
                  <h3 className="text-lg font-medium mb-2">Nenhum formulário associado</h3>
                  <p className="text-muted-foreground mb-4">Este edital ainda não possui um formulário de inscrição.</p>
                  <Link
                    href={`/formulario/novo/${edital.id}`}
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                  >
                    Criar Formulário
                  </Link>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
