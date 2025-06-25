"use client"

import type React from "react"
import { Eye, EyeOff } from "lucide-react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DatePicker } from "@/components/date-picker"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent } from "@/components/ui/card"
import { FileUploadArea } from "@/components/file-upload-area"

interface EditalFormProps {
  onEditalCreated: (id: string) => void
}

interface FileUpload {
  file: File | null
  label: string
  progress?: number
  status?: "idle" | "uploading" | "success" | "error"
  url?: string
}

export function EditalForm({ onEditalCreated }: EditalFormProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [codigo, setCodigo] = useState("")
  const [titulo, setTitulo] = useState("")
  const [dataCriacao, setDataCriacao] = useState<Date | undefined>(undefined)
  const [dataPublicacao, setDataPublicacao] = useState<Date | undefined>(undefined)
  const [dataEncerramento, setDataEncerramento] = useState<Date | undefined>(undefined)
  const [senha, setSenha] = useState("")
  const [arquivos, setArquivos] = useState<FileUpload[]>([])
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const hoje = new Date()

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
      const newArquivos = [...arquivos];
      newArquivos[index] = { ...newArquivos[index], status: "uploading", progress: 0 };
      setArquivos(newArquivos);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("rotulo", label);
      formData.append("editalId", "temp"); // Será substituído após criar o edital

      const progressInterval = setInterval(() => {
        setArquivos((prev) => {
          const updated = [...prev];
          if (updated[index].progress !== undefined && updated[index].progress! < 90) {
            updated[index].progress = (updated[index].progress || 0) + 10;
          }
          return updated;
        });
      }, 300);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        throw new Error("Erro ao fazer upload do arquivo");
      }

      const data = await response.json();

      setArquivos((prev) => {
        const updated = [...prev];
        updated[index] = { 
          ...updated[index], 
          status: "success", 
          progress: 100, 
          id: data.id,
          url: `/api/upload/${data.id}` // URL para download do arquivo
        };
        return updated;
      });

      // Retorna o ID do arquivo no MongoDB
      return data.id;

    } catch (error) {
      setArquivos((prev) => {
        const updated = [...prev];
        updated[index] = { ...updated[index], status: "error" };
        return updated;
      });
      throw error;
    }
  };


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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    if (!codigo) {
      toast({
        title: "Erro ao criar edital",
        description: "O código do edital é obrigatório",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    if (!titulo) {
      toast({
        title: "Erro ao criar edital",
        description: "O título do edital é obrigatório",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    if (!dataPublicacao) {
      toast({
        title: "Erro ao criar edital",
        description: "A data de publicação é obrigatória",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    if (!dataEncerramento) {
      toast({
        title: "Erro ao criar edital",
        description: "A data de encerramento é obrigatória",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    if (arquivos.length<=0 || arquivos.every((file) => !file.file)) {
      toast({
        title: "Erro ao criar edital",
        description: "É necessário anexar pelo menos um arquivo.",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    if (arquivos.some((file) => !file.label)) {
      toast({
        title: "Erro ao criar edital",
        description: "Todos os arquivos devem ter um rótulo.",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    if (dataEncerramento && dataEncerramento < dataPublicacao) {
      toast({
        title: "Erro ao criar edital",
        description: "A data de encerramento não pode ser anterior à data de publicação",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    if (dataPublicacao && dataPublicacao < hoje && dataPublicacao.getDate() !== hoje.getDate()) { 
      toast({
        title: "Erro ao criar edital",
        description: "A data de publicação não pode ser anterior à data atual. O dia atual é permitido.",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    if (!dataCriacao) {
      toast({
        title: "Erro ao criar edital",
        description: "A data de criação é obrigatória",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    if (!senha) {
      toast({
        title: "Erro ao criar edital",
        description: "A senha do edital é obrigatória",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    try {
      const formData = new FormData()
      const fileIds: string[] = []

      for (let i = 0; i < arquivos.length; i++) {
        const { file, label } = arquivos[i]
        if (file) {
          try {
            const fileId = await uploadFile(file, label, i)
            fileIds.push(fileId)
          } catch (error) {
            console.error("Erro ao fazer upload do arquivo:", error)
            toast({
              title: "Erro ao fazer upload",
              description: `Falha ao enviar o arquivo "${file.name}"`,
              variant: "destructive",
            })
            setIsLoading(false)
            return
          }
        }
      }

      // Adicionar dados ao FormData
      formData.append("codigo", codigo)
      formData.append("titulo", titulo)
      formData.append("senha", senha)
      formData.append("dataCriacao", dataCriacao?.toISOString() || "")
      formData.append("dataPublicacao", dataPublicacao?.toISOString() || "")
      if (dataEncerramento) {
        formData.append("dataEncerramento", dataEncerramento?.toISOString())
      }

      // Adicionar IDs dos arquivos
      fileIds.forEach((id) => {
        formData.append("arquivosIds", id)
      })

      const response = await fetch("/api/editais", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        onEditalCreated(data.id)
        toast({
          title: "Sucesso!",
          description: "Edital criado com sucesso.",
        })
      } else {
        const error = await response.json()
        toast({
          title: "Erro ao criar edital",
          description: error.message || "Ocorreu um erro ao tentar criar o edital",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erro ao criar edital",
        description: "Ocorreu um erro ao tentar criar o edital",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="border-dashed border-2">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="codigo">Código do Edital</Label>
                <Input
                  id="codigo"
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value)}
                  placeholder="Ex: EDITAL-2024-001"
                  required
                />
              </div>
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

      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading} className="bg-red-600 hover:bg-red-700">
          {isLoading ? "Criando..." : "Criar Edital"}
        </Button>
      </div>
    </form>
  )
}
