"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { DatePicker } from "@/components/date-picker"
import { useToast } from "@/components/ui/use-toast"
import { PlusCircle, Trash2, MoveUp, MoveDown } from "lucide-react"

interface EditalEditFormProps {
  edital: any
}

export function EditalEditForm({ edital }: EditalEditFormProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [titulo, setTitulo] = useState(edital.titulo)
  const [dataCriacao, setDataCriacao] = useState<Date | undefined>(undefined);
  const [dataPublicacao, setDataPublicacao] = useState<Date | undefined>(
    edital.dataPublicacao ? new Date(edital.dataPublicacao) : undefined,
  )
  const [dataEncerramento, setDataEncerramento] = useState<Date | undefined>(
    edital.dataEncerramento ? new Date(edital.dataEncerramento) : undefined,
  )
    useEffect(() => {
      const hoje = new Date();
      setDataCriacao(hoje);
    }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    if (!titulo) {
      toast({
        title: "Erro ao atualizar edital",
        description: "O título do edital é obrigatório",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    if (!dataPublicacao) {
      toast({
        title: "Erro ao atualizar edital",
        description: "A data de publicação é obrigatória",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    // Verificar se todas as seções têm título e pelo menos um tópico com texto
    for (const secao of secoes) {
      if (!secao.titulo) {
        toast({
          title: "Erro ao atualizar edital",
          description: "Todas as seções devem ter um título",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      if (secao.topicos.length === 0) {
        toast({
          title: "Erro ao atualizar edital",
          description: `A seção "${secao.titulo}" deve ter pelo menos um tópico`,
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      for (const topico of secao.topicos) {
        if (!topico.texto) {
          toast({
            title: "Erro ao atualizar edital",
            description: `Todos os tópicos da seção "${secao.titulo}" devem ter conteúdo`,
            variant: "destructive",
          })
          setIsLoading(false)
          return
        }
      }
    }

    try {
      const response = await fetch(`/api/editais/${edital.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          titulo,
          dataPublicacao,
          dataEncerramento,
          secoes,
        }),
      })

      if (response.ok) {
        toast({
          title: "Edital atualizado com sucesso",
          description: "As alterações foram salvas com sucesso",
        })
      } else {
        const error = await response.json()
        toast({
          title: "Erro ao atualizar edital",
          description: error.message || "Ocorreu um erro ao tentar atualizar o edital",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erro ao atualizar edital",
        description: "Ocorreu um erro ao tentar atualizar o edital",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="titulo">Título do Edital</Label>
        <Input
          id="titulo"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          placeholder="Ex: Edital de Seleção para Bolsistas 2024"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Data de Criação</Label>
          <DatePicker date={dataCriacao} setDate={() => {}} disabled />
        </div>
        <div className="space-y-2">
          <Label>Data de Publicação</Label>
          <DatePicker date={dataPublicacao} setDate={setDataPublicacao} />
        </div>
        <div className="space-y-2">
          <Label>Data de Encerramento (opcional)</Label>
          <DatePicker date={dataEncerramento} setDate={setDataEncerramento} />
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Salvando..." : "Salvar Alterações"}
        </Button>
      </div>
    </form>
  )
}
