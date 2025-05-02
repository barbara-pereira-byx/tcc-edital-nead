'use server'

import { Aviao } from "@/core/models/Aviao";
import Id from "@/core/utils/Id";
import RepositorioAviao from "../RepositorioAviao";

export default async function salvarAviao(aviao: Partial<Aviao>) {
    const novoaviao = {
        ...aviao,
        id: aviao.id || Id.novo,
    }

    return RepositorioAviao.salvar(novoaviao as Aviao)
}