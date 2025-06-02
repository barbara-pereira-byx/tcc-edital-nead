"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, FileEdit, Eye, Trash2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Row } from '@tanstack/react-table'
import { Badge } from "@/components/ui/badge"
import { useState } from "react"
import { useRouter } from "next/navigation"
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
import { Edital as PrismaEdital } from "@prisma/client";

export type EditalExtendido = PrismaEdital & {
  formulario?: {
    dataInicio?: string | Date | null;
    dataFim?: string | Date | null;
    inscricoes?: number;
  };
  _count?: {
    formulario?: {
      inscricoes?: number;
    };
  };
};

export const columns = [
  {
    accessorKey: "titulo",
    header: "Título",
    cell: ({ row }: { row: Row<EditalExtendido> }) => {
      const edital = row.original
      return (
        <div className="max-w-[500px] truncate font-medium">
          {edital && edital.id ? (
            <Link href={`/editais/${edital.id}`} className="hover:underline">
              {edital.titulo}
            </Link>
          ) : (
            <span>{edital?.titulo || "Título não disponível"}</span>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: "dataPublicacao",
    header: "Data de Publicação",
    cell: ({ row }: { row: Row<EditalExtendido> }) => {
      const date = row.getValue("dataPublicacao") as string | number | Date | null | undefined;
      return <div>{date ? new Date(date).toLocaleDateString("pt-BR") : "Data não disponível"}</div>;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }: { row: Row<EditalExtendido> }) => {
      const edital = row.original
      const hoje = new Date()
      const dataInicio = edital?.formulario?.dataInicio ? new Date(edital.formulario.dataInicio) : null
      const dataFim = edital?.formulario?.dataFim ? new Date(edital.formulario.dataFim) : null
      const dataEncerramento = edital?.dataEncerramento ? new Date(edital.dataEncerramento) : null

      let status = "Indisponível"
      let variant = "secondary"

      if (dataInicio && dataFim) {
        if (hoje < dataInicio) {
          status = "Em Breve"
          variant = "warning"
        } else if (hoje >= dataInicio && hoje <= dataFim) {
          status = "Inscrições Abertas"
          variant = "default"
        } else if (dataEncerramento && hoje <= dataEncerramento) {
          status = "Inscrições Encerradas"
          variant = "destructive"
        } else if (dataEncerramento && hoje > dataEncerramento) {
          status = "Edital Encerrado"
          variant = "secondary"
        }
      }

      return <Badge variant={variant as any}>{status}</Badge>
    },
  },
  {
    accessorKey: "inscricoes",
    header: "Inscrições",
    cell: ({ row }: { row: Row<EditalExtendido> }) => {
      const edital = row.original
      const count = edital?._count?.formulario?.inscricoes || 0
      return <div className="text-center">{count}</div>
    },
  },
  {
    id: "actions",
    cell: ({ row }: { row: Row<EditalExtendido> }) => {
      const edital = row.original
      const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
      const router = useRouter()
      const { toast } = useToast()

      // If edital is undefined or doesn't have an id, don't render the actions
      if (!edital || !edital.id) {
        return null
      }

      const handleDelete = async () => {
        try {
          const response = await fetch(`/api/editais/${edital.id}`, {
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
          setIsDeleteDialogOpen(false)
        }
      }

      return (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Abrir menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Ações</DropdownMenuLabel>
              <DropdownMenuItem asChild>
                <Link href={`/editais/${edital.id}`}>
                  <FileEdit className="mr-2 h-4 w-4" />
                  Editar
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/editais/${edital.id}`} target="_blank">
                  <Eye className="mr-2 h-4 w-4" />
                  Visualizar
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={() => setIsDeleteDialogOpen(true)}>
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta ação não pode ser desfeita. Isso excluirá permanentemente o edital "{edital.titulo}" e todas as
                  inscrições associadas a ele.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                  Excluir
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )
    },
  },
]
