"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

interface Usuario {
  id: string
  nome: string
  email: string
  cpf: string
  tipo: number
}

interface UserFormProps {
  usuario?: Usuario
}

export function UserForm({ usuario }: UserFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    nome: usuario?.nome || "",
    email: usuario?.email || "",
    cpf: usuario?.cpf || "",
    tipo: usuario?.tipo || 0,
    senha: "", // Senha só é obrigatória para novos usuários
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleTipoChange = (value: string) => {
    setFormData((prev) => ({ ...prev, tipo: Number.parseInt(value) }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Validações básicas
      if (!formData.nome || !formData.email || !formData.cpf) {
        toast({
          title: "Campos obrigatórios",
          description: "Por favor, preencha todos os campos obrigatórios.",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      // Se for um novo usuário, a senha é obrigatória
      if (!usuario && !formData.senha) {
        toast({
          title: "Senha obrigatória",
          description: "Por favor, defina uma senha para o novo usuário.",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      const url = usuario ? `/api/usuarios/${usuario.id}` : "/api/usuarios"
      const method = usuario ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast({
          title: usuario ? "Usuário atualizado" : "Usuário criado",
          description: usuario
            ? "As informações do usuário foram atualizadas com sucesso."
            : "O novo usuário foi criado com sucesso.",
        })
        router.push("/usuarios")
      } else {
        const error = await response.json()
        toast({
          title: "Erro",
          description: error.message || "Ocorreu um erro ao salvar o usuário.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao tentar salvar o usuário.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="nome">
              Nome Completo <span className="text-red-500">*</span>
            </Label>
            <Input
              id="nome"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              placeholder="Digite o nome completo"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">
              Email <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Digite o email"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="cpf">
              CPF <span className="text-red-500">*</span>
            </Label>
            <Input
              id="cpf"
              name="cpf"
              value={formData.cpf}
              onChange={handleChange}
              placeholder="Digite o CPF (apenas números)"
              required
              maxLength={11}
              disabled={!!usuario} // CPF não pode ser alterado para usuários existentes
            />
            {!!usuario && <p className="text-xs text-muted-foreground">O CPF não pode ser alterado após o cadastro.</p>}
          </div>
        </div>

        <div className="space-y-2">
          <Label>
            Tipo de Usuário <span className="text-red-500">*</span>
          </Label>
          <RadioGroup value={formData.tipo.toString()} onValueChange={handleTipoChange} className="flex space-x-4">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="0" id="usuario" />
              <Label htmlFor="usuario" className="font-normal">
                Usuário
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="1" id="admin" />
              <Label htmlFor="admin" className="font-normal">
                Administrador
              </Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label htmlFor="senha">Senha {!usuario && <span className="text-red-500">*</span>}</Label>
          <Input
            id="senha"
            name="senha"
            type="password"
            value={formData.senha}
            onChange={handleChange}
            placeholder={usuario ? "Deixe em branco para manter a senha atual" : "Digite a senha"}
            required={!usuario}
          />
          {usuario && <p className="text-xs text-muted-foreground">Preencha apenas se desejar alterar a senha.</p>}
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => router.push("/usuarios")} disabled={isLoading}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {usuario ? "Salvando..." : "Criando..."}
            </>
          ) : usuario ? (
            "Salvar Alterações"
          ) : (
            "Criar Usuário"
          )}
        </Button>
      </div>
    </form>
  )
}
