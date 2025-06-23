"use client"

import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface FormularioPreviewProps {
  formulario: any
}

export function FormularioPreview({ formulario }: FormularioPreviewProps) {
  if (!formulario.campos || formulario.campos.length === 0) {
    return (
      <Alert variant="default" className="bg-slate-50 border-slate-200">
        <AlertCircle className="h-4 w-4 text-slate-500" />
        <AlertDescription>Este formulário não possui campos configurados.</AlertDescription>
      </Alert>
    )
  }

  const renderCampo = (campo: any) => {
    switch (campo.tipo) {
      case 0: // Texto curto
        return <Input disabled placeholder="Campo de texto curto" />
      case 1: // Texto longo
        return <Textarea disabled placeholder="Campo de texto longo" rows={3} />
      case 2: // Opções (Radio)
        const opcoes = campo.rotulo.includes("|") ? campo.rotulo.split("|")[1].split(",") : []
        return (
          <RadioGroup disabled>
            {opcoes.map((opcao: string, index: number) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={opcao} id={`${campo.id}-${index}`} disabled />
                <Label htmlFor={`${campo.id}-${index}`} className="text-muted-foreground">
                  {opcao.trim()}
                </Label>
              </div>
            ))}
          </RadioGroup>
        )
      case 3: // Seleção (Select)
        return (
          <Select disabled>
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma opção" />
            </SelectTrigger>
          </Select>
        )
      case 4: // Checkbox
        return (
          <div className="flex items-center space-x-2">
            <Checkbox id={campo.id} disabled />
            <Label htmlFor={campo.id} className="text-muted-foreground">
              {campo.rotulo.includes("|") ? campo.rotulo.split("|")[1] : "Concordo"}
            </Label>
          </div>
        )
      case 5: // Data
        return <Input type="date" disabled />
      case 6: // Arquivo
        return (
          <div>
            <Input type="file" disabled />
            <p className="text-sm text-muted-foreground italic">
              Apenas arquivos nos formatos PDF, DOC ou DOCX são permitidos.
            </p>
          </div>
        )
      default:
        return <Input disabled placeholder="Campo de formulário" />
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
    <div className="space-y-8">
      <p className="text-muted-foreground italic mb-4">
        Esta é uma visualização dos campos do formulário. Os usuários preencherão estes campos ao se inscreverem no
        edital.
      </p>

      {ordemCategorias.map(categoria => {
        const camposCategoria = categorias[categoria];
        if (!camposCategoria || camposCategoria.length === 0) return null;
        
        return (
          <div key={categoria} className="space-y-4">
            <h2 className="text-xl font-semibold border-b pb-2">{categoria}</h2>
            <div className="space-y-4 pl-2">
              {camposCategoria.map((campo: any) => (
                <Card key={campo.id} className="border border-slate-200">
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="font-medium">
                        {campo.rotulo.includes("|") ? campo.rotulo.split("|")[0] : campo.rotulo}
                        {campo.obrigatorio === 1 && <span className="text-red-500 ml-1">*</span>}
                      </Label>
                      <span className="text-xs text-muted-foreground px-2 py-1 bg-slate-100 rounded-full">
                        {campo.obrigatorio === 1 ? "Obrigatório" : "Opcional"}
                      </span>
                    </div>
                    {renderCampo(campo)}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  )
}
