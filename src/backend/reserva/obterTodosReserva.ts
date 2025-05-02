'use server'

import RepositorioReserva from "../RepositorioReserva";

export default async function obterTodosReserva() {
    return RepositorioReserva.obterTodos()
}