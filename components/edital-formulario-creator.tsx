"use client"

import type React from "react"
import { Eye, EyeOff, PlusCircle, Trash2, MoveUp, MoveDown } from "lucide-react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DatePicker } from "@/components/date-picker"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileUploadArea } from "@/components/file-upload-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface EditalFormularioCreatorProps {
  onCreated: (editalId: string, formularioId: string) => void
}

interface FileUpload {
  file: File | null
  label: string
  progress?: number
  status?: "idle" | "uploading" | "success" | "error"
  url?: string
}

interface Campo {
  id: string
  nome: string
  tipo: string
  obrigatorio: boolean
  categoria: string
  tamanho: string
  opcoes: string
}

export function EditalFormularioCreator({ onCreated }: EditalFormularioCreatorProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("edital")

  // Estados do Edital
  const [titulo, setTitulo] = useState("")
  const [dataCriacao, setDataCriacao] = useState<Date | undefined>(undefined)
  const [dataPublicacao, setDataPublicacao] = useState<Date | undefined>(undefined)
  const [dataEncerramento, setDataEncerramento] = useState<Date | undefined>(undefined)
  const [senha, setSenha] = useState("")
  const [arquivos, setArquivos] = useState<FileUpload[]>([])
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)

  // Estados do Formulário
  const [tituloFormulario, setTituloFormulario] = useState("")
  const [dataInicio, setDataInicio] = useState<Date | undefined>(undefined)
  const [dataFim, setDataFim] = useState<Date | undefined>(undefined)
  const [campos, setCampos] = useState<Campo[]>([
    {
      id: "1",
      nome: "Nome Completo",
      tipo: "0",
      obrigatorio: true,
      categoria: "Dados Pessoais",
      tamanho: "100",
      opcoes: "",
    },
    {
      id: "2",
      nome: "E-mail",
      tipo: "0",
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

  const categorias = ["Dados Pessoais", "Formação Acadêmica", "Experiência Profissional", "Documentos", "Outros"]

  useEffect(() => {
    const hoje = new Date()
    setDataCriacao(hoje)
  }, [])

  const generateRandomPassword = () => {
    const length = 20
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()"
    let password = ""

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length)
      password += charset[randomIndex]
    }

    setSenha(password)
  }

  const uploadFile = async (file: File, label: string, index: number): Promise<string> => {
    try {
      const newArquivos = [...arquivos]
      newArquivos[index] = {
        ...newArquivos[index],
        status: "uploading",
        progress: 0,
      }
      setArquivos(newArquivos)

      const formData = new FormData()
      formData.append("file", file)
      formData.append("label", label)

      const progressInterval = setInterval(() => {
        setArquivos((prev) => {
          const updated = [...prev]
          if (updated[index] && updated[index].progress !== undefined && updated[index].progress < 90) {
            updated[index] = {
              ...updated[index],
              progress: (updated[index].progress || 0) + 10,
            }
          }
          return updated
        })
      }, 300)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      clearInterval(progressInterval)

      if (!response.ok) {
        throw new Error("Erro ao fazer upload do arquivo")
      }

      const data = await response.json()

      setArquivos((prev) => {
        const updated = [...prev]
        updated[index] = {
          ...updated[index],
          status: "success",
          progress: 100,
          url: data.url,
        }
        return updated
      })

      return data.url
    } catch (error) {
      setArquivos((prev) => {
        const updated = [...prev]
        updated[index] = {
          ...updated[index],
          status: "error",
        }
        return updated
      })
      throw error
    }
  }

  const handleFileChange = (index: number, file: File) => {
    const newArquivos = [...arquivos]
    newArquivos[index] = {
      ...newArquivos[index],
      file,
      status: "idle",
    }
    setArquivos(newArquivos)
  }

  const handleLabelChange = (index: number, label: string) => {
    const newArquivos = [...arquivos]
    newArquivos[index] = {
      ...newArquivos[index],
      label,
    }
    setArquivos(newArquivos)
  }

  const addFileUpload = () => {
    setArquivos([...arquivos, { file: null, label: "", status: "idle" }])
  }

  const removeFileUpload = (index: number) => {
    const newArquivos = [...arquivos]
    newArquivos.splice(index, 1)
    setArquivos(newArquivos)
  }

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

  const validateEdital = () => {
    if (!titulo) {
      toast({
        title: "Erro ao criar edital",
        description: "O título do edital é obrigatório",
        variant: "destructive",
      })
      return false
    }

    if (!dataPublicacao) {
      toast({
        title: "Erro ao criar edital",
        description: "A data de publicação é obrigatória",
        variant: "destructive",
      })
      return false
    }

    if (dataEncerramento && dataEncerramento < dataPublicacao) {
      toast({
        title: "Erro ao criar edital",
        description: "A data de encerramento não pode ser anterior à data de publicação",
        variant: "destructive",
      })
      return false
    }

    if (dataCriacao && dataPublicacao < dataCriacao) {
      toast({
        title: "Erro ao criar edital",
        description: "A data de publicação não pode ser anterior à data de criação",
        variant: "destructive",
      })
      return false
    }

    if (!dataCriacao) {
      toast({
        title: "Erro ao criar edital",
        description: "A data de criação é obrigatória",
        variant: "destructive",
      })
      return false
    }

    return true
  }

  const validateFormulario = () => {
    if (!tituloFormulario.trim()) {
      toast({
        title: "Erro ao criar formulário",
        description: "O título do formulário é obrigatório",
        variant: "destructive",
      })
      return false
    }

    if (!dataInicio || !dataFim) {
      toast({
        title: "Erro ao criar formulário",
        description: "As datas de início e fim são obrigatórias",
        variant: "destructive",
      })
      return false
    }

    if (dataFim < dataInicio) {
      toast({
        title: "Erro ao criar formulário",
        description: "A data de fim deve ser posterior à data de início",
        variant: "destructive",
      })
      return false
    }

    if (campos.length === 0) {
      toast({
        title: "Erro ao criar formulário",
        description: "O formulário deve ter pelo menos um campo",
        variant: "destructive",
      })
      return false
    }

    for (const campo of campos) {
      if (!campo.nome.trim()) {
        toast({
          title: "Erro ao criar formulário",
          description: "Todos os campos devem ter um nome",
          variant: "destructive",
        })
        return false
      }
    }

    return true
  }

  const createEdital = async (): Promise<string> => {
    const formData = new FormData()
    const fileUrls: { url: string; rotulo: string }[] = []

    // Upload dos arquivos
    for (let i = 0; i < arquivos.length; i++) {
      const { file, label } = arquivos[i]
      if (file) {
        try {
          const url = await uploadFile(file, label, i)
          fileUrls.push({ url, rotulo: label })
        } catch (error) {
          console.error("Erro ao fazer upload do arquivo:", error)
          toast({
            title: "Erro ao fazer upload",
            description: `Falha ao enviar o arquivo "${file.name}"`,
            variant: "destructive",
          })
          throw error
        }
      }
    }

    // Adicionar dados ao FormData
    formData.append("titulo", titulo)
    formData.append("senha", senha)
    formData.append("dataCriacao", dataCriacao?.toISOString() || "")
    formData.append("dataPublicacao", dataPublicacao?.toISOString() || "")
    if (dataEncerramento) {
      formData.append("dataEncerramento", dataEncerramento?.toISOString())
    }

    fileUrls.forEach(({ url, rotulo }) => {
      formData.append("arquivos", url)
      formData.append("labels", rotulo)
    })

    const response = await fetch("/api/editais", {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Erro ao criar edital")
    }

    const data = await response.json()
    return data.id
  }

  const createFormulario = async (editalId: string): Promise<string> => {
    const response = await fetch("/api/formularios", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        titulo: tituloFormulario,
        dataInicio,
        dataFim,
        campos,
        editalId,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Erro ao criar formulário")
    }

    const data = await response.json()
    return data.id
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Validar edital
      if (!validateEdital()) {
        setIsLoading(false)
        setActiveTab("edital")
        return
      }

      // Validar formulário
      if (!validateFormulario()) {
        setIsLoading(false)
        setActiveTab("formulario")
        return
      }

      // Criar edital
      const editalId = await createEdital()

      // Criar formulário
      const formularioId = await createFormulario(editalId)

      toast({
        title: "Sucesso!",
        description: "Edital e formulário criados com sucesso.",
      })

      onCreated(editalId, formularioId)
    } catch (error) {
      console.error("Erro ao criar edital e formulário:", error)
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao criar o edital e formulário",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="edital">Dados do Edital</TabsTrigger>
          <TabsTrigger value="formulario">Configuração do Formulário</TabsTrigger>
        </TabsList>

        <TabsContent value="edital" className="space-y-6">
          <Card className="border-dashed border-2">
            <CardHeader>
              <CardTitle>Informações do Edital</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="titulo">Título do Edital</Label>
                    <Input
                      id="titulo"
                      value={titulo}
                      onChange={(e) => setTitulo(e.target.value)}
                      placeholder="Ex: Edital de Seleção para Bolsistas 2024"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label>Data de Criação</Label>
                      <DatePicker date={dataCriacao} setDate={() => {}} disabled={true} />
                    </div>
                    <div className="space-y-2">
                      <Label>Data de Publicação</Label>
                      <DatePicker date={dataPublicacao} setDate={setDataPublicacao} />
                    </div>
                    <div className="space-y-2">
                      <Label>Data de Encerramento (opcional)</Label>
                      <DatePicker date={dataEncerramento} setDate={setDataEncerramento} />
                    </div>
                    <div className="space-y-2">
                      <Label>Senha do Edital</Label>
                      <div className="flex items-center">
                        <Input
                          type={isPasswordVisible ? "text" : "password"}
                          placeholder="Digite a senha do edital"
                          value={senha}
                          onChange={(e) => setSenha(e.target.value)}
                          required
                        />
                        <Button type="button" onClick={() => setIsPasswordVisible(!isPasswordVisible)} className="ml-2">
                          {isPasswordVisible ? <EyeOff /> : <Eye />}
                        </Button>
                        <Button
                          type="button"
                          onClick={generateRandomPassword}
                          className="ml-2 bg-blue-600 text-white hover:bg-blue-700"
                        >
                          Gerar Senha
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-1">
                  <FileUploadArea
                    files={arquivos}
                    onAddFile={addFileUpload}
                    onRemoveFile={removeFileUpload}
                    onFileChange={handleFileChange}
                    onLabelChange={handleLabelChange}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="formulario" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuração do Formulário</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="tituloFormulario">Título do Formulário</Label>
                <Input
                  id="tituloFormulario"
                  value={tituloFormulario}
                  onChange={(e) => setTituloFormulario(e.target.value)}
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
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading} className="bg-red-600 hover:bg-red-700">
          {isLoading ? "Criando..." : "Criar Formulário"}
        </Button>
      </div>
    </form>
  )
}
