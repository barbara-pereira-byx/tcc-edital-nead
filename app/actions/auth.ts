"use server"

// Simulação de autenticação - em um ambiente real, usaria um sistema de autenticação como NextAuth ou Supabase Auth

type User = {
  id: string
  name: string
  email: string
}

// Banco de dados simulado
const users: User[] = [
  {
    id: "1",
    name: "Usuário Teste",
    email: "usuario@teste.com",
  },
]

// Armazena o usuário logado (simulação)
let currentUser: User | null = null

export async function login(email: string, password: string) {
  // Simulação de verificação de credenciais
  // Em um ambiente real, verificaria contra um banco de dados e usaria hash para senhas

  if (email === "usuario@teste.com" && password === "senha123") {
    const user = users.find((u) => u.email === email)
    if (user) {
      currentUser = user
      return { success: true }
    }
  }

  return { success: false, error: "E-mail ou senha inválidos" }
}

export async function register(name: string, email: string, password: string) {
  // Verificar se o e-mail já está em uso
  if (users.some((u) => u.email === email)) {
    return { success: false, error: "E-mail já cadastrado" }
  }

  // Criar novo usuário
  const newUser: User = {
    id: (users.length + 1).toString(),
    name,
    email,
  }

  // Adicionar ao "banco de dados"
  users.push(newUser)

  return { success: true }
}

export async function logout() {
  currentUser = null
  return { success: true }
}

export async function getCurrentUser() {
  // Em um ambiente real, isso verificaria a sessão do usuário
  return currentUser || users[0] // Para fins de demonstração, retorna o primeiro usuário
}
