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
import { FileText, AlertCircle, Loader2, X } from "lucide-react"

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
    const extensao = file.name.split(".").pop()?.toLowerCase();
    const extensoesPermitidas = ["pdf", "doc", "docx"];

    if (!extensao || !extensoesPermitidas.includes(extensao)) {
      setFileErrors((prev) => ({
        ...prev,
        [campoId]: `Formato de arquivo não permitido. Apenas PDF, DOC ou DOCX são aceitos.`,
      }));
      return false;
    }

    // Verificar tamanho do arquivo (máximo 5MB)
    const tamanhoMaximo = 5 * 1024 * 1024; // 5MB em bytes
    if (file.size > tamanhoMaximo) {
      setFileErrors((prev) => ({
        ...prev,
        [campoId]: `O arquivo é muito grande. O tamanho máximo permitido é 5MB.`,
      }));
      return false;
    }

    // Limpar erro se existir
    if (fileErrors[campoId]) {
      setFileErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[campoId];
        return newErrors;
      });
    }

    return true;
  }


  const handleChange = (id: string, value: any, isRemove = false) => {
    // Caso especial para arquivos: manter os existentes e adicionar novos
    if (Array.isArray(value) && value[0] instanceof File) {
      setFormValues((prev) => {
        // Se já existem arquivos para este campo e não estamos removendo, adicionar os novos
        if (Array.isArray(prev[id]) && prev[id][0] instanceof File && !isRemove) {
          return { ...prev, [id]: [...prev[id], ...value] };
        }
        // Caso contrário, usar os novos arquivos
        return { ...prev, [id]: value };
      });
    } else {
      // Para outros tipos de campos, comportamento normal
      setFormValues((prev) => ({ ...prev, [id]: value }));
    }

    // Limpar erro de arquivo se um novo arquivo for selecionado
    if (fileErrors[id]) {
      setFileErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[id];
        return newErrors;
      });
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
        if (Array.isArray(valor)) {
          // Se for um array de arquivos, adiciona cada um com o mesmo nome de campo
          valor.forEach((file: File) => {
            formData.append(campoId, file);
          });
        } else if (valor instanceof File) {
          formData.append(campoId, valor) // Adiciona o arquivo único
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
        // Usar o campo opcoes se disponível, caso contrário, tentar extrair do rotulo
        const opcoes = campo.opcoes 
          ? campo.opcoes.split(",") 
          : (campo.rotulo.includes("|") ? campo.rotulo.split("|")[1].split(",") : [])
        
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
        // Usar o campo opcoes se disponível, caso contrário, tentar extrair do rotulo
        const opcoesSelect = campo.opcoes 
          ? campo.opcoes.split(",") 
          : (campo.rotulo.includes("|") ? campo.rotulo.split("|")[1].split(",") : [])
        
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
            <div className="flex flex-col gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.multiple = true;
                  input.accept = '.pdf,.doc,.docx';
                  
                  input.onchange = (e) => {
                    const files = (e.target as HTMLInputElement).files;
                    if (files && files.length > 0) {
                      // Validar cada arquivo
                      let todosValidos = true;
                      const arquivosValidos = [];
                      
                      for (let i = 0; i < files.length; i++) {
                        const file = files[i];
                        if (validateFile(file, campo.id)) {
                          arquivosValidos.push(file);
                        } else {
                          todosValidos = false;
                          break;
                        }
                      }
                      
                      if (todosValidos && arquivosValidos.length > 0) {
                        // Se todos os arquivos são válidos, armazena a lista de arquivos
                        handleChange(campo.id, arquivosValidos);
                      }
                    }
                  };
                  
                  input.click();
                }}
                className="w-full flex items-center justify-center"
              >
                <FileText className="mr-2 h-4 w-4" />
                {formValues[campo.id] && Array.isArray(formValues[campo.id]) && formValues[campo.id].length > 0 
                  ? "Adicionar mais arquivos" 
                  : "Selecionar arquivos"}
              </Button>
            </div>
            
            {/* Exibir arquivos selecionados */}
            {formValues[campo.id] && Array.isArray(formValues[campo.id]) && formValues[campo.id].length > 0 && !fileErrors[campo.id] && (
              <div className="space-y-2 mt-2">
                {formValues[campo.id].map((file: File, index: number) => (
                  <div key={index} className="flex items-center justify-between bg-slate-50 p-2 rounded-md border">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-blue-500" />
                      <span className="text-sm truncate max-w-[200px]">{file.name}</span>
                      <span className="text-xs text-slate-500">({(file.size / 1024).toFixed(1)} KB)</span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        const currentFiles = [...formValues[campo.id]];
                        currentFiles.splice(index, 1);
                        handleChange(campo.id, currentFiles.length > 0 ? currentFiles : null, true);
                      }}
                      className="h-6 w-6 p-0"
                    >
                      <X size={14} />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {fileErrors[campo.id] ? (
              <Alert variant="destructive" className="py-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{fileErrors[campo.id]}</AlertDescription>
              </Alert>
            ) : (
              <p className="text-sm text-muted-foreground italic">
                Você pode selecionar múltiplos arquivos. Apenas formatos PDF, DOC ou DOCX são permitidos. Tamanho máximo: 5MB por arquivo.
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

  // Agrupar campos por categoria
  const agruparPorCategoria = () => {
    const categorias: Record<string, any[]> = {};
    
    // Definir a ordem padrão das categorias
    const categoriasPadrao = [
      "Dados Pessoais",
      "Identidade",
      "Endereço",
      "Contato",
      "Documentos",
      "Outros"
    ];
    
    // Agrupar campos por categoria
    formulario.campos.forEach((campo: any) => {
      const categoria = campo.categoria || "Dados Pessoais";
      if (!categorias[categoria]) {
        categorias[categoria] = [];
      }
      categorias[categoria].push(campo);
    });
    
    // Ordenar campos dentro de cada categoria pela ordem
    Object.keys(categorias).forEach(categoria => {
      categorias[categoria].sort((a: any, b: any) => a.ordem - b.ordem);
    });
    
    // Criar lista ordenada de categorias (categorias padrão primeiro, depois as personalizadas)
    const todasCategorias = Object.keys(categorias);
    const ordemCategorias = [
      ...categoriasPadrao.filter(cat => todasCategorias.includes(cat)),
      ...todasCategorias.filter(cat => !categoriasPadrao.includes(cat))
    ];
    
    return { categorias, ordemCategorias };
  };
  
  const { categorias, ordemCategorias } = agruparPorCategoria();

  return (
    <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-8">
      {ordemCategorias.map(categoria => {
        const camposCategoria = categorias[categoria];
        if (!camposCategoria || camposCategoria.length === 0) return null;
        
        return (
          <div key={categoria} className="space-y-4">
            <h2 className="text-xl font-semibold border-b pb-2">{categoria}</h2>
            <div className="space-y-4 pl-2">
              {camposCategoria.map((campo: any) => (
                <div key={campo.id} className="space-y-2">
                  <Label htmlFor={campo.id}>
                    {campo.rotulo.includes("|") ? campo.rotulo.split("|")[0] : campo.rotulo}
                    {campo.obrigatorio === 1 && <span className="text-red-500 ml-1">*</span>}
                  </Label>
                  {renderCampo(campo)}
                </div>
              ))}
            </div>
          </div>
        );
      })}
      
      <div className="flex justify-end pt-4">
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
