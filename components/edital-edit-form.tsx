"use client"

import type React from "react"
import { Eye, EyeOff } from "lucide-react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DatePicker } from "@/components/date-picker"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent } from "@/components/ui/card"
import { FileUploadArea } from "./file-upload-area"
import { useRouter } from "next/navigation"
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog"

interface Edital {
  id: string
  codigo: string
  titulo: string
  senha: string
  dataCriacao: string
  dataPublicacao: string
  dataEncerramento: string
  arquivos: { id: string; rotulo: string }[]
}

interface EditalEditFormProps {
  edital: Edital
}

interface FileUpload {
  file: File | null
  label: string
  progress?: number
  status?: "idle" | "uploading" | "success" | "error"
  url?: string
  id?: string
}

export function EditalEditForm({ edital }: EditalEditFormProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const [codigo, setCodigo] = useState("")
  const [titulo, setTitulo] = useState("")
  const [dataCriacao, setDataCriacao] = useState<Date | undefined>(undefined)
  const [dataPublicacao, setDataPublicacao] = useState<Date | undefined>(undefined)
  const [dataEncerramento, setDataEncerramento] = useState<Date | undefined>(undefined)
  const [senha, setSenha] = useState("")
  const [arquivos, setArquivos] = useState<FileUpload[]>([])
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const [editalToEncerrar, setEditalToEncerrar] = useState<string | null>(null)

  useEffect(() => {
    if (edital) {
      setCodigo(edital.codigo || "")
      setTitulo(edital.titulo)
      setSenha(edital.senha || "")
      setDataCriacao(new Date(edital.dataCriacao))
      setDataPublicacao(new Date(edital.dataPublicacao))
      setDataEncerramento(edital.dataEncerramento ? new Date(edital.dataEncerramento) : undefined)

      setArquivos(
        edital.arquivos.map((a) => ({
          file: null,
          label: a.rotulo,
          status: "success",
          url: `/api/upload/${a.id}`,
          id: a.id,
        })),
      )
    }
  }, [edital])

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
    newArquivos[index].label = label
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

  const uploadFile = async (file: File, label: string, index: number): Promise<string> => {
    try {
      const newArquivos = [...arquivos];
      newArquivos[index] = { ...newArquivos[index], status: "uploading", progress: 0 };
      setArquivos(newArquivos);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("rotulo", label);
      formData.append("editalId", edital.id);

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


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Primeiro, fazemos upload de todos os novos arquivos
      const filePromises = arquivos
        .filter((arquivo) => arquivo.file)
        .map((arquivo, index) => {
          if (arquivo.file) {
            return uploadFile(arquivo.file, arquivo.label, index)
          }
          return Promise.resolve("")
        })

      await Promise.all(filePromises)

      // Agora preparamos os dados para enviar ao servidor
      const arquivosData = arquivos
        .map((arquivo) => ({
          id: arquivo.id, // Incluir ID se existir (para arquivos existentes)
          rotulo: arquivo.label,
        }))
        .filter((arquivo) => arquivo.id) // Filtrar apenas arquivos com ID

      const body = {
        codigo,
        titulo,
        senha,
        dataCriacao: dataCriacao?.toISOString() || "",
        dataPublicacao: dataPublicacao?.toISOString() || "",
        dataEncerramento: dataEncerramento?.toISOString() || "",
        arquivos: arquivosData,
      }

      const response = await fetch(`/api/editais/${edital.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (response.ok) {
        toast({
          title: "Edital atualizado",
          description: "As informações foram salvas com sucesso.",
        })

        // Forçar atualização da página para mostrar as mudanças
        router.refresh()
      } else {
        const error = await response.json()
        toast({
          title: "Erro ao atualizar",
          description: error.message || "Ocorreu um erro ao salvar o edital.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Erro ao salvar edital:", error)
      toast({
        title: "Erro ao atualizar",
        description: "Ocorreu um erro ao tentar salvar o edital.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleEncerrar = async (id: string) => {
    try {
      const response = await fetch(`/api/editais/${id}/encerrar`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ dataEncerramento: new Date().toISOString() }),
      });

      if (response.ok) {
        toast({
          title: "Edital encerrado",
          description: "O edital foi encerrado com sucesso",
        });
        router.refresh();
      } else {
        const error = await response.json();
        toast({
          title: "Erro ao encerrar edital",
          description: error.message || "Ocorreu um erro ao tentar encerrar o edital",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro ao encerrar edital",
        description: "Ocorreu um erro ao tentar encerrar o edital",
        variant: "destructive",
      });
    } finally {
      setEditalToEncerrar(null);
    }
  };

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
                  readOnly
                  className="bg-slate-50 cursor-not-allowed"
                  placeholder="Ex: EDITAL-2024-001"
                />
                <p className="text-xs text-muted-foreground">O código do edital não pode ser alterado após a criação</p>
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
                  <DatePicker date={dataCriacao} setDate={setDataCriacao} disabled={true} />
                </div>
                <div className="space-y-2">
                  <Label>Data de Publicação</Label>
                  <DatePicker date={dataPublicacao} setDate={setDataPublicacao} />
                </div>
                <div className="space-y-2">
                  <Label>Data de Encerramento</Label>
                  <DatePicker date={dataEncerramento} setDate={setDataEncerramento} />
                </div>
                {/* URL para Lista de Inscritos */}
                <div className="grid gap-2 mt-4">
                  <Label htmlFor="urlInscritos">URL para Lista de Inscritos</Label>
                  <div className="flex gap-2">
                    <Input
                      id="urlInscritos"
                      type="text"
                      value={
                        typeof window !== "undefined"
                          ? `${window.location.origin}/editais/${edital.id}/inscritos?token=${edital.senha}`
                          : ""
                      }
                      readOnly
                      className="font-mono text-sm bg-slate-50 flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        const url = `${window.location.origin}/editais/${edital.id}/inscritos?token=${edital.senha}`
                        navigator.clipboard.writeText(url)
                        toast({
                          title: "Link copiado",
                          description: "O link foi copiado para a área de transferência",
                        })
                      }}
                    >
                      Copiar
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Este link permite acesso à lista de inscritos deste edital. Compartilhe apenas com pessoas autorizadas.
                  </p>
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
                    <Button
                      type="button"
                      onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                      className="ml-2"
                    >
                      {isPasswordVisible ? <EyeOff /> : <Eye />}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="ml-2"
                      onClick={() => {
                        navigator.clipboard.writeText(senha);
                        toast({
                          title: "Senha copiada",
                          description: "A senha foi copiada para a área de transferência",
                        });
                      }}
                    >
                      Copiar
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

      <div className="flex justify-between items-center mt-4">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              type="button"
              variant="destructive"
              onClick={() => setEditalToEncerrar(edital.id)}
            >
              Encerrar edital
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Encerrar Edital</AlertDialogTitle>
              <AlertDialogDescription>
                Deseja realmente encerrar este edital? Após encerrado, não será possível receber novas inscrições.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => handleEncerrar(edital.id)}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Encerrar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Button type="submit" disabled={isLoading} className="bg-primary hover:bg-primary/90">
          {isLoading ? "Salvando..." : "Salvar Alterações"}
        </Button>
      </div>

    </form>
  )
}
