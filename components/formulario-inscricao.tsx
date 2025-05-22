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
import { Alert, AlertDescription } from "@/components/ui/alert"
import { FileText, AlertCircle, Loader2 } from "lucide-react"

interface FormularioInscricaoProps {
  formulario: any
}

export function FormularioInscricao({ formulario }: FormularioInscricaoProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [formValues, setFormValues] = useState<Record<string, any>>({})
  const [fileErrors, setFileErrors] = useState<Record<string, string>>({})

  const validateFile = (file: File, campoId: string): boolean => {
    // Verificar extensão do arquivo
    const extensao = file.name.split(".").pop()?.toLowerCase()
    const extensoesPermitidas = ["pdf", "doc", "docx"]

    if (!extensao || !extensoesPermitidas.includes(extensao)) {
      setFileErrors((prev) => ({
        ...prev,
        [campoId]: `Formato de arquivo não permitido. Apenas PDF, DOC ou DOCX são aceitos.`,
      }))
      return false
    }

    // Verificar tamanho do arquivo (máximo 5MB)
    const tamanhoMaximo = 5 * 1024 * 1024 // 5MB em bytes
    if (file.size > tamanhoMaximo) {
      setFileErrors((prev) => ({
        ...prev,
        [campoId]: `O arquivo é muito grande. O tamanho máximo permitido é 5MB.`,
      }))
      return false
    }

    // Limpar erro se existir
    if (fileErrors[campoId]) {
      setFileErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[campoId]
        return newErrors
      })
    }

    return true
  }

  const handleChange = (id: string, value: any) => {
    setFormValues((prev) => ({ ...prev, [id]: value }))

    // Limpar erro de arquivo se um novo arquivo for selecionado
    if (fileErrors[id]) {
      setFileErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[id]
        return newErrors
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Verificar campos obrigatórios
    const camposObrigatorios = formulario.campos.filter((campo: any) => campo.obrigatorio === 1)
    const camposVazios = camposObrigatorios.filter((campo: any) => {
      // Para campos de arquivo, verificar se há um arquivo selecionado
      if (campo.tipo === 6) {
        return !formValues[campo.id] || fileErrors[campo.id]
      }
      return !formValues[campo.id]
    })

    if (camposVazios.length > 0) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    // Verificar se há erros de arquivo
    if (Object.keys(fileErrors).length > 0) {
      toast({
        title: "Erros nos arquivos",
        description: "Corrija os erros nos arquivos antes de enviar",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    try {
      const formData = new FormData()
      formData.append("formularioId", formulario.id)

      // Adicionar os campos ao FormData
      Object.entries(formValues).forEach(([campoId, valor]) => {
        if (valor instanceof File) {
          formData.append(campoId, valor) // Adiciona o arquivo
        } else if (valor !== null && valor !== undefined) {
          formData.append(campoId, valor.toString()) // Adiciona valores normais
        }
      })

      const response = await fetch("/api/inscricoes", {
        method: "POST",
        body: formData, // Enviar como FormData, não como JSON
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
      console.error("Erro ao enviar inscrição:", error)
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
      case 5: // Data
        return (
          <Input
            type="date"
            id={campo.id}
            value={formValues[campo.id] || ""}
            onChange={(e) => handleChange(campo.id, e.target.value)}
            required={campo.obrigatorio === 1}
          />
        )
      case 6: // Arquivo
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Input
                type="file"
                id={campo.id}
                accept=".pdf,.doc,.docx"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    if (validateFile(file, campo.id)) {
                      handleChange(campo.id, file) // Armazena o arquivo no estado
                    }
                  }
                }}
                required={campo.obrigatorio === 1}
                className={fileErrors[campo.id] ? "border-red-500" : ""}
              />
              {formValues[campo.id] && !fileErrors[campo.id] && (
                <div className="flex items-center text-green-600 text-sm">
                  <FileText className="h-4 w-4 mr-1" />
                  <span className="truncate max-w-[200px]">{formValues[campo.id].name}</span>
                </div>
              )}
            </div>

            {fileErrors[campo.id] ? (
              <Alert variant="destructive" className="py-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{fileErrors[campo.id]}</AlertDescription>
              </Alert>
            ) : (
              <p className="text-sm text-muted-foreground italic">
                Apenas arquivos nos formatos PDF, DOC ou DOCX são permitidos. Tamanho máximo: 5MB.
              </p>
            )}
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
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enviando...
            </>
          ) : (
            "Enviar Inscrição"
          )}
        </Button>
      </div>
    </form>
  )
}
