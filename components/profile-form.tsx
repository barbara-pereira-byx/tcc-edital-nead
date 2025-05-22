"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Loader2, AlertTriangle } from "lucide-react"

interface Usuario {
  id: string
  nome: string
  email: string
  cpf: string
  tipo: number
}

interface ProfileFormProps {
  usuario: Usuario
}

export function ProfileForm({ usuario }: ProfileFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [formData, setFormData] = useState({
    nome: usuario.nome || "",
    email: usuario.email || "",
    senhaAtual: "",
    novaSenha: "",
    confirmarSenha: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Validações básicas
      if (!formData.nome || !formData.email) {
        toast({
          title: "Campos obrigatórios",
          description: "Por favor, preencha todos os campos obrigatórios.",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      // Validar senhas se estiver alterando
      if (formData.novaSenha || formData.confirmarSenha || formData.senhaAtual) {
        if (!formData.senhaAtual) {
          toast({
            title: "Senha atual obrigatória",
            description: "Por favor, informe sua senha atual para alterá-la.",
            variant: "destructive",
          })
          setIsLoading(false)
          return
        }

        if (formData.novaSenha !== formData.confirmarSenha) {
          toast({
            title: "Senhas não conferem",
            description: "A nova senha e a confirmação não são iguais.",
            variant: "destructive",
          })
          setIsLoading(false)
          return
        }
      }

      const response = await fetch(`/api/usuarios/${usuario.id}/perfil`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nome: formData.nome,
          email: formData.email,
          senhaAtual: formData.senhaAtual || undefined,
          novaSenha: formData.novaSenha || undefined,
        }),
      })

      if (response.ok) {
        toast({
          title: "Perfil atualizado",
          description: "Suas informações foram atualizadas com sucesso.",
        })

        // Limpar campos de senha
        setFormData((prev) => ({
          ...prev,
          senhaAtual: "",
          novaSenha: "",
          confirmarSenha: "",
        }))

        // Atualizar a sessão
        router.refresh()
      } else {
        const error = await response.json()
        toast({
          title: "Erro",
          description: error.message || "Ocorreu um erro ao atualizar o perfil.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao tentar atualizar o perfil.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/usuarios/${usuario.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "Conta excluída",
          description: "Sua conta foi excluída com sucesso.",
        })

        // Fazer logout após excluir a conta
        await signOut({ redirect: false })
        router.push("/editais")
      } else {
        const error = await response.json()
        toast({
          title: "Erro ao excluir conta",
          description: error.message || "Ocorreu um erro ao excluir sua conta.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erro ao excluir conta",
        description: "Ocorreu um erro ao tentar excluir sua conta.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Informações Pessoais</h2>

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
                placeholder="Digite seu nome completo"
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
                placeholder="Digite seu email"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cpf">CPF</Label>
              <Input
                id="cpf"
                value={usuario.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")}
                disabled
                className="bg-slate-50"
              />
              <p className="text-xs text-muted-foreground">O CPF não pode ser alterado.</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tipo">Tipo de Usuário</Label>
            <Input
              id="tipo"
              value={usuario.tipo === 1 ? "Administrador" : "Usuário"}
              disabled
              className="bg-slate-50"
            />
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Alterar Senha</h2>
          <p className="text-sm text-muted-foreground">
            Preencha os campos abaixo apenas se desejar alterar sua senha atual.
          </p>

          <div className="space-y-2">
            <Label htmlFor="senhaAtual">Senha Atual</Label>
            <Input
              id="senhaAtual"
              name="senhaAtual"
              type="password"
              value={formData.senhaAtual}
              onChange={handleChange}
              placeholder="Digite sua senha atual"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="novaSenha">Nova Senha</Label>
              <Input
                id="novaSenha"
                name="novaSenha"
                type="password"
                value={formData.novaSenha}
                onChange={handleChange}
                placeholder="Digite a nova senha"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmarSenha">Confirmar Nova Senha</Label>
              <Input
                id="confirmarSenha"
                name="confirmarSenha"
                type="password"
                value={formData.confirmarSenha}
                onChange={handleChange}
                placeholder="Confirme a nova senha"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando...
              </>
            ) : (
              "Salvar Alterações"
            )}
          </Button>
        </div>
      </form>

      <Separator />

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-red-600">Zona de Perigo</h2>
        <p className="text-sm text-muted-foreground">
          Ao excluir sua conta, todos os seus dados e inscrições serão permanentemente removidos do sistema. Esta ação
          não pode ser desfeita.
        </p>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" disabled={isDeleting}>
              Excluir Minha Conta
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir Conta</AlertDialogTitle>
              <AlertDialogDescription>
                Você tem certeza que deseja excluir sua conta?
                <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded-md flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <span className="text-amber-800 text-sm">
                    Esta ação não pode ser desfeita. Sua conta será permanentemente removida do sistema, incluindo todas
                    as suas inscrições.
                  </span>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={(e) => {
                  e.preventDefault()
                  handleDeleteAccount()
                }}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Excluindo...
                  </>
                ) : (
                  "Sim, excluir minha conta"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}
