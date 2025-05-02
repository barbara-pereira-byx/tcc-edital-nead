'use server'

import { Passageiro } from "@/core/models/Passageiro";
import Id from "@/core/utils/Id";
import RepositorioPassageiro from "../RepositorioPassageiro";

export default async function salvarPassageiro(passageiro: Partial<Passageiro>) {
    const novoPassageiro = {
        ...passageiro,
        id: passageiro.id || Id.novo,
    }

    return RepositorioPassageiro.salvar(novoPassageiro as Passageiro)
}