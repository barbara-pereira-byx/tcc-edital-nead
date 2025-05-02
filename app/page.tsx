import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="bg-white border-b">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2">
            <Image src="/logo-nead.png" alt="NEAD Logo" width={80} height={40} />
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="outline">Entrar</Button>
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1 bg-slate-50">
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Sistema de Inscrições em Editais
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl">
                  Acesse, inscreva-se e acompanhe editais acadêmicos de forma simples e eficiente.
                </p>
              </div>
              <div className="space-x-4">
                <Link href="/login">
                  <Button className="px-8">Acessar Sistema</Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-white">
          <div className="container px-4 md:px-6">
            <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-3">
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6">
                <div className="rounded-full bg-slate-100 p-4">
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
                    className="h-6 w-6"
                  >
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold">Acesso Simplificado</h3>
                <p className="text-center text-gray-500">
                  Crie sua conta e tenha acesso a todos os editais disponíveis.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6">
                <div className="rounded-full bg-slate-100 p-4">
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
                    className="h-6 w-6"
                  >
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                    <polyline points="14 2 14 8 20 8" />
                    <path d="M8 13h2" />
                    <path d="M8 17h2" />
                    <path d="M14 13h2" />
                    <path d="M14 17h2" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold">Inscrições Online</h3>
                <p className="text-center text-gray-500">
                  Preencha formulários de inscrição diretamente pela plataforma.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6">
                <div className="rounded-full bg-slate-100 p-4">
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
                    className="h-6 w-6"
                  >
                    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                    <path d="m9 12 2 2 4-4" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold">Acompanhamento</h3>
                <p className="text-center text-gray-500">
                  Acompanhe o status de suas inscrições e receba notificações.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t bg-slate-50">
        <div className="container flex flex-col gap-4 py-10 md:flex-row md:gap-8">
          <div className="flex-1 space-y-2">
            <h3 className="text-lg font-medium">Sistema de Editais</h3>
            <p className="text-sm text-gray-500">Plataforma para inscrições em editais acadêmicos.</p>
          </div>
          <div className="flex-1 space-y-2">
            <h3 className="text-sm font-medium">Links</h3>
            <ul className="grid gap-2 text-sm">
              <li>
                <Link href="#" className="text-gray-500 hover:underline">
                  Sobre
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-500 hover:underline">
                  Contato
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-500 hover:underline">
                  Termos de Uso
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t py-6">
          <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-center text-sm text-gray-500">
              © 2024 Sistema de Editais. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
