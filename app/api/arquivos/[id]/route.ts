import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import path from "path"

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return new NextResponse("Não autorizado", { status: 401 })
    }

    // Buscar o campo do formulário que contém o arquivo
    const campo = await prisma.formularioUsuarioCampo.findUnique({
      where: { id: params.id },
      include: {
        inscricao: true,
      },
    })

    if (!campo) {
      return new NextResponse("Arquivo não encontrado", { status: 404 })
    }

    // Verificar se o usuário tem permissão para acessar o arquivo
    const isAdmin = session.user.tipo === 1
    const isOwner = campo.inscricao.usuarioId === session.user.id

    if (!isAdmin && !isOwner) {
      return new NextResponse("Não autorizado", { status: 403 })
    }

    // Buscar o arquivo associado ao campo
    const arquivo = await prisma.arquivoUsuario.findFirst({
      where: { campoId: params.id },
    })

    if (!arquivo) {
      return new NextResponse("Arquivo não encontrado", { status: 404 })
    }

    try {
      // Determinar o tipo MIME com base na extensão
      const ext = path.extname(arquivo.nomeOriginal).toLowerCase()
      let contentType = "application/octet-stream"

      if (ext === ".pdf") contentType = "application/pdf"
      else if (ext === ".doc" || ext === ".docx") contentType = "application/msword"
      else if (ext === ".jpg" || ext === ".jpeg") contentType = "image/jpeg"
      else if (ext === ".png") contentType = "image/png"
      
      // Retornar uma resposta informativa para o usuário
      return new NextResponse(
        `<html>
          <head>
            <title>Visualização de Arquivo</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body { font-family: Arial, sans-serif; margin: 0; padding: 20px; line-height: 1.6; }
              .container { max-width: 600px; margin: 0 auto; }
              h1 { color: #333; }
              .info { background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0; }
              .file-name { font-weight: bold; }
              .btn { display: inline-block; background: #0070f3; color: white; padding: 10px 15px; 
                     text-decoration: none; border-radius: 5px; margin-top: 10px; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>Arquivo Indisponível</h1>
              <div class="info">
                <p>O arquivo <span class="file-name">${arquivo.nomeOriginal}</span> não pode ser exibido diretamente.</p>
                <p>Devido a limitações do ambiente de produção, os arquivos enviados durante o desenvolvimento não estão disponíveis.</p>
                <p>Por favor, faça o upload do arquivo novamente para visualizá-lo.</p>
              </div>
              <a href="/inscricoes" class="btn">Voltar para Inscrições</a>
            </div>
          </body>
        </html>`,
        {
          headers: {
            "Content-Type": "text/html",
          },
        }
      )
    } catch (error) {
      console.error(`Erro ao acessar arquivo: ${arquivo.caminho}`, error)
      return new NextResponse("Erro ao acessar arquivo", { status: 500 })
    }
  } catch (error) {
    console.error("Erro ao buscar arquivo:", error)
    return new NextResponse("Erro ao buscar arquivo", { status: 500 })
  }
}
