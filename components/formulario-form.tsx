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
  ordem: number
  categoria: string
  rotulo?: string // Para armazenar as opções dos campos de seleção
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
  const [campos, setCampos] = useState<Campo[]>([
    // Dados Pessoais
    {
      id: "1",
      nome: "CPF",
      tipo: "0",
      obrigatorio: true,
      tamanho: "14",
      ordem: 1,
      categoria: "Dados Pessoais"
    },
    {
      id: "2",
      nome: "Nome Completo",
      tipo: "0",
      obrigatorio: true,
      tamanho: "150",
      ordem: 2,
      categoria: "Dados Pessoais"
    },
    {
      id: "3",
      nome: "Sexo",
      tipo: "3",
      obrigatorio: true,
      tamanho: "20",
      ordem: 3,
      categoria: "Dados Pessoais",
      rotulo: "Sexo|Feminino, Masculino, Prefiro não informar"
    },
    {
      id: "4",
      nome: "Data de Nascimento",
      tipo: "5",
      obrigatorio: true,
      tamanho: "10",
      ordem: 4,
      categoria: "Dados Pessoais"
    },
    
    // Identidade
    {
      id: "5",
      nome: "Número da Identidade",
      tipo: "0",
      obrigatorio: true,
      tamanho: "20",
      ordem: 5,
      categoria: "Identidade"
    },
    {
      id: "6",
      nome: "Órgão Emissor",
      tipo: "0",
      obrigatorio: true,
      tamanho: "10",
      ordem: 6,
      categoria: "Identidade"
    },
    {
      id: "7",
      nome: "UF da Emissão",
      tipo: "3",
      obrigatorio: true,
      tamanho: "2",
      ordem: 7,
      categoria: "Identidade",
      rotulo: "UF da Emissão|AC, AL, AP, AM, BA, CE, DF, ES, GO, MA, MT, MS, MG, PA, PB, PR, PE, PI, RJ, RN, RS, RO, RR, SC, SP, SE, TO"
    },
    {
      id: "8",
      nome: "Data da Expedição",
      tipo: "5",
      obrigatorio: true,
      tamanho: "10",
      ordem: 8,
      categoria: "Identidade"
    },
    
    // Endereço
    {
      id: "9",
      nome: "CEP",
      tipo: "0",
      obrigatorio: true,
      tamanho: "9",
      ordem: 9,
      categoria: "Endereço"
    },
    {
      id: "10",
      nome: "Rua",
      tipo: "0",
      obrigatorio: true,
      tamanho: "150",
      ordem: 10,
      categoria: "Endereço"
    },
    {
      id: "11",
      nome: "Número",
      tipo: "0",
      obrigatorio: true,
      tamanho: "10",
      ordem: 11,
      categoria: "Endereço"
    },
    {
      id: "12",
      nome: "Bairro",
      tipo: "0",
      obrigatorio: true,
      tamanho: "100",
      ordem: 12,
      categoria: "Endereço"
    },
    {
      id: "13",
      nome: "Cidade",
      tipo: "0",
      obrigatorio: true,
      tamanho: "100",
      ordem: 13,
      categoria: "Endereço"
    },
    {
      id: "14",
      nome: "Estado",
      tipo: "3",
      obrigatorio: true,
      tamanho: "2",
      ordem: 14,
      categoria: "Endereço",
      rotulo: "Estado|AC, AL, AP, AM, BA, CE, DF, ES, GO, MA, MT, MS, MG, PA, PB, PR, PE, PI, RJ, RN, RS, RO, RR, SC, SP, SE, TO"
    },
    
    // Contato
    {
      id: "15",
      nome: "E-mail",
      tipo: "0",
      obrigatorio: true,
      tamanho: "100",
      ordem: 15,
      categoria: "Contato"
    },
    {
      id: "16",
      nome: "Telefone Residencial",
      tipo: "0",
      obrigatorio: false,
      tamanho: "15",
      ordem: 16,
      categoria: "Contato"
    },
    {
      id: "17",
      nome: "Telefone Celular",
      tipo: "0",
      obrigatorio: true,
      tamanho: "15",
      ordem: 17,
      categoria: "Contato"
    },
    
    // Documentos
    {
      id: "18",
      nome: "Desejo concorrer para as VAGAS DE AÇÕES AFIRMATIVAS",
      tipo: "3",
      obrigatorio: false,
      tamanho: "3",
      ordem: 18,
      categoria: "Documentos",
      rotulo: "Desejo concorrer para as VAGAS DE AÇÕES AFIRMATIVAS|SIM, NÂO"
    },
    {
      id: "19",
      nome: "Cópia dos documentos pessoais (frente e verso) do RG e CPF ou Passaporte ou documento equivalente; Para candidato estrangeiro, Carteira de Estrangeiro ou Passaporte com Visto Permanente ou Temporário",
      tipo: "6",
      obrigatorio: true,
      tamanho: "",
      ordem: 19,
      categoria: "Documentos"
    },
    {
      id: "20",
      nome: "Cópia legível (frente e verso) e em um único arquivo da documentação comprobatória da formação acadêmica (diploma e/ou certificado) concebido por Instituição de ensino reconhecida pelo MEC",
      tipo: "6",
      obrigatorio: true,
      tamanho: "",
      ordem: 20,
      categoria: "Documentos"
    },
    {
      id: "21",
      nome: "Para os(as) candidatos(as) que concorrerem nas VAGAS DE RESERVA DE COTAS constante do item 3.3 deste Edital, será exigido o Termo de Autodeclaração, constante do ANEXO III, preenchido e assinado eletronicamente pelo serviçõ gov.br",
      tipo: "6",
      obrigatorio: true,
      tamanho: "",
      ordem: 21,
      categoria: "Documentos"
    },
    {
      id: "22",
      nome: "Além dos documentos listados acima, os candidatos com diplomas de graduação expedidos por universidades estrangeiras deverão enviar cópia legível (frente e verso) do diploma revalidado pela Universidade Pública Brasileira, na forma da lei",
      tipo: "6",
      obrigatorio: true,
      tamanho: "",
      ordem: 22,
      categoria: "Documentos"
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

        // Verificar se já existe um formulário para este edital
        try {
          const formularioResponse = await fetch(`/api/editais/${editalId}/formulario`)
          if (formularioResponse.ok) {
            const formularioData = await formularioResponse.json()
            if (formularioData && formularioData.id) {
              setFormularioId(formularioData.id)
              setFormularioCriado(true)
              
              // Extrair categorias únicas dos campos existentes
              if (formularioData.campos && formularioData.campos.length > 0) {
                const categoriasExistentes = new Set(categorias)
                formularioData.campos.forEach((campo: any) => {
                  if (campo.categoria && !categoriasExistentes.has(campo.categoria)) {
                    categoriasExistentes.add(campo.categoria)
                  }
                })
                const todasCategorias = Array.from(categoriasExistentes);
                setCategorias(todasCategorias)
                
                // Salvar no localStorage
                if (typeof window !== 'undefined') {
                  localStorage.setItem('formulario-categorias', JSON.stringify(todasCategorias));
                }
              }
              
              return // Não criar um novo formulário se já existe
            }
          }
        } catch (error) {
          console.log("Nenhum formulário encontrado para este edital, criando um novo...")
        }

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
        ordem: maiorOrdem + 1,
        categoria: categorias.length > 0 ? categorias[0] : "Dados Pessoais", // Usar a primeira categoria disponível
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
      // Log das categorias antes do envio
      console.log("Categorias antes do envio:", categorias);
      console.log("Campos com suas categorias:", campos.map(c => ({ 
        nome: c.nome.substring(0, 20) + "...", 
        categoria: c.categoria 
      })));
      
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
              nome: campo.nome, // Enviar o nome do campo
              rotulo: campo.tipo === "3" || campo.tipo === "4" ? campo.rotulo : "", // Rotulo apenas para select e checkbox
              tipo: Number.parseInt(campo.tipo),
              obrigatorio: campo.obrigatorio ? 1 : 0,
              ordem: campo.ordem,
              categoria: campo.categoria, // Enviar a categoria exatamente como está
              tamanho: campo.tamanho || "255"
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
              categoria: campo.categoria,
              opcoes: campo.rotulo || "", // Usar o campo rotulo para as opções
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

            {(campo.tipo === "3" || campo.tipo === "4") && (
              <div className="space-y-2">
                <Label htmlFor={`rotulo-${index}`}>{campo.tipo === "3" ? "Opções (separadas por vírgula)" : "Texto do Checkbox"}</Label>
                <Input
                  id={`rotulo-${index}`}
                  value={campo.rotulo || ""}
                  onChange={(e) => {
                    const novosCampos = [...campos]
                    novosCampos[index].rotulo = e.target.value
                    setCampos(novosCampos)
                  }}
                  placeholder={campo.tipo === "3" ? "Ex: Opção 1, Opção 2, Opção 3" : "Ex: Concordo com os termos"}
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
