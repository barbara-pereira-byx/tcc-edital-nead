"use client"

import { useState } from "react"
import { signOut, signIn, useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import {
  LogOut,
  User,
  Lock,
  FileText,
  Users,
  ClipboardList,
  ChevronRight,
  UserPlus,
  Loader2,
} from "lucide-react"
import { cn } from "@/lib/utils"

export default function ClientMenu() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    cpf: "",
    senha: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleLogout = async () => {
    setIsLoading(true)
    await signOut({ redirect: false })
    router.refresh() // força atualização da página após logout
    setIsLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await signIn("credentials", {
        cpf: formData.cpf,
        senha: formData.senha,
        redirect: false,
      })

      if (result?.error) {
        toast({
          title: "Erro ao fazer login",
          description: "CPF ou senha inválidos",
          variant: "destructive",
        })
        setIsLoading(false)
      } else {
        router.refresh()
        setIsLoading(false)
      }
    } catch (error) {
      toast({
        title: "Erro ao fazer login",
        description: "Ocorreu um erro ao tentar fazer login",
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }

  const getInitials = (name: string) => {
    if (!name) return "U"
    const names = name.split(" ")
    return (names[0][0] + names[names.length - 1][0]).toUpperCase()
  }

  if (status === "loading" || (status === "authenticated" && !session)) {
    return (
      <Card className="w-full overflow-hidden border border-slate-200">
        <div className="flex justify-center items-center h-40">
          <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
        </div>
      </Card>
    )
  }

  if (status === "unauthenticated") {
    return (
      <Card className="w-full overflow-hidden border border-slate-200">
        <CardContent className="p-4 pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cpf" className="text-sm font-medium flex items-center">
                <User className="mr-2 h-4 w-4 text-slate-500" /> CPF
              </Label>
              <div className="relative">
                <Input
                  id="cpf"
                  name="cpf"
                  value={formData.cpf}
                  onChange={handleChange}
                  placeholder="Digite seu CPF"
                  className="pl-8 border-slate-300 focus:border-blue-500"
                  required
                />
                <User className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="senha" className="text-sm font-medium flex items-center">
                <Lock className="mr-2 h-4 w-4 text-slate-500" /> Senha
              </Label>
              <div className="relative">
                <Input
                  id="senha"
                  name="senha"
                  type="password"
                  value={formData.senha}
                  onChange={handleChange}
                  placeholder="Digite sua senha"
                  className="pl-8 border-slate-300 focus:border-blue-500"
                  required
                />
                <Lock className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              </div>
            </div>
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Entrando...
                </>
              ) : (
                "Entrar"
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="bg-slate-50 p-4 flex flex-col items-center">
          <p className="text-sm text-slate-600 mb-2">Não tem uma conta?</p>
          <Link
            href="/cadastro"
            className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center transition-colors"
          >
            <UserPlus className="mr-1 h-4 w-4" /> Cadastre-se agora
            <ChevronRight className="ml-1 h-4 w-4" />
          </Link>
        </CardFooter>
      </Card>
    )
  }

  const isAdmin = session?.user?.tipo === 1

  return (
    <Card className="w-full overflow-hidden border border-slate-200">
      <CardContent className="p-0">
        <div className="py-2">
          <div className="px-4 py-2">
            <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Menu</h3>
          </div>
          <ul className="space-y-1 px-2">
            {isAdmin ? (
              <>
                <li>
                  <Link
                    href="/gerenciar"
                    className="flex items-center text-slate-700 hover:bg-blue-50 hover:text-blue-700 px-3 py-2 rounded-md transition-colors"
                  >
                    <FileText className="mr-2 h-5 w-5 text-blue-600" />
                    <span>Gerenciar Editais</span>
                    <ChevronRight className="ml-auto h-4 w-4 text-slate-400" />
                  </Link>
                </li>
                <li>
                  <Link
                    href="/usuarios"
                    className="flex items-center text-slate-700 hover:bg-blue-50 hover:text-blue-700 px-3 py-2 rounded-md transition-colors"
                  >
                    <Users className="mr-2 h-5 w-5 text-blue-600" />
                    <span>Gerenciar Usuários</span>
                    <ChevronRight className="ml-auto h-4 w-4 text-slate-400" />
                  </Link>
                </li>
                <li>
                  <Link
                    href="/perfil"
                    className="flex items-center text-slate-700 hover:bg-blue-50 hover:text-blue-700 px-3 py-2 rounded-md transition-colors"
                  >
                    <User className="mr-2 h-5 w-5 text-blue-600" />
                    <span>Meu Perfil</span>
                    <ChevronRight className="ml-auto h-4 w-4 text-slate-400" />
                  </Link>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link
                    href="/inscricoes"
                    className="flex items-center text-slate-700 hover:bg-blue-50 hover:text-blue-700 px-3 py-2 rounded-md transition-colors"
                  >
                    <ClipboardList className="mr-2 h-5 w-5 text-blue-600" />
                    <span>Minhas Inscrições</span>
                    <ChevronRight className="ml-auto h-4 w-4 text-slate-400" />
                  </Link>
                </li>
                <li>
                  <Link
                    href="/perfil"
                    className="flex items-center text-slate-700 hover:bg-blue-50 hover:text-blue-700 px-3 py-2 rounded-md transition-colors"
                  >
                    <User className="mr-2 h-5 w-5 text-blue-600" />
                    <span>Meu Perfil</span>
                    <ChevronRight className="ml-auto h-4 w-4 text-slate-400" />
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
        <Separator className="my-2" />
        <div className="p-3">
          <Button
            onClick={handleLogout}
            variant="outline"
            className={cn(
              "w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300",
              isLoading && "opacity-70 cursor-not-allowed"
            )}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saindo...
              </>
            ) : (
              <>
                <LogOut className="mr-2 h-4 w-4" /> Sair da conta
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
