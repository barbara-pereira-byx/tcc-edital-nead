import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { prisma } from '@/lib/prisma'
import { existsSync } from 'fs';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const label = formData.get('label') as string;
    
    if (!file) {
      return NextResponse.json(
        { error: 'Nenhum arquivo enviado' },
        { status: 400 }
      );
    }

    // Criar diretório de uploads se não existir
    const uploadDir = join(process.cwd(), 'public', 'uploads');
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Gerar nome de arquivo único
    const timestamp = Date.now();
    const originalName = file.name.replace(/\s+/g, '-').toLowerCase();
    const fileName = `${timestamp}-${originalName}`;
    const filePath = join(uploadDir, fileName);
    
    // Converter o arquivo para ArrayBuffer e salvar
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Salvar o arquivo no sistema de arquivos
    await writeFile(filePath, buffer);
    
    // Retornar o caminho relativo do arquivo e o rótulo
    const relativePath = `/uploads/${fileName}`;
    
    return NextResponse.json({ 
      url: relativePath,
      label: label,
      fileName: file.name
    });
  } catch (error) {
    console.error('Erro ao fazer upload do arquivo:', error);
    return NextResponse.json(
      { error: 'Falha ao processar o upload do arquivo' },
      { status: 500 }
    );
  }
}
