import { getCurrentUser as getUser } from "@/app/actions/auth"

export async function getCurrentUser() {
  try {
    const user = await getUser()
    return user
  } catch (error) {
    console.error("Erro ao obter usuário atual:", error)
    return null
  }
}
