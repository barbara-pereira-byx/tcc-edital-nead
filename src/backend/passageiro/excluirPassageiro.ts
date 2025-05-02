'use server'

import RepositorioPassageiro from "../RepositorioPassageiro"

export default async function excluirPassageiro(id: string) {
    return RepositorioPassageiro.excluir(id)
}