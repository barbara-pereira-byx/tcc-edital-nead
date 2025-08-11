"use client"

import Link from "next/link"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

interface InscricoesTableProps {
  inscricoes: any[]
}

export function InscricoesTable({ inscricoes }: InscricoesTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>E-mail</TableHead>
            <TableHead>CPF</TableHead>
            <TableHead>Data da Inscrição</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {inscricoes.map((inscricao) => (
            <TableRow key={inscricao.id}>
              <TableCell className="font-medium">{inscricao.usuario.nome}</TableCell>
              <TableCell>{inscricao.usuario.email}</TableCell>
              <TableCell>{inscricao.usuario.cpf}</TableCell>
              <TableCell>
                {new Date(inscricao.dataHora).toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </TableCell>
              <TableCell>
                <Badge 
                  className={
                    inscricao.status === "ATIVO" 
                      ? "bg-green-100 text-green-800" 
                      : "bg-red-100 text-red-800"
                  }
                >
                  {inscricao.status === "ATIVO" ? "ATIVO" : "CANCELADO"}
                </Badge>
              </TableCell>
              <TableCell>
                <Link href={`/inscricoes/${inscricao.id}`} className="text-blue-600 hover:underline">
                  Ver Detalhes
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
