import { getServerSession } from "next-auth/next"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent } from "@/components/ui/card"
import { UserForm } from "@/components/user-form"

export default async function EditarUsuarioPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  // Verificar se o usuário está autenticado e é administrador
  if (!session || session.user.tipo !== 1) {
    redirect("/editais")
  }

  // Buscar o usuário pelo ID
  const usuario = await prisma.usuario.findUnique({
    where: { id: params.id },
  })

  if (!usuario) {
    notFound()
  }

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 bg-slate-50 py-8">
        <div className="container px-4 max-w-3xl mx-auto">
          <Link
            href="/usuarios"
            className="flex items-center text-sm text-blue-600 hover:text-blue-800 mb-4 transition-colors"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Voltar para lista de usuários
          </Link>

          <h1 className="text-2xl font-bold mb-6">Editar Usuário</h1>

          <Card>
            <CardContent className="p-6">
              <UserForm usuario={usuario} />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
