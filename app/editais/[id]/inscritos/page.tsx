import { getServerSession } from "next-auth/next"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { ChevronLeft } from 'lucide-react'
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent } from "@/components/ui/card"
import { ListaInscritos } from "@/components/lista-inscritos"
import { SenhaEditalForm } from "@/components/senha-edital-form"
import { createHash } from "crypto"

export default async function InscritosPage({
  params,
  searchParams,
}: {
  params: { id: string }
  searchParams: { token?: string }
}) {
  const session = await getServerSession(authOptions)

  const edital = await prisma.edital.findUnique({
    where: { id: params.id },
    include: {
      formulario: {
        include: {
          campos: {
            orderBy: {
              id: "asc",
            },
          },
        },
      },
    },
  })

  if (!edital) {
    notFound()
  }

  // Verificar se o usuário é administrador
  const isAdmin = session?.user.tipo === 1

  // Se for administrador, permite acesso direto
  if (isAdmin) {
    // Buscar inscrições
    const inscricoes = edital.formulario
      ? await prisma.formularioUsuario.findMany({
          where: { formularioId: edital.formulario.id },
          include: { usuario: true },
          orderBy: { dataHora: "desc" },
        })
      : []

    return renderInscritosList(edital, inscricoes)
  }

  // Para usuários comuns, verificar a senha/token
  if (!edital.senha) {
    // Se o edital não tem senha configurada, não permite acesso
    return renderSenhaForm(edital, "Este edital não possui senha configurada. Entre em contato com o administrador.")
  }

  // Verificar o token na URL
  const token = searchParams.token
  
  if (!token) {
    // Se não tem token, mostrar formulário de senha
    return renderSenhaForm(edital)
  }
  
  // Verificar se o token é válido
  try {
    // Criar um hash da senha para comparação segura
    const expectedHash = createHash('sha256').update(edital.senha).digest('hex')
    
    // Verificar se o token corresponde ao hash esperado
    if (token !== expectedHash) {
      // Token inválido, mostrar formulário de senha
      return renderSenhaForm(edital, "Token inválido. Por favor, forneça a senha correta.")
    }
    
    // Token válido, buscar inscrições
    const inscricoes = edital.formulario
      ? await prisma.formularioUsuario.findMany({
          where: { formularioId: edital.formulario.id },
          include: { usuario: true },
          orderBy: { dataHora: "desc" },
        })
      : []

    return renderInscritosList(edital, inscricoes)
  } catch (error) {
    // Erro ao verificar o token, mostrar formulário de senha
    return renderSenhaForm(edital, "Erro ao verificar o token. Por favor, forneça a senha novamente.")
  }
}

// Função para renderizar o formulário de senha
function renderSenhaForm(edital: any, errorMessage?: string) {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 bg-slate-50 py-8">
        <div className="container px-4 max-w-5xl mx-auto">
          {/* Cabeçalho */}
          <div className="mb-8">
            <Link
              href={`/editais/${edital.id}`}
              className="flex items-center text-sm text-blue-600 hover:text-blue-800 mb-4 transition-colors"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Voltar para o edital
            </Link>

            <h1 className="text-2xl font-bold mb-2">{edital.titulo}</h1>
            <p className="text-muted-foreground">Acesso à lista de inscritos</p>
          </div>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-6">Verificação de Acesso</h2>
              <p className="mb-6 text-muted-foreground">
                Para acessar a lista de inscritos neste edital, é necessário fornecer a senha de acesso.
              </p>

              {errorMessage && (
                <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
                  {errorMessage}
                </div>
              )}

              {edital.senha ? (
                <SenhaEditalForm editalId={edital.id} senha={edital.senha} redirectToInscritos={true} />
              ) : (
                <p className="text-amber-600">
                  Este edital não possui senha configurada. Entre em contato com o administrador.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

// Função para renderizar a lista de inscritos
function renderInscritosList(edital: any, inscricoes: any[]) {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 bg-slate-50 py-8">
        <div className="container px-4 max-w-5xl mx-auto">
          {/* Cabeçalho */}
          <div className="mb-8">
            <Link
              href={`/editais/${edital.id}`}
              className="flex items-center text-sm text-blue-600 hover:text-blue-800 mb-4 transition-colors"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Voltar para o edital
            </Link>

            <h1 className="text-2xl font-bold mb-2">{edital.titulo}</h1>
            <p className="text-muted-foreground">Lista de inscritos no edital</p>
          </div>

          <Card>
            <CardContent className="p-6">
              <ListaInscritos inscricoes={inscricoes} formulario={edital.formulario} />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
