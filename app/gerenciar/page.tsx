import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { AdminEditaisTable } from "@/components/admin/admin-editais-table";
import { PageRefresher } from "@/components/page-refresher";

export default async function GerenciarEditaisPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.tipo !== 1) {
    redirect("/editais");
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
      <PageRefresher />
      <main className="flex-1 bg-slate-50 py-8">
        <div className="container px-4">
          <Link href="/editais" className="text-sm text-blue-600 hover:underline mb-2 inline-block">
              ← Voltar para editais
          </Link>
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
  );
}