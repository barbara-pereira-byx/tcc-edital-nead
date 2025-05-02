'use server'

import RepositorioAviao from "../RepositorioAviao"

export default async function obterTodosAviao() {
    return RepositorioAviao.obterTodos()
}