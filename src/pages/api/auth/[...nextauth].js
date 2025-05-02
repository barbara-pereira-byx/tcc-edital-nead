import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "../../../../lib/prisma"; // Certifique-se de que o Prisma está configurado corretamente
import bcrypt from "bcrypt";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        const { email, password } = credentials || {};

        if (!email || !password) {
          console.log("Email ou senha não fornecidos");
          throw new Error("Email e senha são obrigatórios");
        }

        // Consulta o funcionário no banco de dados
        const funcionario = await prisma.funcionario.findUnique({
          where: { email },
        });

        if (!funcionario) {
          console.log("Usuário não encontrado:", email);
          throw new Error("Usuário não encontrado");
        }

        // Verifica a senha usando bcrypt
        const senhaCorreta = await bcrypt.compare(password, funcionario.senha);

        console.log("Usuário autenticado com sucesso:", funcionario);

        // Retorna os dados do funcionário (sem a senha)
        const { senha: _, ...user } = funcionario;
        return user;
      },
    }),
  ],
  pages: {
    signIn: "/login", // Página de login personalizada
  },
  session: {
    strategy: "jwt", // Usa JWT para sessões
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.nome = user.nome;
        token.cargo = user.cargo;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user = {
          id: token.id,
          email: token.email,
          nome: token.nome,
          cargo: token.cargo,
        };
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET, // Certifique-se de configurar essa variável no .env
};

export default NextAuth(authOptions);