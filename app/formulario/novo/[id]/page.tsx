import { redirect } from "next/navigation"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { FormularioForm } from "@/components/formulario-form"
import Link from "next/link"

export default async function NovoFormularioEditalPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id: editalId } = await params
  const session = await getServerSession(authOptions)

  if (!session || session.user.tipo !== 1) {
    redirect("/editais")
  }

  // Verificar se o edital existe
  const edital = await prisma.edital.findUnique({
    where: { id: editalId },
    select: {
      id: true,
      titulo: true,
      formulario: {
        select: { id: true },
      },
    },
  })

  if (!edital) {
    redirect("/gerenciar")
  }

  // Se já existe um formulário, redirecionar para edição
  if (edital.formulario) {
    redirect(`/editais/${editalId}?tab=formulario`)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 bg-slate-50 py-8">
        <div className="container px-4">
          <Link href={`/editais/${editalId}`} className="text-sm text-blue-600 hover:underline mb-2 inline-block">
            ← Voltar para edição do edital
          </Link>

          <div className="mb-6">
            <h1 className="text-2xl font-bold">Novo Formulário de Inscrição</h1>
            <p className="text-muted-foreground">
              Crie um formulário de inscrição para o edital: <span className="font-medium">{edital.titulo}</span>
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <FormularioForm editalId={editalId} />
          </div>
        </div>
      </main>
    </div>
  )
}
