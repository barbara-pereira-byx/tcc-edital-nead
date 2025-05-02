import { redirect } from "next/navigation"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { FormularioForm } from "@/components/formulario-form"

export default async function NovoFormularioPage({
  searchParams,
}: {
  searchParams: { editalId?: string }
}) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.tipo !== 1) {
    redirect("/editais")
  }

  const { editalId } = searchParams

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 bg-slate-50 py-8">
        <div className="container px-4">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Novo Formulário de Inscrição</h1>
            <p className="text-muted-foreground">
              {editalId
                ? "Crie um formulário de inscrição para o edital selecionado"
                : "Crie um novo formulário de inscrição"}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <FormularioForm
              editalId={editalId}
              onFormularioCreated={(formularioId) => {
                if (editalId) {
                  redirect(`/admin/editais/${editalId}?tab=formulario`)
                } else {
                  redirect("/admin/formularios")
                }
              }}
            />
          </div>
        </div>
      </main>
    </div>
  )
}
