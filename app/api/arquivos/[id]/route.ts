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
      
      // Tentar encontrar o arquivo em diferentes locais
      const fs = require('fs')
      const possiblePaths = [
        // Caminho direto do banco de dados
        path.join(process.cwd(), "uploads", arquivo.nomeArmazenado),
        // Caminho baseado na estrutura de pastas user-files
        path.join(process.cwd(), "uploads", "user-files", arquivo.caminho),
        // Caminho na pasta public/uploads
        path.join(process.cwd(), "public", "uploads", arquivo.nomeArmazenado),
        // Caminho baseado apenas no nome do arquivo
        path.join(process.cwd(), "uploads", path.basename(arquivo.caminho))
      ]
      
      // Procurar o arquivo em todos os possíveis caminhos
      let filePath = null
      for (const possiblePath of possiblePaths) {
        console.log(`Verificando caminho: ${possiblePath}`)
        if (fs.existsSync(possiblePath)) {
          filePath = possiblePath
          console.log(`Arquivo encontrado em: ${filePath}`)
          break
        }
      }
      
      // Se não encontrou o arquivo em nenhum lugar
      if (!filePath) {
        console.log(`Arquivo não encontrado: ${arquivo.nomeOriginal}`)
        return new NextResponse(
          `<html>
            <head>
              <title>Arquivo não encontrado</title>
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
                <h1>Arquivo não encontrado</h1>
                <div class="info">
                  <p>O arquivo <span class="file-name">${arquivo.nomeOriginal}</span> não foi encontrado no sistema.</p>
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
      }
      
      // Ler o arquivo e retorná-lo como resposta
      const fileBuffer = fs.readFileSync(filePath)
      return new NextResponse(fileBuffer, {
        headers: {
          "Content-Type": contentType,
          "Content-Disposition": `inline; filename="${encodeURIComponent(arquivo.nomeOriginal)}"`,
        },
      })
    } catch (error) {
      console.error(`Erro ao acessar arquivo: ${arquivo.caminho}`, error)
      return new NextResponse("Erro ao acessar arquivo", { status: 500 })
    }
  } catch (error) {
    console.error("Erro ao buscar arquivo:", error)
    return new NextResponse("Erro ao buscar arquivo", { status: 500 })
  }
}
