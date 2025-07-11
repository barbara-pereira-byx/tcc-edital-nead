"use client"

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, Users } from "lucide-react"

import { Edital as PrismaEdital } from "@prisma/client";

export type Edital = PrismaEdital & {
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

interface EditalCardProps {
  edital: Edital
}

function formatarData(data: Date): string {
  return data.toLocaleDateString("pt-BR");
}

export function EditalCard({ edital }: EditalCardProps) {
  // Determinar o status do edital
  const getStatus = () => {
    const hoje = new Date()
    const dataPublicacao = new Date(edital.dataPublicacao)
    const dataEncerramento = edital.dataEncerramento ? new Date(edital.dataEncerramento) : null

    if (dataPublicacao > hoje) {
      return { label: "Em breve", variant: "warning" }
    } else if (dataEncerramento && dataEncerramento <= hoje) {
      return { label: "Encerrado", variant: "secondary" }
    } else {
      return { label: "Aberto", variant: "default" }
    }
  }

  const status = getStatus()

  // Formatar data
  const formatarData = (data: Date) => {
    return new Date(data).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  return (
    <Card className="h-full flex flex-col hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <Badge variant={status.variant as "default" | "secondary" | "destructive" | "outline" | "warning"}>
            {status.label}
          </Badge>
        </div>
        <CardTitle className="line-clamp-2 mt-1">
          {edital.codigo && (
            <span className="text-sm font-mono text-muted-foreground block mb-1">
              {edital.codigo}
            </span>
          )}
          {edital.titulo}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="grid grid-cols-1 gap-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Publicado em: {formatarData(edital.dataPublicacao)}</span>
          </div>

          {edital.dataEncerramento && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Encerra em: {formatarData(edital.dataEncerramento)}</span>
            </div>
          )}

          {edital.formulario?.dataInicio && edital.formulario?.dataFim && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>
                Inscrições: {formatarData(new Date(edital.formulario.dataInicio))} a {formatarData(new Date(edital.formulario.dataFim))}
              </span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full">
          Ver Detalhes
        </Button>
      </CardFooter>
    </Card>
  )
}
