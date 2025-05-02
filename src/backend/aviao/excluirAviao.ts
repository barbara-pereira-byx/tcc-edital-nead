'use server'
import RepositorioAviao from "../RepositorioAviao"

export default async function excluirAviao(id: string) {
    return RepositorioAviao.excluir(id)
}