import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.tipo !== 1) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
    }

    const formData = await req.formData();
    const titulo = formData.get('titulo') as string;
    const senha = formData.get('senha') as string;
    const dataPublicacao = formData.get('dataPublicacao') as string;
    const dataEncerramento = formData.get('dataEncerramento') as string;

    if (!titulo || !dataPublicacao || !senha) {
      return NextResponse.json({ message: "Dados incompletos" }, { status: 400 });
    }

    // Extrair arquivos do formData
    const arquivos: { url: string; rotulo: string }[] = [];
    const fileCount = formData.getAll('arquivos');
    const labels = formData.getAll('labels');

    for (let i = 0; i < fileCount.length; i++) {
      arquivos.push({
        url: fileCount[i] as string,
        rotulo: labels[i] as string,
      });
    }

    // Criar o edital
    const edital = await prisma.edital.create({
      data: {
        titulo,
        dataPublicacao: new Date(dataPublicacao),
        dataEncerramento: dataEncerramento ? new Date(dataEncerramento) : null,
        senha,
        arquivos: { // Use a notação correta para criar arquivos relacionados
          create: arquivos.map((file) => ({
            url: file.url,
            rotulo: file.rotulo,
          })),
        },
      },
    });

    return NextResponse.json({ id: edital.id }, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar edital:", error);
    return NextResponse.json({ message: "Erro ao criar edital" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const search = searchParams.get("search") || ""
    const page = Number.parseInt(searchParams.get("page") || "1")
    const perPage = Number.parseInt(searchParams.get("perPage") || "10")
    const status = searchParams.get("status")
    const dataInicioParam = searchParams.get("dataInicio")
    const dataFimParam = searchParams.get("dataFim")

    const hoje = new Date()

    function parseDate(dateStr: string | null) {
      if (!dateStr) return null
      const parts = dateStr.split("-")
      if (parts.length !== 3) return null
      const [y, m, d] = parts.map(Number)
      return new Date(y, m - 1, d)
    }

    const dataInicio = parseDate(dataInicioParam)
    const dataFim = parseDate(dataFimParam)

    const filters: any[] = []

    // Busca textual
    if (search) {
      filters.push({
        OR: [
          { titulo: { contains: search, mode: "insensitive" } },
          {
            secoes: {
              some: {
                titulo: { contains: search, mode: "insensitive" },
              },
            },
          },
        ],
      })
    }

    // Status
    if (status) {
      if (status === "abertos") {
        filters.push({
          AND: [
            { dataPublicacao: { lte: hoje } },
            {
              OR: [
                { dataEncerramento: { gte: hoje } },
                { dataEncerramento: null },
              ],
            },
          ],
        })
      } else if (status === "futuros") {
        filters.push({ dataPublicacao: { gt: hoje } })
      } else if (status === "encerrados") {
        filters.push({ dataEncerramento: { lt: hoje } })
      }
    }

    // Intervalo de datas (na publicação ou encerramento)
    if (dataInicio && dataFim) {
      filters.push({
        OR: [
          { dataPublicacao: { gte: dataInicio, lte: dataFim } },
          { dataEncerramento: { gte: dataInicio, lte: dataFim } },
        ],
      })
    } else if (dataInicio) {
      filters.push({
        OR: [
          { dataPublicacao: { gte: dataInicio } },
          { dataEncerramento: { gte: dataInicio } },
        ],
      })
    } else if (dataFim) {
      filters.push({
        OR: [
          { dataPublicacao: { lte: dataFim } },
          { dataEncerramento: { lte: dataFim } },
        ],
      })
    }

    const where = filters.length > 0 ? { AND: filters } : {}

    const editais = await prisma.edital.findMany({
      where,
      orderBy: { dataPublicacao: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
      include: {
        formulario: true,
      },
    })

    const total = await prisma.edital.count({ where })

    return NextResponse.json({
      editais,
      pagination: {
        total,
        page,
        perPage,
        totalPages: Math.ceil(total / perPage),
      },
    })
  } catch (error) {
    console.error("Erro ao buscar editais:", error)
    return NextResponse.json({ message: "Erro ao buscar editais" }, { status: 500 })
  }
}