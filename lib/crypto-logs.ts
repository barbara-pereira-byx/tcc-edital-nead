import crypto from "crypto"

const ALGORITHM = 'aes-256-cbc'
const SECRET_KEY = process.env.LOG_ENCRYPTION_KEY || 'default-key-for-logs-encryption-32'
const IV_LENGTH = 16

export function criptografarCampo(valor: string): string {
  if (!valor) return ""
  
  const iv = crypto.randomBytes(IV_LENGTH)
  const cipher = crypto.createCipher(ALGORITHM, SECRET_KEY)
  let encrypted = cipher.update(valor, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  
  return iv.toString('hex') + ':' + encrypted
}

export function descriptografarCampo(valorCriptografado: string): string {
  if (!valorCriptografado) return ""
  
  try {
    const parts = valorCriptografado.split(':')
    if (parts.length !== 2) return valorCriptografado
    
    const iv = Buffer.from(parts[0], 'hex')
    const encryptedText = parts[1]
    
    const decipher = crypto.createDecipher(ALGORITHM, SECRET_KEY)
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    
    return decrypted
  } catch (error) {
    console.error('Erro ao descriptografar:', error)
    return valorCriptografado
  }
}

// Função para criptografar dados do log
export function criptografarDadosLog(dados: {
  usuarioInscricaoId: string
  usuarioInscricaoCpf: string
  usuarioInscricaoNome: string
  usuarioAcaoId: string
  usuarioAcaoCpf: string
  usuarioAcaoNome: string
  acao: string
  editalTitulo?: string
  editalCodigo?: string
}) {
  return {
    usuarioInscricaoId: criptografarCampo(dados.usuarioInscricaoId),
    usuarioInscricaoCpf: criptografarCampo(dados.usuarioInscricaoCpf),
    usuarioInscricaoNome: criptografarCampo(dados.usuarioInscricaoNome),
    usuarioAcaoId: criptografarCampo(dados.usuarioAcaoId),
    usuarioAcaoCpf: criptografarCampo(dados.usuarioAcaoCpf),
    usuarioAcaoNome: criptografarCampo(dados.usuarioAcaoNome),
    acao: criptografarCampo(dados.acao),
    editalTitulo: dados.editalTitulo ? criptografarCampo(dados.editalTitulo) : null,
    editalCodigo: dados.editalCodigo ? criptografarCampo(dados.editalCodigo) : null,
  }
}

// Função para descriptografar dados do log
export function descriptografarDadosLog(dados: any) {
  return {
    ...dados,
    usuarioInscricaoId: descriptografarCampo(dados.usuarioInscricaoId),
    usuarioInscricaoCpf: descriptografarCampo(dados.usuarioInscricaoCpf),
    usuarioInscricaoNome: descriptografarCampo(dados.usuarioInscricaoNome),
    usuarioAcaoId: descriptografarCampo(dados.usuarioAcaoId),
    usuarioAcaoCpf: descriptografarCampo(dados.usuarioAcaoCpf),
    usuarioAcaoNome: descriptografarCampo(dados.usuarioAcaoNome),
    acao: descriptografarCampo(dados.acao),
    editalTitulo: dados.editalTitulo ? descriptografarCampo(dados.editalTitulo) : null,
    editalCodigo: dados.editalCodigo ? descriptografarCampo(dados.editalCodigo) : null,
  }
}