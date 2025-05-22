"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/components/ui/use-toast"
import { Search, Edit, Trash, AlertTriangle, Loader2 } from "lucide-react"

interface Usuario {
  id: string
  nome: string
  email: string
  cpf: string
  tipo: number
}

interface UserManagementProps {
  usuarios: Usuario[]
}

export function UserManagement({ usuarios }: UserManagementProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedUser, setSelectedUser] = useState<Usuario | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Filtrar usuários com base no termo de busca
  const filteredUsers = usuarios.filter(
    (usuario) =>
      usuario.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usuario.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usuario.cpf.includes(searchTerm),
  )

  // Função para excluir um usuário
  const deleteUser = async () => {
    if (!selectedUser) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/usuarios/${selectedUser.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "Usuário excluído",
          description: "O usuário foi excluído com sucesso.",
        })
        setIsDeleteDialogOpen(false)
        router.refresh()
      } else {
        const error = await response.json()
        toast({
          title: "Erro ao excluir usuário",
          description: error.message || "Ocorreu um erro ao excluir o usuário.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erro ao excluir usuário",
        description: "Ocorreu um erro ao tentar excluir o usuário.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Função para formatar CPF
  const formatCPF = (cpf: string) => {
    if (!cpf) return ""
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
  }

  return (
    <div className="space-y-4">
      {/* Barra de busca */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar por nome, email ou CPF..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button asChild>
          <a href="/usuarios/novo">Novo Usuário</a>
        </Button>
      </div>

      {/* Tabela de usuários */}
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>CPF</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((usuario) => (
                <TableRow key={usuario.id}>
                  <TableCell className="font-medium">{usuario.nome}</TableCell>
                  <TableCell>{usuario.email}</TableCell>
                  <TableCell>{formatCPF(usuario.cpf)}</TableCell>
                  <TableCell>
                    <Badge variant={usuario.tipo === 1 ? "default" : "secondary"}>
                      {usuario.tipo === 1 ? "Administrador" : "Usuário"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => router.push(`/usuarios/${usuario.id}`)}>
                        <Edit className="h-4 w-4 mr-1" /> Editar
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-800 hover:bg-red-100"
                        onClick={() => {
                          setSelectedUser(usuario)
                          setIsDeleteDialogOpen(true)
                        }}
                      >
                        <Trash className="h-4 w-4 mr-1" /> Excluir
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                  Nenhum resultado encontrado para "{searchTerm}"
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Diálogo de confirmação para excluir usuário */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Usuário</AlertDialogTitle>
            <AlertDialogDescription>
              Você tem certeza que deseja excluir o usuário <strong>{selectedUser?.nome}</strong>?
              <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded-md flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <span className="text-amber-800 text-sm">
                  Esta ação não pode ser desfeita. O usuário será permanentemente removido do sistema, incluindo todas
                  as suas inscrições.
                </span>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                deleteUser()
              }}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Excluindo...
                </>
              ) : (
                "Sim, excluir usuário"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
