import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import { compare } from "bcryptjs"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
    maxAge: 60 * 60, // 1 hora
  },
  jwt: {
    maxAge: 60 * 60, // 1 hora
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/editais",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        cpf: { label: "CPF", type: "text" },
        senha: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.cpf || !credentials?.senha) {
          return null
        }

        const user = await prisma.usuario.findUnique({
          where: {
            cpf: credentials.cpf,
          },
        })

        if (!user) {
          return null
        }

        const isPasswordValid = await compare(credentials.senha, user.senha)

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          nome: user.nome,
          email: user.email,
          cpf: user.cpf,
          tipo: user.tipo,
        }
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (token) {
        session.user = {
          ...session.user,
          id: token.id as string,
          nome: token.nome as string,
          cpf: token.cpf as string,
          tipo: token.tipo as number,
        }
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.nome = user.nome
        token.email = user.email
        token.cpf = user.cpf
        token.tipo = user.tipo
      }
      return token
    },
  },
}
