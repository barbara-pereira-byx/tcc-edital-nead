'use server'

import Id from "@/core/utils/Id";
import RepositorioPassageiro from "../RepositorioPassageiro";

export default async function obterTodosPassageiros() {
    return RepositorioPassageiro.obterTodos()
}