"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"

interface FormularioInscricaoProps {
  formulario: any
}

export function FormularioInscricao({ formulario }: FormularioInscricaoProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [formValues, setFormValues] = useState<Record<string, string>>({})

  const handleChange = (id: string, value: string) => {
    setFormValues((prev) => ({ ...prev, [id]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Verificar campos obrigatórios
    const camposObrigatorios = formulario.campos.filter((campo: any) => campo.obrigatorio === 1)
    const camposVazios = camposObrigatorios.filter((campo: any) => !formValues[campo.id])

    if (camposVazios.length > 0) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    try {
      // Preparar dados para envio
      const camposPreenchidos = Object.entries(formValues).map(([campoId, valor]) => ({
        campoId,
        valor,
      }))

      const response = await fetch("/api/inscricoes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          formularioId: formulario.id,
          campos: camposPreenchidos,
        }),
      })

      if (response.ok) {
        toast({
          title: "Inscrição realizada com sucesso",
          description: "Sua inscrição foi enviada com sucesso",
        })
        router.push("/inscricoes")
      } else {
        const error = await response.json()
        toast({
          title: "Erro ao realizar inscrição",
          description: error.message || "Ocorreu um erro ao tentar realizar a inscrição",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erro ao realizar inscrição",
        description: "Ocorreu um erro ao tentar realizar a inscrição",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const renderCampo = (campo: any) => {
    switch (campo.tipo) {
      case 0: // Texto curto
        return (
          <Input
            id={campo.id}
            value={formValues[campo.id] || ""}
            onChange={(e) => handleChange(campo.id, e.target.value)}
            required={campo.obrigatorio === 1}
          />
        )
      case 1: // Texto longo
        return (
          <Textarea
            id={campo.id}
            value={formValues[campo.id] || ""}
            onChange={(e) => handleChange(campo.id, e.target.value)}
            required={campo.obrigatorio === 1}
          />
        )
      case 2: // Opções (Radio)
        const opcoes = campo.rotulo.includes("|") ? campo.rotulo.split("|")[1].split(",") : []
        return (
          <RadioGroup value={formValues[campo.id] || ""} onValueChange={(value) => handleChange(campo.id, value)}>
            {opcoes.map((opcao: string, index: number) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={opcao} id={`${campo.id}-${index}`} />
                <Label htmlFor={`${campo.id}-${index}`}>{opcao.trim()}</Label>
              </div>
            ))}
          </RadioGroup>
        )
      case 3: // Seleção (Select)
        const opcoesSelect = campo.rotulo.includes("|") ? campo.rotulo.split("|")[1].split(",") : []
        return (
          <Select value={formValues[campo.id] || ""} onValueChange={(value) => handleChange(campo.id, value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma opção" />
            </SelectTrigger>
            <SelectContent>
              {opcoesSelect.map((opcao: string, index: number) => (
                <SelectItem key={index} value={opcao.trim()}>
                  {opcao.trim()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )
      case 4: // Checkbox
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={campo.id}
              checked={formValues[campo.id] === "true"}
              onCheckedChange={(checked) => handleChange(campo.id, checked ? "true" : "false")}
            />
            <Label htmlFor={campo.id}>{campo.rotulo.includes("|") ? campo.rotulo.split("|")[1] : "Concordo"}</Label>
          </div>
        )
      default:
        return (
          <Input
            id={campo.id}
            value={formValues[campo.id] || ""}
            onChange={(e) => handleChange(campo.id, e.target.value)}
            required={campo.obrigatorio === 1}
          />
        )
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {formulario.campos.map((campo: any) => (
        <div key={campo.id} className="space-y-2">
          <Label htmlFor={campo.id}>
            {campo.rotulo.includes("|") ? campo.rotulo.split("|")[0] : campo.rotulo}
            {campo.obrigatorio === 1 && <span className="text-red-500 ml-1">*</span>}
          </Label>
          {renderCampo(campo)}
        </div>
      ))}
      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Enviando..." : "Enviar Inscrição"}
        </Button>
      </div>
    </form>
  )
}
