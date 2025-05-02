'use server'

import { Reserva } from "@/core/models/Reserva";
import Id from "@/core/utils/Id";
import RepositorioReserva from "../RepositorioReserva";

export default async function salvarReserva(reserva: Partial<Reserva>) {
    const novoReserva = {
        ...reserva,
        id: reserva.id || Id.novo,
    }

    return RepositorioReserva.salvar(novoReserva as Reserva)
}