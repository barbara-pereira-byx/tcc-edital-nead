import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 })
    }

    // Verificar se a requisição é multipart/form-data
    const contentType = req.headers.get("content-type") || ""

    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json({ message: "Formato de requisição inválido" }, { status: 400 })
    }

    // Processar FormData
    const formData = await req.formData()
    const formularioId = formData.get("formularioId") as string

    if (!formularioId) {
      return NextResponse.json({ message: "ID do formulário não fornecido" }, { status: 400 })
    }

    // Verificar se o formulário existe
    const formulario = await prisma.formulario.findUnique({
      where: { id: formularioId },
      include: { campos: true },
    })

    if (!formulario) {
      return NextResponse.json({ message: "Formulário não encontrado" }, { status: 404 })
    }

    // Verificar se o usuário já se inscreveu neste formulário
    const inscricaoExistente = await prisma.formularioUsuario.findFirst({
      where: {
        formularioId,
        usuarioId: session.user.id,
      },
    })

    // Se existe uma inscrição e está cancelada, reativa-a e atualiza os dados
    if (inscricaoExistente && inscricaoExistente.status === "CANCELADO") {
      // Primeiro, excluir os campos e arquivos existentes
      await prisma.arquivoUsuario.deleteMany({
        where: { inscricaoId: inscricaoExistente.id }
      });
      
      await prisma.formularioUsuarioCampo.deleteMany({
        where: { formularioUsuarioId: inscricaoExistente.id }
      });
      
      // Reativar a inscrição cancelada
      const inscricaoReativada = await prisma.formularioUsuario.update({
        where: { id: inscricaoExistente.id },
        data: { status: "ATIVO" as any },
      });
      
      // Processar os novos campos e arquivos
      for (const campo of formulario.campos) {
        const value = formData.get(campo.id);
        
        if (value === null) continue;
        
        // Verificar se é um campo de arquivo
        if (campo.tipo === 6 && value instanceof File) {
          const file = value as File;
          
          try {
            console.log(`Processando arquivo ${file.name} para o campo ${campo.id}`);
            
            // Gerar um nome único para o arquivo sem fazer upload
            const fileExt = file.name.split('.').pop() || '';
            const nomeArmazenado = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
            const storagePath = `inscricoes/${session.user.id}/${inscricaoReativada.id}/${nomeArmazenado}`;
            
            // Criar o registro do campo com o valor sendo o nome original do arquivo
            const campoResult = await prisma.formularioUsuarioCampo.create({
              data: {
                valor: file.name,
                campoFormularioId: campo.id,
                formularioUsuarioId: inscricaoReativada.id,
              },
            });
            
            console.log(`Campo criado com ID: ${campoResult.id} para o arquivo ${file.name}`);
            
            // Criar o registro do arquivo associado ao campo
            const arquivoResult = await prisma.arquivoUsuario.create({
              data: {
                nomeOriginal: file.name,
                nomeArmazenado: nomeArmazenado,
                tamanho: file.size,
                tipo: file.type,
                caminho: storagePath,
                campoId: campoResult.id,
                inscricaoId: inscricaoReativada.id,
              },
            });
            
            console.log(`Arquivo registrado com ID: ${arquivoResult.id} para o campo ${campoResult.id}`);
          } catch (error) {
            console.error("Erro ao processar arquivo:", error);
          }
        } else {
          // Campo normal (não arquivo)
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
      return NextResponse.json({ message: "Você já se inscreveu neste edital" }, { status: 400 })
    }

    // Verificar se o período de inscrições está aberto
    const hoje = new Date()
    const dataInicio = new Date(formulario.dataInicio)
    const dataFim = new Date(formulario.dataFim)
    dataFim.setHours(23, 59, 59, 999) // Ajustar para o final do dia

    if (hoje < dataInicio || hoje > dataFim) {
      return NextResponse.json({ message: "O período de inscrições não está aberto" }, { status: 400 })
    }

    // Verificar campos obrigatórios
    const camposObrigatorios = formulario.campos.filter((campo) => campo.obrigatorio === 1)

    for (const campo of camposObrigatorios) {
      if (!formData.has(campo.id)) {
        return NextResponse.json({ message: `O campo "${campo.rotulo.split("|")[0]}" é obrigatório` }, { status: 400 })
      }
    }

    // Criar a inscrição
    const inscricao = await prisma.formularioUsuario.create({
      data: {
        usuarioId: session.user.id,
        formularioId,
      },
    })

    // Processar os campos e arquivos
    const camposPromises = []
    const arquivosPromises = []

    // Processar cada campo do formulário
    for (const campo of formulario.campos) {
      const value = formData.get(campo.id)

      if (value === null) continue

      // Verificar se é um campo de arquivo
      if (campo.tipo === 6 && value instanceof File) {
        const file = value as File

        try {
          console.log(`Processando arquivo ${file.name} para o campo ${campo.id}`);
          
          // Gerar um nome único para o arquivo sem fazer upload
          const fileExt = file.name.split('.').pop() || '';
          const nomeArmazenado = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
          const storagePath = `inscricoes/${session.user.id}/${inscricao.id}/${nomeArmazenado}`;
          
          // Criar o registro do campo com o valor sendo o nome original do arquivo
          const campoResult = await prisma.formularioUsuarioCampo.create({
            data: {
              valor: file.name, // Nome original do arquivo
              campoFormularioId: campo.id,
              formularioUsuarioId: inscricao.id,
            },
          })
          
          // Criar o registro do arquivo associado ao campo
          await prisma.arquivoUsuario.create({
            data: {
              nomeOriginal: file.name,
              nomeArmazenado: nomeArmazenado,
              tamanho: file.size,
              tipo: file.type,
              caminho: storagePath,
              campoId: campoResult.id, // Associar ao campo
              inscricaoId: inscricao.id,
            },
          })
          
          console.log(`Arquivo registrado com sucesso: ${storagePath}`);
        } catch (error) {
          console.error("Erro ao processar arquivo:", error)
          // Continuar com os outros campos mesmo se houver erro no arquivo
        }
      } else {
        // Campo normal (não arquivo)
        const campoPromise = prisma.formularioUsuarioCampo.create({
          data: {
            valor: value.toString(),
            campoFormularioId: campo.id,
            formularioUsuarioId: inscricao.id,
          },
        })

        await campoPromise
      }
    }

    return NextResponse.json({ id: inscricao.id }, { status: 201 })
  } catch (error) {
    console.error("Erro ao realizar inscrição:", error)
    return NextResponse.json({ message: "Erro ao realizar inscrição" }, { status: 500 })
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
