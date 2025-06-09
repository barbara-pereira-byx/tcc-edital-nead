import { type NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "./firebase-config";

// Configuração para o limite de tamanho do corpo da requisição
export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Tempo máximo em segundos
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const label = formData.get("label") as string;

    if (!file) {
      return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 });
    }

    // Validar tipo de arquivo
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "image/jpeg",
      "image/png",
      "image/gif",
      "text/plain",
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Tipo de arquivo não permitido" }, { status: 400 });
    }

    // Validar tamanho do arquivo (máximo 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: "Arquivo muito grande. Máximo 10MB permitido." }, { status: 400 });
    }

    // Gerar nome de arquivo único
    const timestamp = Date.now();
    const originalName = file.name.replace(/\s+/g, "-").toLowerCase();
    const fileName = `${timestamp}-${originalName}`;

    try {
      // Em ambiente de produção, usar Firebase Storage
      if (process.env.NODE_ENV === 'production' || process.env.USE_FIREBASE === 'true') {
        console.log("Usando Firebase Storage para armazenamento");
        
        if (!process.env.FIREBASE_STORAGE_BUCKET) {
          console.error("Firebase Storage não configurado");
          return NextResponse.json({ 
            error: "Configuração de armazenamento incompleta" 
          }, { status: 500 });
        }
        
        try {
          const bytes = await file.arrayBuffer();
          
          // Criar referência para o arquivo no Firebase Storage
          const storageRef = ref(storage, `editais/${fileName}`);
          
          // Fazer upload do arquivo usando o ArrayBuffer
          const snapshot = await uploadBytes(storageRef, bytes, {
            contentType: file.type
          });
          
          // Obter URL pública do arquivo
          const url = await getDownloadURL(snapshot.ref);
          
          console.log("Upload para Firebase Storage concluído:", url);
          
          return NextResponse.json({
            url: url,
            label: label,
            fileName: file.name
          });
        } catch (firebaseError: any) {
          console.error("Erro no Firebase Storage:", firebaseError);
          return NextResponse.json({ 
            error: `Erro no armazenamento: ${firebaseError.message}` 
          }, { status: 500 });
        }
      }
      
      // Em ambiente de desenvolvimento, salvar no sistema de arquivos local
      console.log("Salvando arquivo localmente");
      const uploadDir = join(process.cwd(), "public", "uploads");
      
      if (!existsSync(uploadDir)) {
        await mkdir(uploadDir, { recursive: true });
      }

      const filePath = join(uploadDir, fileName);
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      await writeFile(filePath, buffer);
      
      const relativePath = `/uploads/${fileName}`;
      return NextResponse.json({
        url: relativePath,
        label: label,
        fileName: file.name
      });
    } catch (uploadError: any) {
      console.error("Erro detalhado no upload:", uploadError);
      return NextResponse.json({ 
        error: `Erro no upload: ${uploadError.message || "Erro desconhecido"}` 
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error("Erro ao processar o upload do arquivo:", error);
    return NextResponse.json({ 
      error: `Falha ao processar o upload do arquivo: ${error.message || "Erro desconhecido"}` 
    }, { status: 500 });
  }
}