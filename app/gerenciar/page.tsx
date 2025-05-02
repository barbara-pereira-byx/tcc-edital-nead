import { redirect } from "next/navigation"
import Link from "next/link"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { UserNav } from "@/components/user-nav"
import { AdminNav } from "@/components/admin-nav"
import { Button } from "@/components/ui/button"
import { prisma } from "@/lib/prisma"
import { AdminEditaisTable } from "@/components/admin/admin-editais-table"

export default async function GerenciarEditaisPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.tipo !== 1) {
    redirect("/login")
  }

  const editais = await prisma.edital.findMany({
    include: {
      formulario: true,
      inscricoes: {
        select: {
          id: true,
        },
      },
    },
    orderBy: {
      dataPublicacao: "desc",
    },
  });

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
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold">Gerenciar Editais</h1>
              <p className="text-muted-foreground">Gerencie editais existentes ou crie novos</p>
            </div>
            <Link href="/gerenciar/novo">
              <Button className="bg-red-600 hover:bg-red-700">Criar Novo Edital</Button>
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <AdminEditaisTable editais={editais} />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
