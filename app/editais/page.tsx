// app/editais/page.tsx
import { getServerSession } from "next-auth/next"
import Link from "next/link"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { EditalFilter } from "@/components/edital-filter"
import { EditalCard } from "@/components/edital-card"
import ClientMenu from "../../components/client-menu"

export default async function EditaisPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const session = await getServerSession(authOptions)

  const isAdmin = session?.user?.tipo === 1

  // Filtros
  const search = typeof searchParams.search === "string" ? searchParams.search : ""
  const status = typeof searchParams.status === "string" ? searchParams.status : ""
  const page = typeof searchParams.page === "string" ? Number.parseInt(searchParams.page) : 1
  const perPage = 12

  const where: any = {}

  if (search) {
    where.OR = [
      { titulo: { contains: search, mode: "insensitive" } },
      { secoes: { some: { titulo: { contains: search, mode: "insensitive" } } } },
    ]
  }

  if (status) {
    const hoje = new Date()

    if (status === "abertos") {
      where.formulario = {
        dataInicio: { lte: hoje },
        dataFim: { gte: hoje },
      }
    } else if (status === "futuros") {
      where.formulario = {
        dataInicio: { gt: hoje },
      }
    } else if (status === "encerrados") {
      where.OR = [{ formulario: { dataFim: { lt: hoje } } }, { dataEncerramento: { lt: hoje } }]
    }
  }

  const editais = await prisma.edital.findMany({
    where,
    orderBy: { dataPublicacao: "desc" },
    skip: (page - 1) * perPage,
    take: perPage,
    include: {
      formulario: true,
    },
  })

  const totalEditais = await prisma.edital.count({ where })
  const totalPages = Math.ceil(totalEditais / perPage)

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 bg-slate-50 py-8">
        <div className="container px-4">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Editais Disponíveis</h1>
            {/* Campo de busca */}
            <div className="flex items-center gap-4">
              <form className="flex w-full max-w-sm items-center space-x-2">
                <Input type="search" placeholder="Pesquisar por título..." name="search" defaultValue={search} />
                <Button type="submit">Buscar</Button>
              </form>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 md:col-span-3">
              {/* Menu do cliente */}
              <div className="col-span-12 md:col-span-3">
                <Card>
                  <CardContent className="p-4">
                    <ClientMenu isAdmin={isAdmin} />
                  </CardContent>
                </Card>
              </div>
              {/* Filtro */}
              <Card>
                <CardContent className="p-4">
                  <h2 className="font-semibold mb-4">Filtrar</h2>
                  <EditalFilter />
                </CardContent>
              </Card>
            </div>
            <div className="col-span-12 md:col-span-9">
              {editais.length === 0 ? (
                <div className="text-center py-12">
                  <h2 className="text-xl font-semibold">Nenhum edital encontrado</h2>
                  <p className="text-muted-foreground mt-2">Tente ajustar os filtros ou a busca</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {editais.map((edital) => (
                      <Link href={`/editais/${edital.id}`} key={edital.id}>
                        <EditalCard edital={edital} />
                      </Link>
                    ))}
                  </div>

                  {totalPages > 1 && (
                    <div className="flex justify-center mt-8">
                      <nav className="flex items-center gap-1">
                        {Array.from({ length: totalPages }).map((_, i) => (
                          <Link
                            key={i}
                            href={{
                              pathname: "/editais",
                              query: { ...searchParams, page: i + 1 },
                            }}
                            className={`inline-flex h-8 w-8 items-center justify-center rounded ${
                              page === i + 1 ? "bg-primary text-primary-foreground" : "bg-background hover:bg-muted"
                            }`}
                          >
                            {i + 1}
                          </Link>
                        ))}
                      </nav>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
