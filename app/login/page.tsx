"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { signIn, useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { status } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    cpf: "",
    senha: "",
  })

  // Resetar o estado de carregamento quando o componente é montado
  useEffect(() => {
    setIsLoading(false)
  }, [])

  // Redirecionar se já estiver autenticado
  useEffect(() => {
    if (status === "authenticated") {
      router.push("/editais")
    }
  }, [status, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    
    if (name === 'cpf') {
      // Permitir apenas números e limitar a 11 dígitos
      const numericValue = value.replace(/\D/g, '').slice(0, 11)
      setFormData((prev) => ({ ...prev, [name]: numericValue }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
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
        // Login bem-sucedido
        toast({
          title: "Login realizado",
          description: "Você foi autenticado com sucesso",
        })

        // Redirecionamento será feito pelo useEffect quando o status mudar para "authenticated"
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

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center space-y-2 text-center">
          <Image src="/logo-nead.png" alt="NEAD Logo" width={180} height={60} />
          <h1 className="text-2xl font-bold">Faça seu Login</h1>
          <p className="text-sm text-muted-foreground">
            Para ter acesso aos editais digite o seu CPF
            <br />
            (sem traços ou pontos)
          </p>
        </div>

        <div className="space-y-4 bg-white p-6 shadow-sm rounded-lg">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cpf">Digite seu CPF</Label>
              <Input
                id="cpf"
                name="cpf"
                value={formData.cpf}
                onChange={handleChange}
                placeholder="00000000000"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="senha">Digite sua senha</Label>
              <Input id="senha" name="senha" type="password" value={formData.senha} onChange={handleChange} required />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Entrando...
                </>
              ) : (
                "Entrar"
              )}
            </Button>
          </form>

          <div className="text-center text-sm">
            <p>
              Não tem login?{" "}
              <Link href="/cadastro" className="text-blue-600 hover:underline">
                Cadastre-se
              </Link>
            </p>
            <p>
              Esqueceu sua senha?{" "}
              <Link href="/recuperar-senha" className="text-blue-600 hover:underline">
                Clique aqui
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
