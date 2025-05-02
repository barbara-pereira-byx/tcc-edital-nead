'use server'

import RepositorioReserva from "../RepositorioReserva"

export default async function excluirReserva(id: string) {
    return RepositorioReserva.excluir(id)
}