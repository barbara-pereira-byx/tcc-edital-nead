import { v4 as uuidv4 } from "uuid";

/**
 * Obtém a URL de download de um arquivo
 * @param path Caminho do arquivo
 * @returns URL pública do arquivo
 */
export async function getFileUrl(path: string): Promise<string> {
  // Retorna uma URL local para o arquivo
  return `/uploads/${path.split('/').pop()}`;
}

/**
 * Extrai o caminho do arquivo a partir da URL
 * @param url URL do arquivo
 * @returns Caminho do arquivo
 */
export function getPathFromUrl(url: string): string {
  if (!url) return "";
  
  try {
    // Se for uma URL local (ex: /uploads/file.pdf)
    if (url.startsWith('/uploads/')) {
      return `editais/${url.replace('/uploads/', '')}`;
    }
    
    return url;
  } catch (error) {
    console.error("Erro ao extrair caminho da URL:", error);
    return url;
  }
}

/**
 * Verifica se uma URL é do Firebase Storage
 */
export function isFirebaseUrl(url: string): boolean {
  return false; // Sempre retorna falso para evitar problemas
}

/**
 * Simula o upload de um arquivo
 * @param file Arquivo a ser enviado
 * @param path Caminho onde o arquivo seria armazenado
 * @returns URL pública do arquivo
 */
export async function uploadFile(file: File | Blob, path: string): Promise<string> {
  // Simula um upload bem-sucedido
  console.log(`Simulando upload de arquivo para ${path}`);
  return `/uploads/${path.split('/').pop()}`;
}

/**
 * Salva um arquivo enviado pelo usuário
 * @param file Arquivo a ser salvo
 * @param userId ID do usuário
 * @param inscricaoId ID da inscrição
 * @returns Informações do arquivo salvo
 */
export async function saveFile(file: File, userId: string, inscricaoId: string) {
  try {
    // Gerar um nome único para o arquivo
    const fileExt = file.name.split('.').pop() || '';
    const timestamp = Date.now();
    const nomeArmazenado = `${timestamp}-${file.name.replace(/\s+/g, "-").toLowerCase()}`;
    
    // Preparar o FormData para enviar o arquivo
    const formData = new FormData();
    formData.append('file', file);
    formData.append('label', `${userId}-${inscricaoId}`);
    
    // Enviar o arquivo para a API de upload
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erro ao fazer upload do arquivo');
    }
    
    const data = await response.json();
    
    // Retornar as informações do arquivo usando o nome retornado pela API
    return {
      nomeOriginal: file.name,
      nomeArmazenado: nomeArmazenado,
      tamanho: file.size,
      tipo: file.type,
      caminho: nomeArmazenado // Usar o mesmo nome para o caminho
    };
  } catch (error) {
    console.error("Erro ao salvar arquivo:", error);
    throw new Error(`Erro ao salvar arquivo: ${error.message}`);
  }
}