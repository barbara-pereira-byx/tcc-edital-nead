"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"

export default function CadastroPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    nome: "",
    cpf: "",
    email: "",
    senha: "",
    confirmarSenha: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    if (formData.senha !== formData.confirmarSenha) {
      toast({
        title: "Erro no cadastro",
        description: "As senhas não coincidem",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch("/api/usuarios", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nome: formData.nome,
          cpf: formData.cpf,
          email: formData.email,
          senha: formData.senha,
          tipo: 0, // Usuário comum
        }),
      })

      if (response.ok) {
        toast({
          title: "Cadastro realizado com sucesso",
          description: "Você já pode fazer login no sistema",
        })
        router.push("/login")
      } else {
        const error = await response.json()
        toast({
          title: "Erro no cadastro",
          description: error.message || "Ocorreu um erro ao tentar cadastrar",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erro no cadastro",
        description: "Ocorreu um erro ao tentar cadastrar",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center space-y-2 text-center">
          <Image src="/logo-nead.png" alt="NEAD Logo" width={180} height={60} />
          <h1 className="text-2xl font-bold">Cadastro de Usuário</h1>
          <p className="text-sm text-muted-foreground">Preencha os dados abaixo para criar sua conta</p>
        </div>

        <div className="space-y-4 bg-white p-6 shadow-sm rounded-lg">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome Completo</Label>
              <Input id="nome" name="nome" value={formData.nome} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cpf">CPF (sem traços ou pontos)</Label>
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
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="senha">Senha</Label>
              <Input id="senha" name="senha" type="password" value={formData.senha} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmarSenha">Confirmar Senha</Label>
              <Input
                id="confirmarSenha"
                name="confirmarSenha"
                type="password"
                value={formData.confirmarSenha}
                onChange={handleChange}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Cadastrando..." : "Cadastrar"}
            </Button>
          </form>

          <div className="text-center text-sm">
            <p>
              Já tem uma conta?{" "}
              <Link href="/login" className="text-blue-600 hover:underline">
                Faça login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
