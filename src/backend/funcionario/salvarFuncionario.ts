'use server'

import { Funcionario } from "@/core/models/Funcionario";
import Id from "@/core/utils/Id";
import RepositorioFuncionario from "../RepositorioFuncionario";

export default async function salvarFuncionario(funcionario: Partial<Funcionario>) {
    const novoFuncionario = {
        ...funcionario,
        id: funcionario.id || Id.novo,
    }

    return RepositorioFuncionario.salvar(novoFuncionario as Funcionario)
}