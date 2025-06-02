"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { DatePicker } from "@/components/date-picker"
import { useToast } from "@/components/ui/use-toast"
import { PlusCircle, Trash2, MoveUp, MoveDown } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CampoFormulario } from "@prisma/client"

interface FormularioEditFormProps {
  formulario: any
}

export function FormularioEditForm({ formulario }: FormularioEditFormProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [titulo, setTitulo] = useState(formulario.titulo)
  const [dataInicio, setDataInicio] = useState<Date | undefined>(
    formulario.dataInicio ? new Date(formulario.dataInicio) : undefined,
  )
  const [dataFim, setDataFim] = useState<Date | undefined>(
    formulario.dataFim ? new Date(formulario.dataFim) : undefined,
  )

  interface CampoComArquivo extends CampoFormulario {
    arquivoFile: File | null,
    secao: string
  }
  
  const [campos, setCampos] = useState<CampoComArquivo[]>(
    formulario.campos.map((campo: any) => ({
      id: campo.id,
      rotulo: campo.rotulo,
      tipo: campo.tipo,
      obrigatorio: campo.obrigatorio,
      secao: campo.secao || "Geral",
      arquivoFile: null,
    })),
  )

  const tiposCampo = [
    { valor: "0", nome: "Texto" },
    { valor: "1", nome: "Área de Texto" },
    { valor: "3", nome: "Seleção (Select)" },
    { valor: "4", nome: "Checkbox" },
    { valor: "5", nome: "Data" },
    { valor: "6", nome: "Arquivo" },
  ]

  const adicionarCampo = () => {
    setCampos([
      ...campos,
      {
        id: `temp-${campos.length + 1}`,
        rotulo: "",
        tipo: 0,
        obrigatorio: 1,
        secao: "Geral",
        arquivoFile: null,
        ordem: campos.length + 1, // ou qualquer valor padrão
        formularioId: "default-form-id", // ou "" se for vazio
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  };

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

    if (!titulo) {
      toast({
        title: "Erro ao atualizar formulário",
        description: "O título do formulário é obrigatório",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    if (!dataInicio || !dataFim) {
      toast({
        title: "Erro ao atualizar formulário",
        description: "As datas de início e fim são obrigatórias",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    if (dataFim < dataInicio) {
      toast({
        title: "Erro ao atualizar formulário",
        description: "A data de fim deve ser posterior à data de início",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    // Verificar se todos os campos têm rótulo
    for (const campo of campos) {
      if (!campo.rotulo) {
        toast({
          title: "Erro ao atualizar formulário",
          description: "Todos os campos devem ter um rótulo",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }
    }

    try {
      // Se quiser enviar arquivos, precisa usar FormData e ajustar backend para multipart/form-data.
      // Aqui envio só JSON sem arquivos para manter compatibilidade, mas você pode adaptar:
      const response = await fetch(`/api/formularios/${formulario.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          titulo,
          dataInicio,
          dataFim,
          campos: campos.map(({ arquivoFile, ...rest }) => rest), // exclui arquivoFile do JSON
        }),
      })

      if (response.ok) {
        toast({
          title: "Formulário atualizado com sucesso",
          description: "As alterações foram salvas com sucesso",
        })
      } else {
        const error = await response.json()
        toast({
          title: "Erro ao atualizar formulário",
          description: error.message || "Ocorreu um erro ao tentar atualizar o formulário",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erro ao atualizar formulário",
        description: "Ocorreu um erro ao tentar atualizar o formulário",
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
          placeholder="Ex: Formulário de Inscrição"
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

        {campos.map((campo: CampoFormulario & { arquivoFile?: File | null }, index: number) => (
          <div key={campo.id} className="border rounded-md p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">Campo #{String(index + 1).padStart(3, "0")}</h4>
              <div className="flex items-center ml-2 space-x-1">
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
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`tipo-${index}`}>Tipo do Campo</Label>
                <Select
                  value={campo.tipo.toString()}
                  onValueChange={(value) => {
                    const novosCampos = [...campos]
                    novosCampos[index].tipo = Number.parseInt(value)
                    // Reset arquivoFile ao mudar tipo
                    if (Number.parseInt(value) !== 6) {
                      novosCampos[index].arquivoFile = null
                    }
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
              <div className="flex items-center space-x-2 mt-6 md:mt-0">
                <Switch
                  id={`obrigatorio-${index}`}
                  checked={campo.obrigatorio === 1}
                  onCheckedChange={(checked) => {
                    const novosCampos = [...campos]
                    novosCampos[index].obrigatorio = checked ? 1 : 0
                    setCampos(novosCampos)
                  }}
                />
                <Label htmlFor={`obrigatorio-${index}`}>Obrigatório</Label>
              </div>
            </div>

            {/* Nome / rótulo principal */}
            <div className="space-y-2">
              <Label htmlFor={`campo-${index}`}>Nome do Campo</Label>
              <Input
                id={`campo-${index}`}
                value={campo.rotulo.includes("|") ? campo.rotulo.split("|")[0] : campo.rotulo}
                onChange={(e) => {
                  const novosCampos = [...campos]
                  const complemento = campo.rotulo.includes("|") ? campo.rotulo.split("|")[1] : ""
                  novosCampos[index].rotulo = `${e.target.value}${complemento ? `|${complemento}` : ""}`
                  setCampos(novosCampos)
                }}
                placeholder="Ex: Nome Completo"
                required
              />
            </div>

            {/* Campo com opções (radio ou select) */}
            {(campo.tipo === 2 || campo.tipo === 3) && (
              <div className="space-y-2">
                <Label htmlFor={`opcoes-${index}`}>Opções (separadas por vírgula)</Label>
                <Input
                  id={`opcoes-${index}`}
                  value={campo.rotulo.includes("|") ? campo.rotulo.split("|")[1] : ""}
                  onChange={(e) => {
                    const novosCampos = [...campos]
                    const rotuloPrincipal = campo.rotulo.includes("|") ? campo.rotulo.split("|")[0] : campo.rotulo
                    novosCampos[index].rotulo = `${rotuloPrincipal}|${e.target.value}`
                    setCampos(novosCampos)
                  }}
                  placeholder="Ex: Opção 1, Opção 2, Opção 3"
                />
              </div>
            )}

            {/* Campo checkbox */}
            {campo.tipo === 4 && (
              <div className="space-y-2">
                <Label htmlFor={`texto-checkbox-${index}`}>Texto do Checkbox</Label>
                <Input
                  id={`texto-checkbox-${index}`}
                  value={campo.rotulo.includes("|") ? campo.rotulo.split("|")[1] : ""}
                  onChange={(e) => {
                    const novosCampos = [...campos]
                    const rotuloPrincipal = campo.rotulo.includes("|") ? campo.rotulo.split("|")[0] : campo.rotulo
                    novosCampos[index].rotulo = `${rotuloPrincipal}|${e.target.value}`
                    setCampos(novosCampos)
                  }}
                  placeholder="Ex: Concordo com os termos"
                />
              </div>
            )}
          </div>
        ))}
        <div className="flex items-center">
          <Button type="button" variant="outline" size="sm" onClick={adicionarCampo} className="ml-auto">
            <PlusCircle className="h-4 w-4 mr-2" />
            Adicionar Campo
          </Button>
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
