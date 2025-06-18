import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
    }

    const contentType = req.headers.get("content-type") || "";
    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json({ message: "Formato de requisição inválido" }, { status: 400 });
    }

    const formData = await req.formData();
    const formularioId = formData.get("formularioId") as string;

    if (!formularioId) {
      return NextResponse.json({ message: "ID do formulário não fornecido" }, { status: 400 });
    }

    const formulario = await prisma.formulario.findUnique({
      where: { id: formularioId },
      include: { campos: true },
    });

    if (!formulario) {
      return NextResponse.json({ message: "Formulário não encontrado" }, { status: 404 });
    }

    const inscricaoExistente = await prisma.formularioUsuario.findFirst({
      where: {
        formularioId,
        usuarioId: session.user.id,
      },
    });

    // Função para processar um arquivo
    const processarArquivo = async (
      file: File,
      campoResultId: string,
      inscricaoId: string
    ) => {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      await prisma.arquivoUsuario.create({
        data: {
          nomeOriginal: file.name,
          arquivo: buffer,
          tamanho: file.size,
          tipo: file.type,
          campoId: campoResultId,
          inscricaoId: inscricaoId,
        },
      });
    };

    if (inscricaoExistente && inscricaoExistente.status === "CANCELADO") {
      await prisma.arquivoUsuario.deleteMany({ where: { inscricaoId: inscricaoExistente.id } });
      await prisma.formularioUsuarioCampo.deleteMany({ where: { formularioUsuarioId: inscricaoExistente.id } });

      const inscricaoReativada = await prisma.formularioUsuario.update({
        where: { id: inscricaoExistente.id },
        data: { status: "ATIVO" as any },
      });

      for (const campo of formulario.campos) {
        const value = formData.get(campo.id);

        if (value === null) continue;

        if (campo.tipo === 6) {
          const files = formData.getAll(campo.id);
          const campoResult = await prisma.formularioUsuarioCampo.create({
            data: {
              valor: files.length > 1 ? `${files.length} arquivos anexados` : files[0] instanceof File ? (files[0] as File).name : "",
              campoFormularioId: campo.id,
              formularioUsuarioId: inscricaoReativada.id,
            },
          });

          for (const fileItem of files) {
            if (fileItem instanceof File) {
              const storagePath = `inscricoes/${session.user.id}/${inscricaoReativada.id}/${fileItem.name}`;
              await processarArquivo(fileItem, campoResult.id, inscricaoReativada.id, storagePath);
            }
          }
        } else {
          await prisma.formularioUsuarioCampo.create({
            data: {
              valor: value.toString(),
              campoFormularioId: campo.id,
              formularioUsuarioId: inscricaoReativada.id,
            },
          });
        }
      }

      return NextResponse.json({ id: inscricaoReativada.id, message: "Inscrição reativada com sucesso" }, { status: 200 });
    } else if (inscricaoExistente) {
      return NextResponse.json({ message: "Você já se inscreveu neste edital" }, { status: 400 });
    }

    const hoje = new Date();
    const dataInicio = new Date(formulario.dataInicio);
    const dataFim = new Date(formulario.dataFim);
    dataFim.setHours(23, 59, 59, 999);

    if (hoje < dataInicio || hoje > dataFim) {
      return NextResponse.json({ message: "O período de inscrições não está aberto" }, { status: 400 });
    }

    const camposObrigatorios = formulario.campos.filter((campo) => campo.obrigatorio === 1);
    for (const campo of camposObrigatorios) {
      if (!formData.has(campo.id)) {
        return NextResponse.json({ message: `O campo "${campo.rotulo.split("|")[0]}" é obrigatório` }, { status: 400 });
      }
    }

    const inscricao = await prisma.formularioUsuario.create({
      data: {
        usuarioId: session.user.id,
        formularioId,
      },
    });

    for (const campo of formulario.campos) {
      if (campo.tipo === 6) {
        const files = formData.getAll(campo.id);
        const campoResult = await prisma.formularioUsuarioCampo.create({
          data: {
            valor: files.length > 1 ? `${files.length} arquivos anexados` : files[0] instanceof File ? (files[0] as File).name : "",
            campoFormularioId: campo.id,
            formularioUsuarioId: inscricao.id,
          },
        });

        for (const fileItem of files) {
          if (fileItem instanceof File) {
            const storagePath = `inscricoes/${session.user.id}/${inscricao.id}/${fileItem.name}`;
            await processarArquivo(fileItem, campoResult.id, inscricao.id, storagePath);
          }
        }
      } else {
        const value = formData.get(campo.id);
        if (value !== null) {
          await prisma.formularioUsuarioCampo.create({
            data: {
              valor: value.toString(),
              campoFormularioId: campo.id,
              formularioUsuarioId: inscricao.id,
            },
          });
        }
      }
    }

    return NextResponse.json({ id: inscricao.id }, { status: 201 });
  } catch (error) {
    console.error("Erro ao realizar inscrição:", error);
    return NextResponse.json({ message: "Erro ao realizar inscrição" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const formularioId = searchParams.get("formularioId")

    const where: any = {}

    // Se for administrador e tiver um formularioId, busca todas as inscrições daquele formulário
    if (session.user.tipo === 1 && formularioId) {
      where.formularioId = formularioId
    } else {
      // Se for usuário comum, busca apenas suas inscrições
      where.usuarioId = session.user.id

      // Se tiver um formularioId, filtra por ele também
      if (formularioId) {
        where.formularioId = formularioId
      }
    }

    const inscricoes = await prisma.formularioUsuario.findMany({
      where,
      include: {
        formulario: {
          include: {
            edital: true,
          },
        },
        usuario: true,
      },
      orderBy: {
        dataHora: "desc",
      },
    })

    return NextResponse.json(inscricoes)
  } catch (error) {
    console.error("Erro ao buscar inscrições:", error)
    return NextResponse.json({ message: "Erro ao buscar inscrições" }, { status: 500 })
  }
}
