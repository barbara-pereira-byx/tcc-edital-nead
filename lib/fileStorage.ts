import { ref, getDownloadURL, getMetadata, uploadBytes } from "firebase/storage";
import { storage } from "./firebase";

/**
 * Obtém a URL de download de um arquivo no Firebase Storage
 * @param path Caminho do arquivo no storage
 * @returns URL pública do arquivo
 */
export async function getFileUrl(path: string): Promise<string> {
  try {
    const fileRef = ref(storage, path);
    return await getDownloadURL(fileRef);
  } catch (error) {
    console.error("Erro ao obter URL do arquivo:", error);
    throw error;
  }
}

/**
 * Extrai o caminho do arquivo a partir da URL do Firebase Storage
 * @param url URL do Firebase Storage
 * @returns Caminho do arquivo no storage
 */
export function getPathFromUrl(url: string): string {
  if (!url) return "";
  
  try {
    // Extrai o token de caminho da URL do Firebase
    const urlObj = new URL(url);
    const pathMatch = urlObj.pathname.match(/\/o\/(.+?)(?:\?|$)/);
    
    if (pathMatch && pathMatch[1]) {
      // Decodifica o caminho do arquivo
      return decodeURIComponent(pathMatch[1]);
    }
    
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
  return url && url.includes('firebasestorage.googleapis.com');
}

/**
 * Faz upload de um arquivo para o Firebase Storage
 * @param file Arquivo a ser enviado
 * @param path Caminho onde o arquivo será armazenado
 * @returns URL pública do arquivo
 */
export async function uploadFile(file: File | Blob, path: string): Promise<string> {
  try {
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file);
    return await getDownloadURL(snapshot.ref);
  } catch (error) {
    console.error("Erro ao fazer upload do arquivo:", error);
    throw error;
  }
}