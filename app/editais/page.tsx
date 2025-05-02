import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { EditalFilter } from "@/components/edital-filter"
import { EditalCard } from "@/components/edital-card"
import { MainNav } from "@/components/main-nav"
import { UserNav } from "@/components/user-nav"

export default async function EditaisPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  // Await searchParams before accessing its properties
  const params = await searchParams

  // Filtros
  const search = typeof params.search === "string" ? params.search : ""
  const status = typeof params.status === "string" ? params.status : ""
  const page = typeof params.page === "string" ? Number.parseInt(params.page) : 1
  const perPage = 12

  // Construir a query
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
      secoes: {
        take: 1,
        include: {
          topicos: {
            take: 1,
          },
        },
      },
    },
  })

  const totalEditais = await prisma.edital.count({ where })
  const totalPages = Math.ceil(totalEditais / perPage)

  return (
    <div className="flex min-h-screen flex-col">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center">
              <Image src="/logo-nead.png" alt="NEAD Logo" width={80} height={30} className="h-auto" />
            </Link>
            <MainNav />
          </div>
          <div className="flex items-center gap-4">
            <UserNav />
          </div>
        </div>
      </header>
      <main className="flex-1 bg-slate-50 py-8">
        <div className="container px-4">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Editais Disponíveis</h1>
            <div className="flex items-center gap-4">
              <form className="flex w-full max-w-sm items-center space-x-2">
                <Input type="search" placeholder="Pesquisar por título..." name="search" defaultValue={search} />
                <Button type="submit">Buscar</Button>
              </form>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 md:col-span-3">
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
                    {editais.map((edital: { id: string; titulo: string }) => (
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
                              query: { ...params, page: i + 1 },
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
      <footer className="border-t bg-white">
        <div className="container py-6 px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center">
              <Image src="/logo-nead.png" alt="NEAD Logo" width={80} height={30} className="h-auto" />
              <p className="text-sm text-muted-foreground ml-4">© 2024 Sistema de Editais</p>
            </div>
            <div className="flex items-center gap-4 mt-4 md:mt-0">
              <Link href="#" className="text-muted-foreground hover:text-foreground">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                </svg>
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                  <rect width="4" height="12" x="2" y="9" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
