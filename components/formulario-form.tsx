"use client"

import type React from "react"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DatePicker } from "@/components/date-picker"
import { useToast } from "@/components/ui/use-toast"
import { PlusCircle, Trash2, MoveUp, MoveDown } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

interface FormularioFormProps {
  editalId?: string
  onFormularioCreated?: (formularioId: string) => void
}

interface Campo {
  id: string
  nome: string
  tipo: string
  obrigatorio: boolean
  tamanho: string
  opcoes: string
  ordem: number
}

export function FormularioForm({ editalId, onFormularioCreated }: FormularioFormProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const [formularioCriado, setFormularioCriado] = useState(false)
  const [titulo, setTitulo] = useState("")
  const [dataInicio, setDataInicio] = useState<Date | undefined>(undefined)
  const [dataFim, setDataFim] = useState<Date | undefined>(undefined)
  const [formularioId, setFormularioId] = useState<string | undefined>(undefined)
  const [campos, setCampos] = useState<Campo[]>([
    {
      id: "1",
      nome: "Nome Completo",
      tipo: "0",
      obrigatorio: true,
      tamanho: "100",
      opcoes: "",
      ordem: 1,
    },
    {
      id: "2",
      nome: "E-mail",
      tipo: "0",
      obrigatorio: true,
      tamanho: "100",
      opcoes: "",
      ordem: 2,
    },
  ])

  const tiposCampo = [
    { valor: "0", nome: "Texto" },
    { valor: "1", nome: "Área de Texto" },
    { valor: "3", nome: "Seleção (Select)" },
    { valor: "4", nome: "Checkbox" },
    { valor: "5", nome: "Data" },
    { valor: "6", nome: "Arquivo" },
  ]

  useEffect(() => {
    const carregarDadosEdital = async () => {
      if (!editalId || formularioCriado) return

      try {
        const response = await fetch(`/api/editais/${editalId}`)
        if (!response.ok) throw new Error("Erro ao buscar dados do edital")
        const edital = await response.json()

        const tituloEdital = edital?.titulo || ""
        const dataInicioEdital = edital?.dataPublicacao ? new Date(edital.dataPublicacao) : undefined
        const dataFimEdital = edital?.dataEncerramento ? new Date(edital.dataEncerramento) : undefined

        setTitulo(tituloEdital)
        setDataInicio(dataInicioEdital)
        setDataFim(dataFimEdital)

        if (tituloEdital && dataInicioEdital && dataFimEdital) {
          const criarResponse = await fetch("/api/formularios", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              titulo: tituloEdital,
              dataInicio: dataInicioEdital,
              dataFim: dataFimEdital,
              campos: campos.map((c) => ({
                ...c,
                ordem: c.ordem || 0,
              })),
              editalId,
            }),
          })

          if (!criarResponse.ok) {
            const err = await criarResponse.json()
            throw new Error(err.message || "Erro ao criar formulário automaticamente")
          }

          const data = await criarResponse.json()
          toast({
            title: "Formulário criado automaticamente",
            description: "Você pode agora personalizá-lo.",
          })
          setFormularioId(data.id)
          setFormularioCriado(true)
          if (onFormularioCreated) onFormularioCreated(data.id)
        }
      } catch (error) {
        console.error("Erro ao carregar ou criar formulário:", error)
        toast({
          title: "Erro",
          description: "Não foi possível carregar/criar o formulário",
          variant: "destructive",
        })
      }
    }

    carregarDadosEdital()
  }, [editalId, formularioCriado])

  const adicionarCampo = () => {
    const maiorOrdem = Math.max(...campos.map((c) => c.ordem), 0)

    setCampos([
      ...campos,
      {
        id: `temp-${Date.now()}`,
        nome: "",
        tipo: "0",
        obrigatorio: true,
        tamanho: "100",
        opcoes: "",
        ordem: maiorOrdem + 1,
      },
    ])
  }

  const removerCampo = (index: number) => {
    const novosCampos = [...campos]
    novosCampos.splice(index, 1)

    const camposReordenados = novosCampos.map((campo, i) => ({
      ...campo,
      ordem: i + 1,
    }))

    setCampos(camposReordenados)
  }

  const moverCampoParaCima = (index: number) => {
    if (index === 0) return

    const novosCampos = [...campos]
    const temp = novosCampos[index]
    novosCampos[index] = novosCampos[index - 1]
    novosCampos[index - 1] = temp

    const camposReordenados = novosCampos.map((campo, i) => ({
      ...campo,
      ordem: i + 1,
    }))

    setCampos(camposReordenados)
  }

  const moverCampoParaBaixo = (index: number) => {
    if (index === campos.length - 1) return

    const novosCampos = [...campos]
    const temp = novosCampos[index]
    novosCampos[index] = novosCampos[index + 1]
    novosCampos[index + 1] = temp

    const camposReordenados = novosCampos.map((campo, i) => ({
      ...campo,
      ordem: i + 1,
    }))

    setCampos(camposReordenados)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    if (!titulo.trim()) {
      toast({
        title: "Erro ao salvar formulário",
        description: "O título do formulário é obrigatório",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    if (!dataInicio || !dataFim) {
      toast({
        title: "Erro ao salvar formulário",
        description: "As datas de início e fim são obrigatórias",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    if (dataFim < dataInicio) {
      toast({
        title: "Erro ao salvar formulário",
        description: "A data de fim deve ser posterior à data de início",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    if (campos.length === 0) {
      toast({
        title: "Erro ao salvar formulário",
        description: "O formulário deve ter pelo menos um campo",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    for (const campo of campos) {
      if (!campo.nome.trim()) {
        toast({
          title: "Erro ao salvar formulário",
          description: "Todos os campos devem ter um nome",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }
    }

    try {
      const camposOrdenados = campos.map((campo, index) => ({
        ...campo,
        ordem: index + 1,
      }))

      let response
      let isUpdate = false

      // Se formularioId existe, tentar atualizar, mas estar preparado para criar novo se não existir
      if (formularioId) {
        console.log(`Tentando atualizar formulário com ID: ${formularioId}`)

        try {
          // Verificar se o formulário ainda existe
          const checkResponse = await fetch(`/api/formularios/${formularioId}`)

          if (checkResponse.ok) {
            isUpdate = true
            console.log("Formulário encontrado, prosseguindo com atualização")

            // Mapear campos para o formato esperado pela API de atualização
            const camposParaAPI = camposOrdenados.map((campo) => ({
              id: campo.id,
              rotulo: campo.nome, // API de atualização espera 'rotulo'
              tipo: Number.parseInt(campo.tipo),
              obrigatorio: campo.obrigatorio ? 1 : 0,
              ordem: campo.ordem,
            }))

            response = await fetch(`/api/formularios/${formularioId}`, {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                titulo,
                dataInicio,
                dataFim,
                campos: camposParaAPI,
              }),
            })
            
            // Processar resposta
            if (response.ok) {
              const data = await response.json()
              console.log("Resposta da API:", data)

              toast({
                title: `Formulário ${isUpdate ? "atualizado" : "criado"} com sucesso`,
                description: `O formulário foi ${isUpdate ? "atualizado" : "criado"} e está pronto para receber inscrições`,
              })

              // Se foi uma criação, armazenar o ID
              if (!isUpdate && data.id) {
                setFormularioId(data.id)
                setFormularioCriado(true)
              }

              router.push("/gerenciar")
            } else {
              const error = await response.json()
              console.error("Erro na resposta da API:", error)

              toast({
                title: "Erro ao salvar formulário",
                description: error.message || "Ocorreu um erro ao tentar salvar o formulário",
                variant: "destructive",
              })}
            } else {
              // Formulário não existe, vamos criar um novo
              console.log("Formulário não encontrado (404), criando um novo")
              isUpdate = false
              setFormularioId(undefined)

              // Continuar para o bloco de criação abaixo
              throw new Error("Formulário não encontrado")
            }
        } catch (error) {
          console.log("Erro ao verificar/atualizar formulário, tentando criar novo:", error)
          isUpdate = false
          // Continuar para o bloco de criação abaixo
        }
      }

      // Se não estamos atualizando (seja porque não tínhamos ID ou porque o formulário não existe mais)
      if (!isUpdate) {
        // Verificar se temos editalId
        if (!editalId) {
          toast({
            title: "Erro ao salvar formulário",
            description: "É necessário um ID de edital para criar um formulário",
            variant: "destructive",
          })
          setIsLoading(false)
          return
        }

        console.log(`Criando novo formulário para edital: ${editalId}`)

        // Fazer POST (criação)
        response = await fetch("/api/formularios", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            titulo,
            dataInicio,
            dataFim,
            campos: camposOrdenados.map((campo) => ({
              nome: campo.nome,
              tipo: campo.tipo,
              obrigatorio: campo.obrigatorio,
              ordem: campo.ordem,
            })),
            editalId,
          }),
        })
        // Processar resposta
        if (response.ok) {
          const data = await response.json()
          console.log("Resposta da API:", data)

          toast({
            title: `Formulário ${isUpdate ? "atualizado" : "criado"} com sucesso`,
            description: `O formulário foi ${isUpdate ? "atualizado" : "criado"} e está pronto para receber inscrições`,
          })

          // Se foi uma criação, armazenar o ID
          if (!isUpdate && data.id) {
            setFormularioId(data.id)
            setFormularioCriado(true)
          }

          router.push("/gerenciar")
        } else {
          const error = await response.json()
          console.error("Erro na resposta da API:", error)

          toast({
            title: "Erro ao salvar formulário",
            description: error.message || "Ocorreu um erro ao tentar salvar o formulário",
            variant: "destructive",
          })
        }
      }

      
    } catch (error) {
      console.error("Erro ao salvar formulário:", error)
      toast({
        title: "Erro ao salvar formulário",
        description: "Ocorreu um erro ao tentar salvar o formulário",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="titulo">Título do Formulário</Label>
        <Input
          id="titulo"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          placeholder="Ex: Formulário de Inscrição para Bolsistas"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Data de Início das Inscrições</Label>
          <DatePicker date={dataInicio} setDate={setDataInicio} />
        </div>
        <div className="space-y-2">
          <Label>Data de Fim das Inscrições</Label>
          <DatePicker date={dataFim} setDate={setDataFim} />
        </div>
      </div>

      {/* Mostrar informações sobre o estado do formulário */}
      {editalId && (
        <div className="p-2 bg-gray-50 rounded-md text-sm text-gray-600">
          Este formulário será associado ao Edital ID: {editalId}
          {formularioId && <span className="block mt-1">Formulário ID: {formularioId} (modo edição)</span>}
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Campos do Formulário</h3>
        </div>

        {campos.map((campo, index) => (
          <div key={campo.id} className="border rounded-md p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">
                Campo #{String(index + 1).padStart(3, "0")}
                <span className="text-sm text-gray-500 ml-2">(Ordem: {campo.ordem})</span>
              </h4>
              <div className="flex items-center space-x-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => moverCampoParaCima(index)}
                  disabled={index === 0}
                  title="Mover para cima"
                >
                  <MoveUp className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => moverCampoParaBaixo(index)}
                  disabled={index === campos.length - 1}
                  title="Mover para baixo"
                >
                  <MoveDown className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removerCampo(index)}
                  disabled={campos.length <= 2}
                  title="Remover campo"
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`nome-${index}`}>Nome do Campo</Label>
                <Input
                  id={`nome-${index}`}
                  value={campo.nome}
                  onChange={(e) => {
                    const novosCampos = [...campos]
                    novosCampos[index].nome = e.target.value
                    setCampos(novosCampos)
                  }}
                  placeholder="Ex: Nome Completo"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`tipo-${index}`}>Tipo do Campo</Label>
                <Select
                  value={campo.tipo}
                  onValueChange={(value) => {
                    const novosCampos = [...campos]
                    novosCampos[index].tipo = value
                    setCampos(novosCampos)
                  }}
                >
                  <SelectTrigger id={`tipo-${index}`}>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {tiposCampo.map((tipo) => (
                      <SelectItem key={tipo.valor} value={tipo.valor}>
                        {tipo.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id={`obrigatorio-${index}`}
                  checked={campo.obrigatorio}
                  onCheckedChange={(checked) => {
                    const novosCampos = [...campos]
                    novosCampos[index].obrigatorio = checked
                    setCampos(novosCampos)
                  }}
                />
                <Label htmlFor={`obrigatorio-${index}`}>Obrigatório</Label>
              </div>
            </div>

            {(campo.tipo === "0" || campo.tipo === "1") && (
              <div className="space-y-2">
                <Label htmlFor={`tamanho-${index}`}>Tamanho Máximo</Label>
                <Input
                  id={`tamanho-${index}`}
                  type="number"
                  min={1}
                  max={255}
                  value={campo.tamanho}
                  onChange={(e) => {
                    const novosCampos = [...campos]
                    novosCampos[index].tamanho = e.target.value
                    setCampos(novosCampos)
                  }}
                />
              </div>
            )}

            {campo.tipo === "3" && (
              <div className="space-y-2">
                <Label htmlFor={`opcoes-${index}`}>Opções (separadas por vírgula)</Label>
                <Input
                  id={`opcoes-${index}`}
                  value={campo.opcoes}
                  onChange={(e) => {
                    const novosCampos = [...campos]
                    novosCampos[index].opcoes = e.target.value
                    setCampos(novosCampos)
                  }}
                  placeholder="Ex: Opção 1, Opção 2, Opção 3"
                />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <Button type="button" variant="outline" size="sm" onClick={adicionarCampo}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Adicionar Campo
        </Button>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Salvando..." : formularioId ? "Atualizar Formulário" : "Criar Formulário"}
        </Button>
      </div>
    </form>
  )
}
