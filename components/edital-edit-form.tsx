"use client"

import type React from "react"

import { useState } from "react"
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
  const [dataPublicacao, setDataPublicacao] = useState<Date | undefined>(
    edital.dataPublicacao ? new Date(edital.dataPublicacao) : undefined,
  )
  const [dataEncerramento, setDataEncerramento] = useState<Date | undefined>(
    edital.dataEncerramento ? new Date(edital.dataEncerramento) : undefined,
  )
  const [secoes, setSecoes] = useState(
    edital.secoes.map((secao: any) => ({
      id: secao.id,
      titulo: secao.titulo,
      topicos: secao.topicos.map((topico: any) => ({
        id: topico.id,
        texto: topico.texto,
      })),
    })),
  )

  const adicionarSecao = () => {
    setSecoes([
      ...secoes,
      {
        id: `temp-${secoes.length + 1}`,
        titulo: "",
        topicos: [{ id: `temp-${secoes.length + 1}-1`, texto: "" }],
      },
    ])
  }

  const removerSecao = (index: number) => {
    const novasSecoes = [...secoes]
    novasSecoes.splice(index, 1)
    setSecoes(novasSecoes)
  }

  const adicionarTopico = (secaoIndex: number) => {
    const novasSecoes = [...secoes]
    novasSecoes[secaoIndex].topicos.push({
      id: `temp-${secaoIndex + 1}-${novasSecoes[secaoIndex].topicos.length + 1}`,
      texto: "",
    })
    setSecoes(novasSecoes)
  }

  const removerTopico = (secaoIndex: number, topicoIndex: number) => {
    const novasSecoes = [...secoes]
    novasSecoes[secaoIndex].topicos.splice(topicoIndex, 1)
    setSecoes(novasSecoes)
  }

  const moverSecaoParaCima = (index: number) => {
    if (index === 0) return
    const novasSecoes = [...secoes]
    const temp = novasSecoes[index]
    novasSecoes[index] = novasSecoes[index - 1]
    novasSecoes[index - 1] = temp
    setSecoes(novasSecoes)
  }

  const moverSecaoParaBaixo = (index: number) => {
    if (index === secoes.length - 1) return
    const novasSecoes = [...secoes]
    const temp = novasSecoes[index]
    novasSecoes[index] = novasSecoes[index + 1]
    novasSecoes[index + 1] = temp
    setSecoes(novasSecoes)
  }

  const moverTopicoParaCima = (secaoIndex: number, topicoIndex: number) => {
    if (topicoIndex === 0) return
    const novasSecoes = [...secoes]
    const temp = novasSecoes[secaoIndex].topicos[topicoIndex]
    novasSecoes[secaoIndex].topicos[topicoIndex] = novasSecoes[secaoIndex].topicos[topicoIndex - 1]
    novasSecoes[secaoIndex].topicos[topicoIndex - 1] = temp
    setSecoes(novasSecoes)
  }

  const moverTopicoParaBaixo = (secaoIndex: number, topicoIndex: number) => {
    if (topicoIndex === secoes[secaoIndex].topicos.length - 1) return
    const novasSecoes = [...secoes]
    const temp = novasSecoes[secaoIndex].topicos[topicoIndex]
    novasSecoes[secaoIndex].topicos[topicoIndex] = novasSecoes[secaoIndex].topicos[topicoIndex + 1]
    novasSecoes[secaoIndex].topicos[topicoIndex + 1] = temp
    setSecoes(novasSecoes)
  }

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
          <Label>Data de Publicação</Label>
          <DatePicker date={dataPublicacao} setDate={setDataPublicacao} />
        </div>
        <div className="space-y-2">
          <Label>Data de Encerramento (opcional)</Label>
          <DatePicker date={dataEncerramento} setDate={setDataEncerramento} />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Seções do Edital</h3>
          <Button type="button" variant="outline" size="sm" onClick={adicionarSecao}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Adicionar Seção
          </Button>
        </div>

        {secoes.map((secao, secaoIndex) => (
          <div key={secao.id} className="border rounded-md p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex-1 space-y-2">
                <Label htmlFor={`secao-${secaoIndex}`}>Título da Seção</Label>
                <Input
                  id={`secao-${secaoIndex}`}
                  value={secao.titulo}
                  onChange={(e) => {
                    const novasSecoes = [...secoes]
                    novasSecoes[secaoIndex].titulo = e.target.value
                    setSecoes(novasSecoes)
                  }}
                  placeholder="Ex: Requisitos"
                  required
                />
              </div>
              <div className="flex items-center ml-2 space-x-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => moverSecaoParaCima(secaoIndex)}
                  disabled={secaoIndex === 0}
                >
                  <MoveUp className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => moverSecaoParaBaixo(secaoIndex)}
                  disabled={secaoIndex === secoes.length - 1}
                >
                  <MoveDown className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removerSecao(secaoIndex)}
                  disabled={secoes.length === 1}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">Tópicos</h4>
                <Button type="button" variant="outline" size="sm" onClick={() => adicionarTopico(secaoIndex)}>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Adicionar Tópico
                </Button>
              </div>

              {secao.topicos.map((topico, topicoIndex) => (
                <div key={topico.id} className="border rounded-md p-3 space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <Label htmlFor={`topico-${secaoIndex}-${topicoIndex}`}>Conteúdo do Tópico</Label>
                      <Textarea
                        id={`topico-${secaoIndex}-${topicoIndex}`}
                        value={topico.texto}
                        onChange={(e) => {
                          const novasSecoes = [...secoes]
                          novasSecoes[secaoIndex].topicos[topicoIndex].texto = e.target.value
                          setSecoes(novasSecoes)
                        }}
                        placeholder="Digite o conteúdo do tópico..."
                        required
                      />
                    </div>
                    <div className="flex items-center ml-2 space-x-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => moverTopicoParaCima(secaoIndex, topicoIndex)}
                        disabled={topicoIndex === 0}
                      >
                        <MoveUp className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => moverTopicoParaBaixo(secaoIndex, topicoIndex)}
                        disabled={topicoIndex === secao.topicos.length - 1}
                      >
                        <MoveDown className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removerTopico(secaoIndex, topicoIndex)}
                        disabled={secao.topicos.length === 1}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Salvando..." : "Salvar Alterações"}
        </Button>
      </div>
    </form>
  )
}
