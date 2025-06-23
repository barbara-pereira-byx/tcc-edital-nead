import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// Helper function to convert string or number type to integer
function convertTipoToInt(tipo: string | number): number {
  if (typeof tipo === 'number') return tipo;
  return Number.parseInt(tipo, 10)
}

// Helper function to convert boolean or number to integer (0/1)
function convertBoolToInt(value: boolean | number): number {
  if (typeof value === 'number') return value;
  return value ? 1 : 0
}

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const formulario = await prisma.formulario.findUnique({
      where: { id: params.id },
      include: {
        campos: {
          orderBy: {
            ordem: "asc", // Ordenar por ordem em vez de id
          },
        },
        edital: true,
      },
    })

    if (!formulario) {
      return NextResponse.json({ message: "Formulário não encontrado" }, { status: 404 })
    }

    return NextResponse.json(formulario)
  } catch (error) {
    console.error("Erro ao buscar formulário:", error)
    return NextResponse.json({ message: "Erro ao buscar formulário" }, { status: 500 })
  }
}

// Adicione logs mais detalhados na rota de atualização
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    console.log(`Iniciando atualização do formulário ID: ${params.id}`)
    const session = await getServerSession(authOptions)

    if (!session || session.user.tipo !== 1) {
      console.log("Usuário não autorizado")
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 })
    }

    const body = await req.json()
    console.log(`Dados recebidos para atualização:`, {
      titulo: body.titulo,
      dataInicio: body.dataInicio,
      dataFim: body.dataFim,
      camposCount: body.campos?.length || 0,
      // Mostrar detalhes do primeiro campo para debug
      primeiroCampo: body.campos?.length > 0 ? {
        id: body.campos[0].id,
        nome: body.campos[0].nome,
        rotulo: body.campos[0].rotulo,
        tipo: body.campos[0].tipo,
        obrigatorio: body.campos[0].obrigatorio,
        categoria: body.campos[0].categoria,
        tamanho: body.campos[0].tamanho
      } : null,
      // Mostrar todas as categorias para debug
      categorias: body.campos?.map(c => c.categoria).filter((v, i, a) => a.indexOf(v) === i)
    })
    
    // Verificar se há campos sem categoria definida
    const camposSemCategoria = body.campos?.filter(c => !c.categoria);
    if (camposSemCategoria?.length > 0) {
      console.warn(`AVISO: ${camposSemCategoria.length} campos sem categoria definida`);
      console.warn(camposSemCategoria.map(c => c.nome || c.rotulo));
    }

    const { titulo, dataInicio, dataFim, campos } = body

    if (!titulo || !dataInicio || !dataFim || !campos || campos.length === 0) {
      console.log("Dados incompletos para atualização")
      return NextResponse.json({ message: "Dados incompletos" }, { status: 400 })
    }

    // Verificar se o formulário existe
    console.log(`Verificando se o formulário ID: ${params.id} existe`)
    const formularioExistente = await prisma.formulario.findUnique({
      where: { id: params.id },
      include: {
        campos: true,
      },
    })

    if (!formularioExistente) {
      console.log(`Formulário ID: ${params.id} não encontrado`)
      return NextResponse.json({ message: "Formulário não encontrado" }, { status: 404 })
    }

    console.log(`Formulário ID: ${params.id} encontrado, atualizando...`)
    // Atualizar o formulário
    const formulario = await prisma.formulario.update({
      where: { id: params.id },
      data: {
        titulo,
        dataInicio: new Date(dataInicio),
        dataFim: new Date(dataFim),
      },
    })

    console.log(`Formulário base atualizado, processando ${campos.length} campos...`)
    // Processar campos considerando a ordem
    for (const campo of campos) {
      if (campo.id.startsWith("temp-")) {
        // Novo campo
        console.log(`Criando novo campo: ${campo.nome || campo.rotulo}, categoria: "${campo.categoria}"`)
        
        // Determinar o valor correto para rotulo
        let rotuloValue = campo.nome;
        
        // Para campos de tipo 3 (select) ou 4 (checkbox), usar o campo rotulo se disponível
        if ((campo.tipo === 3 || campo.tipo === 4) && campo.rotulo) {
          rotuloValue = campo.rotulo;
        }
        
        // Verificar se a categoria está definida
        if (!campo.categoria) {
          console.warn(`AVISO: Campo sem categoria definida: ${campo.nome || campo.rotulo}`);
        }
        
        await prisma.campoFormulario.create({
          data: {
            rotulo: String(rotuloValue || "Campo sem nome"), // Usar o valor determinado acima
            tipo: convertTipoToInt(campo.tipo),
            obrigatorio: convertBoolToInt(campo.obrigatorio),
            ordem: Number(campo.ordem || 0), // Incluir ordem com fallback
            categoria: String(campo.categoria || ""), // Usar a categoria exatamente como foi enviada, sem fallback
            formularioId: String(formulario.id),
          },
        })
      } else {
        // Campo existente
        const campoExistente = formularioExistente.campos.find((c) => c.id === campo.id)

        if (campoExistente) {
          // Atualizar campo incluindo a ordem
          console.log(`Atualizando campo existente ID: ${campo.id}, categoria: "${campo.categoria}"`)
          
          // Determinar o valor correto para rotulo
          let rotuloValue = campo.nome;
          
          // Para campos de tipo 3 (select) ou 4 (checkbox), usar o campo rotulo se disponível
          if ((campo.tipo === 3 || campo.tipo === 4) && campo.rotulo) {
            rotuloValue = campo.rotulo;
          }
          
          // Verificar se a categoria está definida
          if (!campo.categoria) {
            console.warn(`AVISO: Campo sem categoria definida: ${campo.nome || campo.rotulo}`);
          }
          
          await prisma.campoFormulario.update({
            where: { id: campo.id },
            data: {
              rotulo: String(rotuloValue || "Campo sem nome"), // Usar o valor determinado acima
              tipo: convertTipoToInt(campo.tipo),
              obrigatorio: convertBoolToInt(campo.obrigatorio),
              ordem: Number(campo.ordem || 0), // Atualizar ordem com fallback
              categoria: campo.categoria !== undefined ? String(campo.categoria) : campoExistente?.categoria, // Usar a categoria exatamente como foi enviada, sem fallback
            },
          })
        } else {
          console.log(`Campo ID: ${campo.id} não encontrado, criando como novo`)
          console.log(`Dados do campo: ${JSON.stringify({
            nome: campo.nome || "Campo sem nome",
            rotulo: campo.rotulo || "",
            tipo: campo.tipo,
            obrigatorio: campo.obrigatorio,
            ordem: campo.ordem,
            categoria: campo.categoria,
            formularioId: formulario.id,
          })}`)
          
          // Campo com ID não-temp mas que não existe no banco - criar como novo
          console.log(`Criando campo com ID existente: ${campo.id}, categoria: "${campo.categoria}"`)
          
          // Determinar o valor correto para rotulo
          let rotuloValue = campo.nome;
          
          // Para campos de tipo 3 (select) ou 4 (checkbox), usar o campo rotulo se disponível
          if ((campo.tipo === 3 || campo.tipo === 4) && campo.rotulo) {
            rotuloValue = campo.rotulo;
          }
          
          // Verificar se a categoria está definida
          if (!campo.categoria) {
            console.warn(`AVISO: Campo sem categoria definida: ${campo.nome || campo.rotulo}`);
          }
          
          await prisma.campoFormulario.create({
            data: {
              rotulo: String(rotuloValue || "Campo sem nome"), // Usar o valor determinado acima
              tipo: convertTipoToInt(campo.tipo),
              obrigatorio: convertBoolToInt(campo.obrigatorio),
              ordem: Number(campo.ordem || 0),
              categoria: String(campo.categoria || ""), // Usar a categoria exatamente como foi enviada, sem fallback
              formularioId: String(formulario.id),
            },
          })
        }
      }
    }

    // Remover campos que não estão mais presentes
    const camposIds = campos.map((c: any) => c.id).filter((id: any) => !id.startsWith("temp-"))
    const camposParaRemover = formularioExistente.campos.filter((c) => !camposIds.includes(c.id))

    console.log(`Removendo ${camposParaRemover.length} campos que não estão mais presentes`)
    for (const campo of camposParaRemover) {
      await prisma.campoFormulario.delete({
        where: { id: campo.id },
      })
    }

    console.log(`Atualização do formulário ID: ${params.id} concluída com sucesso`)
    return NextResponse.json({ id: formulario.id })
  } catch (error) {
    console.error("Erro ao atualizar formulário:", error)
    return NextResponse.json(
      {
        message: "Erro ao atualizar formulário",
        error: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 },
    )
  }
}
