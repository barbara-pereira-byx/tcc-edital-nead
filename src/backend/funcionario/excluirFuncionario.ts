'use server'
import RepositorioFuncionario from "../RepositorioFuncionario";

export default async function excluirFuncionario(id: string) {
    return RepositorioFuncionario.excluir(id)
}