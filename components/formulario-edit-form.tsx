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
import type { CampoFormulario } from "@prisma/client"

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
  // Usar localStorage para persistir as categorias entre sessões
  const categoriasIniciais = [
    "Dados Pessoais",
    "Identidade",
    "Endereço",
    "Contato",
    "Documentos"
  ];
  
  const [categorias, setCategorias] = useState<string[]>(() => {
    // Tentar recuperar categorias do localStorage
    if (typeof window !== 'undefined') {
      const categoriasArmazenadas = localStorage.getItem('formulario-categorias');
      if (categoriasArmazenadas) {
        try {
          return JSON.parse(categoriasArmazenadas);
        } catch (e) {
          console.error("Erro ao carregar categorias do localStorage:", e);
        }
      }
    }
    return categoriasIniciais;
  })
  const [novaCategoria, setNovaCategoria] = useState("")
  const [mostrarCampoNovaCategoria, setMostrarCampoNovaCategoria] = useState<number | null>(null)

  interface CampoComArquivo extends CampoFormulario {
    arquivoFile: File | null
    secao: string
    categoria: string
    nome: string
    tamanho?: string
  }

  const [campos, setCampos] = useState<CampoComArquivo[]>(() => {
    // Extrair categorias únicas dos campos existentes
    const categoriasExistentes = new Set(categorias);
    formulario.campos.forEach((campo: any) => {
      if (campo.categoria && !categoriasExistentes.has(campo.categoria)) {
        categoriasExistentes.add(campo.categoria);
      }
    });
    const todasCategorias = Array.from(categoriasExistentes) as string[];
    setCategorias(todasCategorias);
    
    // Salvar no localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('formulario-categorias', JSON.stringify(todasCategorias));
    }
    
    return formulario.campos
      .sort((a: any, b: any) => (a.ordem || 0) - (b.ordem || 0)) // Ordenar pelos campos existentes
      .map((campo: any, index: number) => {
        // Para campos existentes, garantir que o formato está correto
        // Usar o rotulo como nome para campos existentes
        const nome = campo.rotulo || "Campo sem nome";
        let rotulo = "";
        
        // Para campos de checkbox e select, o rotulo é importante
        if (campo.tipo === 3 || campo.tipo === 4) {
          rotulo = campo.rotulo || "";
        }
        
        return {
          id: campo.id,
          nome: nome, // Usar rotulo como nome para compatibilidade
          rotulo: rotulo, // Rotulo específico para checkbox e select
          tipo: campo.tipo,
          obrigatorio: campo.obrigatorio,
          secao: campo.secao || "Geral",
          categoria: campo.categoria || categorias[0] || "Dados Pessoais", // Usar categoria do campo ou primeira disponível
          tamanho: campo.tamanho || "255", // Tamanho padrão para campos de texto
          arquivoFile: null,
          ordem: campo.ordem || index + 1, // Usar ordem existente ou índice + 1
          formularioId: campo.formularioId,
          createdAt: campo.createdAt,
          updatedAt: campo.updatedAt,
        };
      });
  })

  const tiposCampo = [
    { valor: "0", nome: "Texto" },
    { valor: "1", nome: "Área de Texto" },
    { valor: "3", nome: "Seleção (Select)" },
    { valor: "4", nome: "Checkbox" },
    { valor: "5", nome: "Data" },
    { valor: "6", nome: "Arquivo" },
  ]

  const adicionarCampo = () => {
    // Encontrar a maior ordem atual e adicionar 1
    const maiorOrdem = Math.max(...campos.map((c) => c.ordem || 0), 0)

    setCampos([
      ...campos,
      {
        id: `temp-${Date.now()}`, // Usar timestamp para evitar conflitos
        nome: "Novo Campo", // Nome padrão inicial
        rotulo: "", // Rotulo vazio para campos que não são checkbox ou select
        tipo: 0,
        obrigatorio: 1,
        secao: "Geral",
        categoria: categorias.length > 0 ? categorias[0] : "Dados Pessoais", // Usar a primeira categoria disponível
        tamanho: "255", // Tamanho padrão para campos de texto
        arquivoFile: null,
        ordem: maiorOrdem + 1,
        formularioId: formulario.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ])
  }

  const removerCampo = (index: number) => {
    const novosCampos = [...campos]
    novosCampos.splice(index, 1)

    // Reordenar todos os campos após remoção
    const camposReordenados = novosCampos.map((campo, i) => ({
      ...campo,
      ordem: i + 1,
    }))

    setCampos(camposReordenados)
  }

  const moverCampoParaCima = (index: number) => {
    if (index === 0) return

    const novosCampos = [...campos]

    // Trocar as posições no array
    const temp = novosCampos[index]
    novosCampos[index] = novosCampos[index - 1]
    novosCampos[index - 1] = temp

    // Atualizar a ordem baseada na nova posição
    const camposReordenados = novosCampos.map((campo, i) => ({
      ...campo,
      ordem: i + 1,
    }))

    setCampos(camposReordenados)
  }

  const moverCampoParaBaixo = (index: number) => {
    if (index === campos.length - 1) return

    const novosCampos = [...campos]

    // Trocar as posições no array
    const temp = novosCampos[index]
    novosCampos[index] = novosCampos[index + 1]
    novosCampos[index + 1] = temp

    // Atualizar a ordem baseada na nova posição
    const camposReordenados = novosCampos.map((campo, i) => ({
      ...campo,
      ordem: i + 1,
    }))

    setCampos(camposReordenados)
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

    // Verificar se todos os campos têm nome
    for (const campo of campos) {
      if (!campo.nome) {
        toast({
          title: "Erro ao atualizar formulário",
          description: "Todos os campos devem ter um nome",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }
      
      // Para campos de checkbox e select, verificar se têm rotulo
      if ((campo.tipo === 3 || campo.tipo === 4) && !campo.rotulo) {
        toast({
          title: "Erro ao atualizar formulário",
          description: `O campo "${campo.nome}" precisa ter opções ou texto definido`,
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }
    }
    
    // Log para depuração
    console.log("Campos a serem enviados:", campos.map(c => ({
      id: c.id,
      nome: c.nome,
      rotulo: c.rotulo,
      tipo: c.tipo,
      categoria: c.categoria // Incluir categoria no log para verificar
    })))
    
    // Log das categorias disponíveis
    console.log("Categorias disponíveis:", categorias)

    try {
      // Log das categorias antes do envio
      console.log("Categorias antes do envio:", categorias);
      console.log("Campos com suas categorias:", campos.map(c => ({ 
        nome: c.nome.substring(0, 20) + "...", 
        categoria: c.categoria 
      })));
      
      // Garantir que os campos estão com ordem sequencial correta
      const camposOrdenados = campos.map((campo, index) => ({
        ...campo,
        ordem: index + 1,
      }))

      // Enviar os dados, excluindo arquivoFile do JSON
      const response = await fetch(`/api/formularios/${formulario.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          titulo,
          dataInicio,
          dataFim,
          campos: camposOrdenados.map(({ arquivoFile, ...rest }) => {
            // Preparar os campos para envio conforme esperado pela API
            // Garantir que todos os campos necessários sejam enviados
            return {
              ...rest,
              nome: rest.nome || "Campo sem nome", // Garantir que nome nunca seja undefined
              rotulo: rest.rotulo || "", // Rotulo pode ser vazio para campos que não são checkbox ou select
              categoria: rest.categoria, // Enviar a categoria exatamente como está
              tamanho: rest.tamanho || "255", // Tamanho padrão para campos de texto
              tipo: Number(rest.tipo), // Garantir que tipo seja número
              obrigatorio: Number(rest.obrigatorio), // Garantir que obrigatorio seja número
            };
          }),
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
              <h4 className="font-semibold">
                Campo #{String(index + 1).padStart(3, "0")}
                <span className="text-sm text-gray-500 ml-2">(Ordem: {campo.ordem})</span>
              </h4>
              <div className="flex items-center ml-2 space-x-1">
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
                  title="Remover campo"
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
                    const novoTipo = Number.parseInt(value)
                    
                    novosCampos[index].tipo = novoTipo
                    
                    // Reset arquivoFile ao mudar tipo
                    if (novoTipo !== 6) {
                      novosCampos[index].arquivoFile = null
                    }
                    
                    // Se mudar para checkbox, ajustar o rótulo
                    if (novoTipo === 4 && campo.tipo !== 4) {
                      // Usar o nome do campo como texto do checkbox
                      novosCampos[index].rotulo = "Concordo com os termos"
                    } else if ((novoTipo === 3 || novoTipo === 2) && (campo.tipo !== 3 && campo.tipo !== 2)) {
                      // Para campos de seleção, inicializar opções vazias
                      novosCampos[index].rotulo = ""
                    } else if (novoTipo !== 3 && novoTipo !== 2 && novoTipo !== 4) {
                      // Para outros tipos, limpar o rótulo
                      novosCampos[index].rotulo = ""
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
              <div className="space-y-2">
                <Label htmlFor={`categoria-${index}`}>Categoria</Label>
                {mostrarCampoNovaCategoria === index ? (
                  <div className="flex gap-2">
                    <Input
                      value={novaCategoria}
                      onChange={(e) => setNovaCategoria(e.target.value)}
                      placeholder="Digite o nome da nova categoria"
                      className="flex-1"
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        if (novaCategoria.trim() !== "") {
                          const categoriaTrimmed = novaCategoria.trim();
                          
                          // Adicionar a nova categoria à lista global
                          const novasCategorias = [...categorias, categoriaTrimmed];
                          setCategorias(novasCategorias);
                          
                          // Salvar no localStorage
                          if (typeof window !== 'undefined') {
                            localStorage.setItem('formulario-categorias', JSON.stringify(novasCategorias));
                          }
                          
                          // Atualizar o campo atual com a nova categoria
                          const novosCampos = [...campos];
                          novosCampos[index].categoria = categoriaTrimmed;
                          setCampos(novosCampos);
                          
                          // Limpar e fechar o campo de nova categoria
                          setNovaCategoria("");
                          setMostrarCampoNovaCategoria(null);
                          
                          // Log para debug
                          console.log(`Nova categoria adicionada: "${categoriaTrimmed}"`);
                          console.log("Lista de categorias atualizada:", novasCategorias);
                        }
                      }}
                    >
                      Adicionar
                    </Button>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        setNovaCategoria("");
                        setMostrarCampoNovaCategoria(null);
                      }}
                    >
                      Cancelar
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Select
                        value={campo.categoria}
                        onValueChange={(value) => {
                          if (value === "nova_categoria") {
                            setMostrarCampoNovaCategoria(index);
                            return;
                          }
                          const novosCampos = [...campos];
                          novosCampos[index].categoria = value;
                          setCampos(novosCampos);
                          console.log(`Categoria selecionada para campo ${index}: ${value}`);
                        }}
                      >
                        <SelectTrigger id={`categoria-${index}`}>
                          <SelectValue placeholder="Selecione a categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          {categorias.map((cat) => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                          ))}
                          <SelectItem value="nova_categoria">+ Nova Categoria</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={() => setMostrarCampoNovaCategoria(index)}
                    >
                      +
                    </Button>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
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

            {/* Nome do campo - sempre exibir para todos os tipos */}
            <div className="space-y-2">
              <Label htmlFor={`nome-${index}`}>Nome do Campo</Label>
              <Input
                id={`nome-${index}`}
                value={campo.nome || ""}
                onChange={(e) => {
                  const novosCampos = [...campos]
                  novosCampos[index].nome = e.target.value
                  setCampos(novosCampos)
                }}
                placeholder="Ex: Nome Completo"
                required
              />
            </div>

            {/* Campo de tamanho para texto e área de texto */}
            {(campo.tipo === 0 || campo.tipo === 1) && (
              <div className="space-y-2">
                <Label htmlFor={`tamanho-${index}`}>Tamanho Máximo</Label>
                <Input
                  id={`tamanho-${index}`}
                  type="number"
                  min={1}
                  max={255}
                  value={campo.tamanho || "255"}
                  onChange={(e) => {
                    const novosCampos = [...campos]
                    novosCampos[index].tamanho = e.target.value
                    setCampos(novosCampos)
                  }}
                />
              </div>
            )}

            {/* Campo checkbox ou select - texto/opções */}
            {(campo.tipo === 3 || campo.tipo === 4) && (
              <div className="space-y-2">
                <Label htmlFor={`rotulo-${index}`}>{campo.tipo === 3 ? "Opções (separadas por vírgula)" : "Texto do Checkbox"}</Label>
                <Input
                  id={`rotulo-${index}`}
                  value={campo.rotulo || ""}
                  onChange={(e) => {
                    const novosCampos = [...campos]
                    novosCampos[index].rotulo = e.target.value
                    setCampos(novosCampos)
                  }}
                  placeholder={campo.tipo === 3 ? "Ex: Opção 1, Opção 2, Opção 3" : "Ex: Concordo com os termos"}
                />
                {campo.tipo === 4 && (
                  <p className="text-xs text-muted-foreground">Este texto aparecerá no botão de checkbox</p>
                )}
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
