import { prisma } from "@/lib/prisma"
import { criptografarDadosLog } from "@/lib/crypto-logs"

export type AcaoLog = 
  | "INSCRICAO" 
  | "CANCELAMENTO_USUARIO" 
  | "CANCELAMENTO_ADMIN" 
  | "CANCELAMENTO_COMISSAO"

export async function registrarLogInscricao({
  usuarioInscricaoId,
  usuarioInscricaoCpf,
  usuarioInscricaoNome,
  usuarioAcaoId,
  usuarioAcaoCpf,
  usuarioAcaoNome,
  acao,
  editalTitulo,
  editalCodigo,
}: {
  usuarioInscricaoId: string
  usuarioInscricaoCpf: string
  usuarioInscricaoNome: string
  usuarioAcaoId: string
  usuarioAcaoCpf: string
  usuarioAcaoNome: string
  acao: AcaoLog
  editalTitulo?: string
  editalCodigo?: string
}) {
  try {
    const dadosCriptografados = criptografarDadosLog({
      usuarioInscricaoId,
      usuarioInscricaoCpf,
      usuarioInscricaoNome,
      usuarioAcaoId,
      usuarioAcaoCpf,
      usuarioAcaoNome,
      acao,
      editalTitulo,
      editalCodigo,
    })

    await prisma.logInscricao.create({
      data: dadosCriptografados,
    })
  } catch (error) {
    console.error("Erro ao registrar log de inscrição:", error)
  }
}