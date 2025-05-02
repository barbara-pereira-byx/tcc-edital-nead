"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { DatePicker } from "@/components/date-picker"
import { useToast } from "@/components/ui/use-toast"
import { PlusCircle, Trash2, MoveUp, MoveDown, FileText } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface EditalFormProps {
  onEditalCreated: (id: string, codigo: string) => void
}

export function EditalForm({ onEditalCreated }: EditalFormProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [titulo, setTitulo] = useState("")
  const [codigo, setCodigo] = useState("")
  const [dataPublicacao, setDataPublicacao] = useState<Date | undefined>(new Date())
  const [dataEncerramento, setDataEncerramento] = useState<Date | undefined>(undefined)
  const [secoes, setSecoes] = useState([
    {
      id: "temp-1",
      titulo: "",
      topicos: [{ id: "temp-1-1", texto: "" }],
    },
  ])
  const [arquivo, setArquivo] = useState<File | null>(null)

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setArquivo(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    if (!titulo) {
      toast({
        title: "Erro ao criar edital",
        description: "O título do edital é obrigatório",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    if (!codigo) {
      toast({
        title: "Erro ao criar edital",
        description: "O código do edital é obrigatório",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    if (!dataPublicacao) {
      toast({
        title: "Erro ao criar edital",
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
          title: "Erro ao criar edital",
          description: "Todas as seções devem ter um título",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      if (secao.topicos.length === 0) {
        toast({
          title: "Erro ao criar edital",
          description: `A seção "${secao.titulo}" deve ter pelo menos um tópico`,
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      for (const topico of secao.topicos) {
        if (!topico.texto) {
          toast({
            title: "Erro ao criar edital",
            description: `Todos os tópicos da seção "${secao.titulo}" devem ter conteúdo`,
            variant: "destructive",
          })
          setIsLoading(false)
          return
        }
      }
    }

    try {
      const response = await fetch("/api/editais", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          titulo,
          codigo,
          dataPublicacao,
          dataEncerramento,
          secoes,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        onEditalCreated(data.id, codigo)
      } else {
        const error = await response.json()
        toast({
          title: "Erro ao criar edital",
          description: error.message || "Ocorreu um erro ao tentar criar o edital",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erro ao criar edital",
        description: "Ocorreu um erro ao tentar criar o edital",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="border-dashed border-2">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-md">
              <FileText className="h-16 w-16 text-gray-400 mb-2" />
              <div className="text-center">
                <label htmlFor="file-upload" className="cursor-pointer text-red-600 hover:text-red-700">
                  {arquivo ? arquivo.name : "Clique para fazer upload"}
                </label>
                <input
                  id="file-upload"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <p className="text-xs text-gray-500 mt-1">PDF, DOC ou DOCX (máx. 5MB)</p>
              </div>
            </div>

            <div className="md:col-span-2 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="codigo">Código do Edital</Label>
                <Input
                  id="codigo"
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value)}
                  placeholder="Ex: BLS-001-2025-ADMP"
                  required
                />
              </div>

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
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Seções do Edital</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={adicionarSecao}
            className="border-red-600 text-red-600 hover:bg-red-50"
          >
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
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => adicionarTopico(secaoIndex)}
                  className="border-red-600 text-red-600 hover:bg-red-50"
                >
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
        <Button type="submit" disabled={isLoading} className="bg-red-600 hover:bg-red-700">
          {isLoading ? "Criando..." : "Criar Edital"}
        </Button>
      </div>
    </form>
  )
}
