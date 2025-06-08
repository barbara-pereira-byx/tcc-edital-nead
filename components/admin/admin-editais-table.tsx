"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
import { Edit, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface Edital {
  id: string
  titulo: string
  codigo?: string
  dataPublicacao: Date
  dataEncerramento?: Date | null
  formulario?: {
    id: string
  } | null
  inscricoes: {
    id: string
  }[]
}

interface AdminEditaisTableProps {
  editais: Edital[]
}

export function AdminEditaisTable({ editais }: AdminEditaisTableProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isDeleting, setIsDeleting] = useState(false)
  const [editalToDelete, setEditalToDelete] = useState<string | null>(null)
  const [editalToEncerrar, setEditalToEncerrar] = useState<string | null>(null)


  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("pt-BR")
  }

  const getStatus = (edital: Edital) => {
    const now = new Date()
    const dataPublicacao = new Date(edital.dataPublicacao)
    const dataEncerramento = edital.dataEncerramento ? new Date(edital.dataEncerramento) : null

    if (dataPublicacao > now) {
      return { label: "Em Breve", color: "bg-yellow-500" }
    } else if (dataEncerramento && dataEncerramento < now) {
      return { label: "Encerrado", color: "bg-gray-500" }
    } else {
      return { label: "Aberto", color: "bg-green-500" }
    }
  }

  const handleDelete = async (id: string) => {
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/editais/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "Edital excluído",
          description: "O edital foi excluído com sucesso",
        })
        router.refresh()
      } else {
        const error = await response.json()
        toast({
          title: "Erro ao excluir edital",
          description: error.message || "Ocorreu um erro ao tentar excluir o edital",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erro ao excluir edital",
        description: "Ocorreu um erro ao tentar excluir o edital",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setEditalToDelete(null)
    }
  }

  const handleEncerrar = async (id: string) => {
    try {
      const response = await fetch(`/api/editais/${id}/encerrar`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ dataEncerramento: new Date().toISOString() }),
      });

      if (response.ok) {
        toast({
          title: "Edital encerrado",
          description: "O edital foi encerrado com sucesso",
        });
        router.refresh();
      } else {
        const error = await response.json();
        toast({
          title: "Erro ao encerrar edital",
          description: error.message || "Ocorreu um erro ao tentar encerrar o edital",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro ao encerrar edital",
        description: "Ocorreu um erro ao tentar encerrar o edital",
        variant: "destructive",
      });
    } finally {
      setEditalToEncerrar(null);
    }
  };

  return (
    <div>
      {editais.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-muted-foreground">Nenhum edital encontrado</p>
          <Link href="/gerenciar/novo">
            <Button className="mt-4 bg-red-600 hover:bg-red-700">Criar Novo Edital</Button>
          </Link>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Título</TableHead>
              <TableHead>Publicação</TableHead>
              <TableHead>Encerramento</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {editais.map((edital) => {
              const status = getStatus(edital)
              return (
                <TableRow key={edital.id}>
                  <TableCell className="font-medium">{edital.codigo || "-"}</TableCell>
                  <TableCell>{edital.titulo}</TableCell>
                  <TableCell>{formatDate(edital.dataPublicacao)}</TableCell>
                  <TableCell>{edital.dataEncerramento ? formatDate(edital.dataEncerramento) : "-"}</TableCell>
                  <TableCell>
                    <Badge className={status.color}>{status.label}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      {/* Botão Editar */}
                      <Button variant="outline" size="icon" title="Editar edital" asChild>
                        <Link href={`/gerenciar/${edital.id}`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>

                      {/* Botão Encerrar */}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="icon" title="Encerrar edital" onClick={() => setEditalToEncerrar(edital.id)}>
                            <span className="text-yellow-600 font-bold">❌</span>
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Encerrar Edital</AlertDialogTitle>
                            <AlertDialogDescription>
                              Deseja mesmo encerrar o edital? Após encerrado, não será possível receber novas inscrições.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleEncerrar(edital.id)}
                              className="bg-yellow-600 hover:bg-yellow-700"
                            >
                              Encerrar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>

                      {/* Botão Excluir */}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="icon" title="Excluir edital" onClick={() => setEditalToDelete(edital.id)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Excluir Edital</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja excluir este edital? Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(edital.id)}
                              disabled={isDeleting}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              {isDeleting ? "Excluindo..." : "Excluir"}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
