import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent } from "@/components/ui/card"
import { ProfileForm } from "@/components/profile-form"

export default async function PerfilPage() {
  const session = await getServerSession(authOptions)

  // Verificar se o usuário está autenticado
  if (!session) {
    redirect("/editais")
  }

  // Buscar dados completos do usuário
  const usuario = await prisma.usuario.findUnique({
    where: { id: session.user.id },
  })

  if (!usuario) {
    redirect("/editais")
  }

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 bg-slate-50 py-8">
        <div className="container px-4 max-w-3xl mx-auto">
          <Link
            href="/editais"
            className="flex items-center text-sm text-blue-600 hover:text-blue-800 mb-4 transition-colors"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Voltar para editais
          </Link>

          <h1 className="text-2xl font-bold mb-6">Meu Perfil</h1>

          <Card>
            <CardContent className="p-6">
              <ProfileForm usuario={usuario} />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
