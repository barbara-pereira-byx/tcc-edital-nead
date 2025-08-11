import { registrarLogInscricao } from "@/lib/log-inscricao"

// Mock do Prisma
jest.mock("@/lib/prisma", () => ({
  prisma: {
    logInscricao: {
      create: jest.fn(),
    },
  },
}))

describe("Log de Inscrição", () => {
  it("deve registrar log de inscrição corretamente", async () => {
    const { prisma } = require("@/lib/prisma")
    
    await registrarLogInscricao({
      usuarioId: "user123",
      usuarioCpf: "12345678901",
      usuarioNome: "João Silva",
      acao: "INSCRICAO",
      editalTitulo: "Edital Teste",
    })

    expect(prisma.logInscricao.create).toHaveBeenCalledWith({
      data: {
        usuarioId: "user123",
        usuarioCpf: "12345678901",
        usuarioNome: "João Silva",
        acao: "INSCRICAO",
        editalTitulo: "Edital Teste",
      },
    })
  })

  it("deve registrar log de cancelamento sem título do edital", async () => {
    const { prisma } = require("@/lib/prisma")
    
    await registrarLogInscricao({
      usuarioId: "user456",
      usuarioCpf: "98765432100",
      usuarioNome: "Maria Santos",
      acao: "CANCELAMENTO_USUARIO",
    })

    expect(prisma.logInscricao.create).toHaveBeenCalledWith({
      data: {
        usuarioId: "user456",
        usuarioCpf: "98765432100",
        usuarioNome: "Maria Santos",
        acao: "CANCELAMENTO_USUARIO",
        editalTitulo: undefined,
      },
    })
  })
})