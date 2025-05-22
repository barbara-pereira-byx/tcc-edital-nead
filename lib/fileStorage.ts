import fs from "fs"
import path from "path"
import { randomUUID } from "crypto"

// Diretório base para armazenar os arquivos
const UPLOAD_DIR = path.join(process.cwd(), "uploads")

// Garantir que o diretório de uploads existe
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true })
}

// Diretório para arquivos de usuários
const USER_FILES_DIR = path.join(UPLOAD_DIR, "user-files")
if (!fs.existsSync(USER_FILES_DIR)) {
  fs.mkdirSync(USER_FILES_DIR, { recursive: true })
}

export interface FileInfo {
  nomeOriginal: string
  nomeArmazenado: string
  tamanho: number
  tipo: string
  caminho: string
}

/**
 * Salva um arquivo no sistema de arquivos
 * @param file Arquivo a ser salvo
 * @param userId ID do usuário
 * @param inscricaoId ID da inscrição
 * @returns Informações sobre o arquivo salvo
 */
export async function saveFile(file: File, userId: string, inscricaoId: string): Promise<FileInfo> {
  // Criar diretório específico para o usuário e inscrição
  const userDir = path.join(USER_FILES_DIR, userId)
  if (!fs.existsSync(userDir)) {
    fs.mkdirSync(userDir, { recursive: true })
  }

  const inscricaoDir = path.join(userDir, inscricaoId)
  if (!fs.existsSync(inscricaoDir)) {
    fs.mkdirSync(inscricaoDir, { recursive: true })
  }

  // Gerar um nome único para o arquivo
  const fileExtension = path.extname(file.name)
  const storedFileName = `${randomUUID()}${fileExtension}`
  const filePath = path.join(inscricaoDir, storedFileName)

  // Converter o arquivo para um buffer
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  // Salvar o arquivo
  fs.writeFileSync(filePath, buffer)

  // Retornar informações sobre o arquivo
  return {
    nomeOriginal: file.name,
    nomeArmazenado: storedFileName,
    tamanho: file.size,
    tipo: file.type,
    caminho: `uploads/user-files/${userId}/${inscricaoId}/${storedFileName}`,
  }
}

/**
 * Remove um arquivo do sistema de arquivos
 * @param filePath Caminho do arquivo a ser removido
 */
export function removeFile(filePath: string): void {
  const fullPath = path.join(process.cwd(), filePath)
  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath)
  }
}

/**
 * Obtém o caminho completo para um arquivo
 * @param relativePath Caminho relativo do arquivo
 * @returns Caminho completo do arquivo
 */
export function getFilePath(relativePath: string): string {
  return path.join(process.cwd(), relativePath)
}
