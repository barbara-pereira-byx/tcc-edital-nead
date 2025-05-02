'use server'

import { Funcionario } from "@/core/models/Funcionario";
import Id from "@/core/utils/Id";
import RepositorioFuncionario from "../RepositorioFuncionario";

export default async function obterTodos() {
    return RepositorioFuncionario.obterTodos()
}