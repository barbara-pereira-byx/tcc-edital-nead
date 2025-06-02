"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"

// Função para validar CPF
function isValidCPF(cpf: string) {
  cpf = cpf.replace(/[^\d]+/g, "")
  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false

  let sum = 0
  let remainder

  for (let i = 1; i <= 9; i++) sum += parseInt(cpf.substring(i - 1, i)) * (11 - i)
  remainder = (sum * 10) % 11
  if (remainder === 10 || remainder === 11) remainder = 0
  if (remainder !== parseInt(cpf.substring(9, 10))) return false

  sum = 0
  for (let i = 1; i <= 10; i++) sum += parseInt(cpf.substring(i - 1, i)) * (12 - i)
  remainder = (sum * 10) % 11
  if (remainder === 10 || remainder === 11) remainder = 0
  if (remainder !== parseInt(cpf.substring(10, 11))) return false

  return true
}

// Função para validar e-mail
function isValidEmail(email: string) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email)
}

// Função para validar senha
function isStrongPassword(password: string) {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/
  return regex.test(password)
}

// Função para validar nome completo (mínimo nome + sobrenome, apenas letras e espaços)
function isValidName(name: string) {
  const regex = /^[A-Za-zÀ-ú\s]+$/
  const isValidChars = regex.test(name)
  const words = name.trim().split(/\s+/)
  return isValidChars && words.length >= 2
}

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

    if (name === "cpf") {
      // Bloqueia entrada para mais que 11 dígitos e remove qualquer caractere que não seja número
      if (value.length > 11) return
      setFormData((prev) => ({ ...prev, [name]: value.replace(/\D/g, "") }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Valida nome
    if (!isValidName(formData.nome)) {
      toast({
        title: "Erro no cadastro",
        description: "Digite um nome válido com nome e sobrenome (apenas letras e espaços)",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    // Valida CPF
    if (formData.cpf.length !== 11 || !isValidCPF(formData.cpf)) {
      toast({
        title: "Erro no cadastro",
        description: "Digite um CPF válido com 11 dígitos",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    // Valida e-mail
    if (!isValidEmail(formData.email)) {
      toast({
        title: "Erro no cadastro",
        description: "Digite um e-mail válido",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    // Valida senha forte
    if (!isStrongPassword(formData.senha)) {
      toast({
        title: "Erro no cadastro",
        description:
          "A senha deve ter no mínimo 8 caracteres, incluindo letra maiúscula, minúscula, número e caractere especial",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    // Confirmação de senha
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
      // Converte nome para maiúsculas antes de enviar
      const nomeMaiusculo = formData.nome.toUpperCase()

      // Primeiro: faz o cadastro do usuário
      const response = await fetch("/api/usuarios", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nome: nomeMaiusculo,
          cpf: formData.cpf,
          email: formData.email,
          senha: formData.senha,
          tipo: 0, // Usuário comum
        }),
      })

      if (response.ok) {
        // Segundo: envia e-mail de confirmação (supondo que o endpoint exista)
        await fetch("/api/email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: formData.email,
            nome: nomeMaiusculo,
          }),
        })

        toast({
          title: "Cadastro realizado com sucesso",
          description: "Verifique sua caixa de e-mail para a confirmação!",
        })
        router.push("/editais")
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
              <Label htmlFor="cpf">CPF (somente números)</Label>
              <Input
                id="cpf"
                name="cpf"
                value={formData.cpf}
                onChange={handleChange}
                placeholder="00000000000"
                required
                maxLength={11}
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
              <Link href="/editais" className="text-blue-600 hover:underline">
                Faça login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
