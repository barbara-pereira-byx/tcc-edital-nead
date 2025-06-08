import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
    }

    const formData = await request.formData();
    const titulo = formData.get("titulo") as string;
    const senha = formData.get("senha") as string;
    const dataCriacao = new Date(formData.get("dataCriacao") as string);
    const dataPublicacao = new Date(formData.get("dataPublicacao") as string);
    const dataEncerramento = formData.get("dataEncerramento")
      ? new Date(formData.get("dataEncerramento") as string)
      : undefined;

    // Obter arquivos e rótulos
    const arquivos = formData.getAll("arquivos") as string[];
    const labels = formData.getAll("labels") as string[];

    // Criar o edital no banco de dados
    const edital = await prisma.edital.create({
      data: {
        titulo,
        senha,
        dataCriacao,
        dataPublicacao,
        dataEncerramento,
        arquivos: {
          create: arquivos.map((url, index) => ({
            url,
            rotulo: labels[index] || `Anexo ${index + 1}`,
          })),
        },
      },
    });

    return NextResponse.json({ id: edital.id });
  } catch (error) {
    console.error("Erro ao criar edital:", error);
    return NextResponse.json(
      { message: "Erro ao criar edital" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const titulo = searchParams.get("titulo");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (titulo) {
      where.titulo = {
        contains: titulo,
        mode: "insensitive",
      };
    }

    const [editais, total] = await Promise.all([
      prisma.edital.findMany({
        where,
        include: {
          anexos: true,
          _count: {
            select: {
              inscricoes: true,
            },
          },
        },
        orderBy: {
          dataCriacao: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.edital.count({ where }),
    ]);

    return NextResponse.json({
      editais,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Erro ao buscar editais:", error);
    return NextResponse.json(
      { message: "Erro ao buscar editais" },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
export const maxDuration = 60;