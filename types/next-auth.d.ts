import "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      nome: string
      email: string
      cpf: string
      tipo: number
    }
  }

  interface User {
    id: string
    nome: string
    email: string
    cpf: string
    tipo: number
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    nome: string
    email: string
    cpf: string
    tipo: number
  }
}
