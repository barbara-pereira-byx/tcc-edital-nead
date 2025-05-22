import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Link from "next/link";
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { UserManagement } from "@/components/user-management"

export default async function GerenciarUsuariosPage() {
  const session = await getServerSession(authOptions)

  // Verificar se o usuário está autenticado e é administrador
  if (!session || session.user.tipo !== 1) {
    redirect("/editais")
  }

  // Buscar todos os usuários do sistema
  const usuarios = await prisma.usuario.findMany({
    orderBy: {
      nome: "asc",
    },
  })

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 bg-slate-50 py-8">
        <div className="container px-4">
        <Link href="/editais" className="text-sm text-blue-600 hover:underline mb-2 inline-block">
            ← Voltar para editais
        </Link>
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Gerenciamento de Usuários</h1>
            <Button asChild>
              <a href="/usuarios/novo">Novo Usuário</a>
            </Button>
          </div>

          <Card>
            <CardContent className="p-6">
              <UserManagement usuarios={usuarios} />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
