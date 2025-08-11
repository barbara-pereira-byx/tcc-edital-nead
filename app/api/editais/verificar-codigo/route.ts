import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const codigo = searchParams.get("codigo");

    if (!codigo) {
      return NextResponse.json({ existe: false });
    }

    const editalExistente = await prisma.edital.findUnique({
      where: { codigo }
    });

    return NextResponse.json({ existe: !!editalExistente });
  } catch (error) {
    console.error("Erro ao verificar código:", error);
    return NextResponse.json({ existe: false });
  }
}