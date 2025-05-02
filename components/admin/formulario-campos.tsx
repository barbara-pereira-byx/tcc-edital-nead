"use client"

import { useState } from "react"
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"

interface FormularioCamposProps {
  campo: {
    id: string
    nome: string
    tipo: string
    tamanho: string
    categoria: string
    obrigatorio: boolean
    opcoes: string[]
  }
  onUpdate: (campo: any) => void
  onRemove: () => void
}

export function FormularioCampos({ campo, onUpdate, onRemove }: FormularioCamposProps) {
  const [showOptions, setShowOptions] = useState(campo.tipo === "selecao")
  const [opcoes, setOpcoes] = useState<string[]>(campo.opcoes || [])
  const [novaOpcao, setNovaOpcao] = useState("")

  const handleTipoChange = (tipo: string) => {
    setShowOptions(tipo === "selecao")
    onUpdate({ tipo })
  }

  const adicionarOpcao = () => {
    if (novaOpcao.trim()) {
      const novasOpcoes = [...opcoes, novaOpcao.trim()]
      setOpcoes(novasOpcoes)
      onUpdate({ opcoes: novasOpcoes })
      setNovaOpcao("")
    }
  }

  const removerOpcao = (index: number) => {
    const novasOpcoes = opcoes.filter((_, i) => i !== index)
    setOpcoes(novasOpcoes)
    onUpdate({ opcoes: novasOpcoes })
  }

  return (
    <Card className="border border-gray-200">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-4">
          <div className="bg-gray-100 px-3 py-1 rounded text-sm font-medium">
            {campo.tipo === "string" ? "String" : campo.tipo === "selecao" ? "Seleção" : campo.tipo}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="text-red-500 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor={`nome-${campo.id}`}>Nome do campo</Label>
            <Input
              id={`nome-${campo.id}`}
              value={campo.nome}
              onChange={(e) => onUpdate({ nome: e.target.value })}
              placeholder="Ex: Nome"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`categoria-${campo.id}`}>Categoria</Label>
            <Select value={campo.categoria} onValueChange={(value) => onUpdate({ categoria: value })}>
              <SelectTrigger id={`categoria-${campo.id}`}>
                <SelectValue placeholder="Selecione a categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Dados Pessoais">Dados Pessoais</SelectItem>
                <SelectItem value="Formação">Formação</SelectItem>
                <SelectItem value="Experiência">Experiência</SelectItem>
                <SelectItem value="Documentos">Documentos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`tipo-${campo.id}`}>Tipo de campo</Label>
            <Select value={campo.tipo} onValueChange={handleTipoChange}>
              <SelectTrigger id={`tipo-${campo.id}`}>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="string">Texto</SelectItem>
                <SelectItem value="number">Número</SelectItem>
                <SelectItem value="date">Data</SelectItem>
                <SelectItem value="selecao">Seleção</SelectItem>
                <SelectItem value="checkbox">Checkbox</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`tamanho-${campo.id}`}>Tamanho do campo</Label>
            <Input
              id={`tamanho-${campo.id}`}
              value={campo.tamanho}
              onChange={(e) => onUpdate({ tamanho: e.target.value })}
              placeholder="Ex: 100"
              disabled={campo.tipo === "selecao" || campo.tipo === "checkbox"}
            />
          </div>
        </div>

        {showOptions && (
          <div className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label>Opções de seleção</Label>
              <div className="flex space-x-2">
                <Input value={novaOpcao} onChange={(e) => setNovaOpcao(e.target.value)} placeholder="Nova opção" />
                <Button
                  type="button"
                  onClick={adicionarOpcao}
                  variant="outline"
                  className="border-red-600 text-red-600 hover:bg-red-50"
                >
                  Adicionar
                </Button>
              </div>
            </div>

            {opcoes.length > 0 && (
              <div className="space-y-2">
                <Label>Opções adicionadas</Label>
                <div className="space-y-2">
                  {opcoes.map((opcao, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                      <span>{opcao}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removerOpcao(index)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
