"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MoreHorizontal } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Row } from '@tanstack/react-table'

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
          <Link href={`/editais/${edital.id}`} className="hover:underline">
            {edital.titulo}
          </Link>
        </div>
      )
    },
  },
  {
    accessorKey: "dataPublicacao",
    header: "Data de Publicação",
    cell: ({ row }: { row: Row<EditalExtendido> }) => {
      const date = new Date(row.getValue("dataPublicacao"))
      return <div>{date.toLocaleDateString("pt-BR")}</div>
    },
  },
  {
    accessorKey: "dataEncerramento",
    header: "Data de Encerramento",
    cell: ({ row }: { row: Row<EditalExtendido> }) => {
      const value = row.getValue("dataEncerramento")
      if (!value) return <div>Não definida</div>
      const date = new Date(value as string)
      return <div>{date.toLocaleDateString("pt-BR")}</div>
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }: { row: Row<EditalExtendido> }) => {
      const edital = row.original
      const hoje = new Date()
      const dataInicio = edital.formulario?.dataInicio ? new Date(edital.formulario.dataInicio) : null
      const dataFim = edital.formulario?.dataFim ? new Date(edital.formulario.dataFim) : null
      const dataEncerramento = edital.dataEncerramento ? new Date(edital.dataEncerramento) : null

      let status = "Indisponível"
      let className = "bg-gray-100 text-gray-800"

      if (dataInicio && dataFim) {
        if (hoje < dataInicio) {
          status = "Em Breve"
          className = "bg-yellow-100 text-yellow-800"
        } else if (hoje >= dataInicio && hoje <= dataFim) {
          status = "Inscrições Abertas"
          className = "bg-green-100 text-green-800"
        } else if (dataEncerramento && hoje <= dataEncerramento) {
          status = "Inscrições Encerradas"
          className = "bg-red-100 text-red-800"
        } else if (dataEncerramento && hoje > dataEncerramento) {
          status = "Edital Encerrado"
          className = "bg-gray-100 text-gray-800"
        }
      }

      return (
        <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${className}`}>
          {status}
        </div>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row }: { row: Row<EditalExtendido> }) => {
      const edital = row.original

      return (
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
              <Link href={`/editais/${edital.id}`}>Editar</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={`/editais/${edital.id}`} target="_blank">
                Visualizar
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
