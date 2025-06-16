import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const rotulo = formData.get("rotulo") as string;
    const editalId = formData.get("editalId") as string;

    if (!file || !rotulo) {
      return NextResponse.json({ error: "Arquivo ou rótulo faltando." }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Criar o arquivo sem associar ao edital inicialmente
    // A associação será feita depois quando o edital for criado
    // Preservar o nome original do arquivo incluindo a extensão
    const nomeArquivo = file.name;
    const rotuloFinal = rotulo.includes('.') ? rotulo : `${rotulo}${nomeArquivo.substring(nomeArquivo.lastIndexOf('.'))}`;
    
    const novoArquivo = await prisma.arquivoEdital.create({
      data: {
        rotulo: rotuloFinal,
        arquivo: buffer,
        ...(editalId !== "temp" ? { edital: { connect: { id: editalId } } } : {}),
      },
    });

    return NextResponse.json({
      message: "Arquivo salvo no MongoDB com sucesso!",
      id: novoArquivo.id,
    });

  } catch (error: any) {
    console.error("Erro ao salvar ArquivoEdital:", error);
    return NextResponse.json({ error: error.message || "Erro interno" }, { status: 500 });
  }
}