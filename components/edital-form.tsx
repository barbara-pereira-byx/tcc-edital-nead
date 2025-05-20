"use client"

import type React from "react"
import { Eye, EyeOff } from "lucide-react";
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DatePicker } from "@/components/date-picker"
import { useToast } from "@/components/ui/use-toast"
import { Trash2, FileText } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface EditalFormProps {
  onEditalCreated: (id: string) => void
}

interface FileUpload {
  file: File | null;
  label: string;
}

export function EditalForm({ onEditalCreated }: EditalFormProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [titulo, setTitulo] = useState("")
  const [dataCriacao, setDataCriacao] = useState<Date | undefined>(undefined);
  const [dataPublicacao, setDataPublicacao] = useState<Date | undefined>(undefined);
  const [dataEncerramento, setDataEncerramento] = useState<Date | undefined>(undefined);
  const [senha, setSenha] = useState("");
  const [arquivos, setArquivos] = useState<FileUpload[]>([])
  const [isPasswordVisible, setIsPasswordVisible] = useState(false); 

  useEffect(() => {
    const hoje = new Date();
    setDataCriacao(hoje);
  }, []);

  const generateRandomPassword = () => {
    const length = 20;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";
    let password = "";

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      password += charset[randomIndex];
    }

    setSenha(password);
  };

  const handleFileChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const newArquivos = [...arquivos];
      newArquivos[index] = { file: e.target.files[0], label: newArquivos[index]?.label || "" };
      setArquivos(newArquivos);
    }
  }

  const handleLabelChange = (index: number, label: string) => {
    const newArquivos = [...arquivos];
    newArquivos[index].label = label;
    setArquivos(newArquivos);
  }

  const addFileUpload = () => {
    setArquivos([...arquivos, { file: null, label: "" }]);
  };

  const removeFileUpload = (index: number) => {
    const newArquivos = arquivos.filter((_, i) => i !== index);
    setArquivos(newArquivos);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

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

    if (dataEncerramento && dataEncerramento < dataPublicacao) {
      toast({
        title: "Erro ao criar edital",
        description: "A data de encerramento não pode ser anterior à data de publicação",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    if (dataCriacao && dataPublicacao < dataCriacao) {
      toast({
        title: "Erro ao criar edital",
        description: "A data de publicação não pode ser anterior à data de criação",
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

    try {
      const formData = new FormData(); // Certifique-se de que a variável é declarada aqui
      const fileUrls: { url: string; rotulo: string }[] = [];
  
      // Upload dos arquivos
      for (const { file, label } of arquivos) {
        if (file) {
          const url = await uploadFile(file);
          fileUrls.push({ url, rotulo: label });
        }
      }
  
      // Adicionar dados ao FormData
      formData.append("titulo", titulo);
      formData.append("senha", senha);
      formData.append("dataCriacao", dataCriacao?.toISOString());
      formData.append("dataPublicacao", dataPublicacao?.toISOString());
      if (dataEncerramento) {
        formData.append("dataEncerramento", dataEncerramento?.toISOString());
      }
      fileUrls.forEach(({ url, rotulo }) => {
        formData.append("arquivos", url); // Ajuste conforme necessário
        formData.append("labels", rotulo); // Adicionar rótulos
      });
  
      const response = await fetch("/api/editais", {
        method: "POST",
        body: formData, // Usando formData corretamente
      });

      if (response.ok) {
        const data = await response.json();
        onEditalCreated(data.id); // Chame a função de callback
        toast({
          title: "Sucesso!",
          description: "Edital criado com sucesso.",
        });
      } else {
        const error = await response.json();
        toast({
          title: "Erro ao criar edital",
          description: error.message || "Ocorreu um erro ao tentar criar o edital",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro ao criar edital",
        description: "Ocorreu um erro ao tentar criar o edital",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false)
    }
  }

  const uploadFile = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Erro ao fazer upload do arquivo");
    }

    const data = await response.json();
    return data.url; // Retorne a URL do arquivo
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="border-dashed border-2">
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
                    <Button
                      type="button"
                      onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                      className="ml-2"
                    >
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

            <div className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-md">
              <FileText className="h-16 w-16 text-gray-400 mb-2" />
              <div className="text-center">
                <Button type="button" onClick={addFileUpload} className="bg-blue-600 text-white hover:bg-blue-700">
                  Adicionar Arquivo
                </Button>
              </div>
              {arquivos.map((arquivo, index) => (
                <div key={index} className="flex items-center gap-2 mt-4">
                  <Input
                    type="text"
                    placeholder="Rótulo do arquivo"
                    value={arquivo.label}
                    onChange={(e) => handleLabelChange(index, e.target.value)}
                    className="flex-1"
                  />
                  <label
                    htmlFor={`file-upload-${index}`}
                    className="cursor-pointer text-gray-900 hover:text-blue-600"
                  >
                    {arquivo.file ? arquivo.file.name : "Clique para fazer upload"}
                  </label>
                  <input
                    id={`file-upload-${index}`}
                    type="file"
                    accept=".pdf,.doc,.docx"
                    className="hidden"
                    onChange={(e) => handleFileChange(index, e)}
                  />
                  <Button type="button" onClick={() => removeFileUpload(index)} className="bg-red-600 text-white hover:bg-red-700">
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>
              ))}
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