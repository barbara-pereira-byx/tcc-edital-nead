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
  const dataInicio = typeof searchParams.dataInicio === "string" ? searchParams.dataInicio : ""
  const dataFim = typeof searchParams.dataFim === "string" ? searchParams.dataFim : ""
  const page = typeof searchParams.page === "string" ? Number.parseInt(searchParams.page) : 1
  const perPage = 12

  const where: any = {}
  const hoje = new Date()

  // Filtro por título
  if (search) {
    where.titulo = { contains: search, mode: "insensitive" }
  }

  // Filtro por status
  if (status) {
    if (status === "abertos") {
      // Editais abertos: data de publicação já passou e data de encerramento ainda não chegou
      where.dataPublicacao = { lte: hoje }
      where.dataEncerramento = { gt: hoje }
    } else if (status === "futuros") {
      // Editais futuros: data de publicação está no futuro
      where.dataPublicacao = { gt: hoje }
    } else if (status === "encerrados") {
      // Editais encerrados: data de encerramento já passou
      where.dataEncerramento = { lte: hoje }
    }
  }

  // Filtro por período de publicação (se não houver filtro por status)
  if (dataInicio && !status) {
    where.dataPublicacao = {
      ...where.dataPublicacao,
      gte: new Date(dataInicio),
    }
  }

  if (dataFim && !status) {
    const fimDate = new Date(dataFim)
    fimDate.setHours(23, 59, 59, 999) // Ajusta para o final do dia

    where.dataPublicacao = {
      ...where.dataPublicacao,
      lte: fimDate,
    }
  }

  // Busca os editais com os filtros aplicados
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
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
            <h1 className="text-2xl font-bold">Editais Disponíveis</h1>
            {/* Campo de busca */}
            <div className="flex items-center gap-4">
              <form className="flex w-full max-w-sm items-center space-x-2">
                <Input
                  type="search"
                  placeholder="Pesquisar por título..."
                  name="search"
                  defaultValue={search}
                  className="min-w-[200px]"
                />
                <Button type="submit">Buscar</Button>
              </form>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 md:col-span-3 space-y-4">
              {/* Menu do cliente */}
              <Card>
                <CardContent className="p-4">
                  <ClientMenu isAdmin={isAdmin} />
                </CardContent>
              </Card>

              {/* Filtro */}
              <Card>
                <CardContent className="p-4">
                  <h2 className="font-semibold mb-4">Filtrar Editais</h2>
                  <EditalFilter
                    currentStatus={status}
                    currentDataInicio={dataInicio}
                    currentDataFim={dataFim}
                    currentSearch={search}
                  />
                </CardContent>
              </Card>

              {/* Estatísticas */}
              <Card>
                <CardContent className="p-4">
                  <h2 className="font-semibold mb-2">Resultados</h2>
                  <p className="text-sm text-muted-foreground">
                    {totalEditais} {totalEditais === 1 ? "edital encontrado" : "editais encontrados"}
                  </p>
                  {(search || status || dataInicio || dataFim) && (
                    <div className="mt-2">
                      <Link href="/editais" className="text-sm text-primary hover:underline">
                        Limpar todos os filtros
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="col-span-12 md:col-span-9">
              {editais.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                  <h2 className="text-xl font-semibold">Nenhum edital encontrado</h2>
                  <p className="text-muted-foreground mt-2">Tente ajustar os filtros ou a busca</p>
                  <Button asChild className="mt-4">
                    <Link href="/editais">Limpar filtros</Link>
                  </Button>
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
                        {Array.from({ length: totalPages }).map((_, i) => {
                          // Remover a página atual dos parâmetros para evitar duplicação
                          const queryParams = { ...searchParams }
                          delete queryParams.page

                          return (
                            <Link
                              key={i}
                              href={{
                                pathname: "/editais",
                                query: { ...queryParams, page: i + 1 },
                              }}
                              className={`inline-flex h-8 w-8 items-center justify-center rounded ${
                                page === i + 1 ? "bg-primary text-primary-foreground" : "bg-background hover:bg-muted"
                              }`}
                            >
                              {i + 1}
                            </Link>
                          )
                        })}
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
