"use client"

import { useState } from "react"
import Link from "next/link"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
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
import { MoreHorizontal, Pencil, Trash2, Eye } from "lucide-react"
import { useRouter } from "next/navigation"

type Edital = {
  id: string
  titulo: string
  codigo: string
  dataPublicacao: Date
  dataInicio: Date
  dataFim: Date
  status: string
  formulario: {
    id: string
  } | null
  inscricoes: {
    id: string
  }[]
}

export function EditaisTable({ editais }: { editais: Edital[] }) {
  const router = useRouter()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editalToDelete, setEditalToDelete] = useState<string | null>(null)

  const getStatusBadge = (edital: Edital) => {
    const now = new Date()

    if (now < new Date(edital.dataPublicacao)) {
      return <Badge variant="outline">Em Breve</Badge>
    } else if (now >= new Date(edital.dataInicio) && now <= new Date(edital.dataFim)) {
      return <Badge className="bg-green-500">Inscrições Abertas</Badge>
    } else if (now > new Date(edital.dataFim)) {
      return <Badge variant="secondary">Encerrado</Badge>
    } else {
      return <Badge variant="outline">Publicado</Badge>
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/editais/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        router.refresh()
      } else {
        console.error("Erro ao excluir edital")
      }
    } catch (error) {
      console.error("Erro ao excluir edital:", error)
    } finally {
      setDeleteDialogOpen(false)
      setEditalToDelete(null)
    }
  }

  const confirmDelete = (id: string) => {
    setEditalToDelete(id)
    setDeleteDialogOpen(true)
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Código</TableHead>
            <TableHead>Título</TableHead>
            <TableHead>Publicação</TableHead>
            <TableHead>Período de Inscrição</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Inscrições</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {editais.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                Nenhum edital encontrado. Clique em "Criar Novo Edital" para começar.
              </TableCell>
            </TableRow>
          ) : (
            editais.map((edital) => (
              <TableRow key={edital.id}>
                <TableCell className="font-medium">{edital.codigo}</TableCell>
                <TableCell>{edital.titulo}</TableCell>
                <TableCell>{format(new Date(edital.dataPublicacao), "dd/MM/yyyy", { locale: ptBR })}</TableCell>
                <TableCell>
                  {format(new Date(edital.dataInicio), "dd/MM/yyyy", { locale: ptBR })} a{" "}
                  {format(new Date(edital.dataFim), "dd/MM/yyyy", { locale: ptBR })}
                </TableCell>
                <TableCell>{getStatusBadge(edital)}</TableCell>
                <TableCell>{edital.inscricoes.length}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Abrir menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/editais/${edital.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          <span>Visualizar</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/editais/${edital.id}/editar`}>
                          <Pencil className="mr-2 h-4 w-4" />
                          <span>Editar</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600 focus:text-red-600"
                        onClick={() => confirmDelete(edital.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        <span>Excluir</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso excluirá permanentemente o edital e todas as inscrições associadas a
              ele.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => editalToDelete && handleDelete(editalToDelete)}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
