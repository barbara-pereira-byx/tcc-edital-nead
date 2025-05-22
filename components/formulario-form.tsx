"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DatePicker } from "@/components/date-picker"
import { useToast } from "@/components/ui/use-toast"
import { PlusCircle, Trash2, MoveUp, MoveDown } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

interface FormularioFormProps {
  editalId?: string
  onFormularioCreated: (formularioId: string) => void
}

export function FormularioForm({ editalId, onFormularioCreated }: FormularioFormProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [titulo, setTitulo] = useState("")
  const [dataInicio, setDataInicio] = useState<Date | undefined>(undefined)
  const [dataFim, setDataFim] = useState<Date | undefined>(undefined)
  const [campos, setCampos] = useState([
    {
      id: "1",
      nome: "Nome Completo",
      tipo: "0", // Texto
      obrigatorio: true,
      categoria: "Dados Pessoais",
      tamanho: "100",
      opcoes: "",
    },
    {
      id: "2",
      nome: "E-mail",
      tipo: "0", // Texto
      obrigatorio: true,
      categoria: "Dados Pessoais",
      tamanho: "100",
      opcoes: "",
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

  const categorias = [
    "Dados Pessoais",
    "Formação Acadêmica",
    "Experiência Profissional",
    "Documentos",
    "Outros",
  ]

  const adicionarCampo = () => {
    setCampos([
      ...campos,
      {
        id: `${campos.length + 1}`,
        nome: "",
        tipo: "0",
        obrigatorio: true,
        categoria: "Dados Pessoais",
        tamanho: "100",
        opcoes: "",
      },
    ])
  }

  const removerCampo = (index: number) => {
    const novosCampos = [...campos]
    novosCampos.splice(index, 1)
    setCampos(novosCampos)
  }

  const moverCampoParaCima = (index: number) => {
    if (index === 0) return
    const novosCampos = [...campos]
    const temp = novosCampos[index]
    novosCampos[index] = novosCampos[index - 1]
    novosCampos[index - 1] = temp
    setCampos(novosCampos)
  }

  const moverCampoParaBaixo = (index: number) => {
    if (index === campos.length - 1) return
    const novosCampos = [...campos]
    const temp = novosCampos[index]
    novosCampos[index] = novosCampos[index + 1]
    novosCampos[index + 1] = temp
    setCampos(novosCampos)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    if (!titulo.trim()) {
      toast({
        title: "Erro ao criar formulário",
        description: "O título do formulário é obrigatório",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    if (!dataInicio || !dataFim) {
      toast({
        title: "Erro ao criar formulário",
        description: "As datas de início e fim são obrigatórias",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    if (dataFim < dataInicio) {
      toast({
        title: "Erro ao criar formulário",
        description: "A data de fim deve ser posterior à data de início",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    if (campos.length === 0) {
      toast({
        title: "Erro ao criar formulário",
        description: "O formulário deve ter pelo menos um campo",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    for (const campo of campos) {
      if (!campo.nome.trim()) {
        toast({
          title: "Erro ao criar formulário",
          description: "Todos os campos devem ter um nome",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }
    }

    try {
      const response = await fetch("/api/formularios", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          titulo,
          dataInicio,
          dataFim,
          campos,
          editalId,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        toast({
          title: "Formulário criado com sucesso",
          description: "O formulário foi criado e está pronto para receber inscrições",
        })
        onFormularioCreated(data.id)
      } else {
        const error = await response.json()
        toast({
          title: "Erro ao criar formulário",
          description: error.message || "Ocorreu um erro ao tentar criar o formulário",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Erro ao criar formulário:", error)
      toast({
        title: "Erro ao criar formulário",
        description: "Ocorreu um erro ao tentar criar o formulário",
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

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Campos do Formulário</h3>
        </div>

        {campos.map((campo, index) => (
          <div key={campo.id} className="border rounded-md p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Campo #{index + 1}</h4>
              <div className="flex items-center space-x-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => moverCampoParaCima(index)}
                  disabled={index === 0}
                >
                  <MoveUp className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => moverCampoParaBaixo(index)}
                  disabled={index === campos.length - 1}
                >
                  <MoveDown className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removerCampo(index)}
                  disabled={campos.length <= 2}
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
              <div className="space-y-2">
                <Label htmlFor={`categoria-${index}`}>Categoria</Label>
                <Select
                  value={campo.categoria}
                  onValueChange={(value) => {
                    const novosCampos = [...campos]
                    novosCampos[index].categoria = value
                    setCampos(novosCampos)
                  }}
                >
                  <SelectTrigger id={`categoria-${index}`}>
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categorias.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id={`obrigatorio-${index}`}
                  checked={campo.obrigatorio}
                  onCheckedChange={(checked) => {
                    const novosCampos = [...campos]
                    novosCampos[index].obrigatorio = checked as boolean
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
          {isLoading ? "Salvando..." : "Criar Formulário"}
        </Button>
      </div>
    </form>
  )
}
