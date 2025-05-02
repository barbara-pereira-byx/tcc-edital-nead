'use client'
import FormularioReserva from "@/app/components/reserva/FormularioReserva";
import ListaReserva from "@/app/components/reserva/ListaReserva";
import Pagina from "@/app/components/template/Pagina";
import Titulo from "@/app/components/template/Titulo";
import Backend from "@/backend";
import { Reserva } from "@/core/models/Reserva";
import { IconPlus, IconUser } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import ProtegeRota from "../../../components/ProtegeRota"
export default function Page() {
    const [reservas, setReservas] = useState<Reserva[]>([])
    const [reserva, setReserva] = useState<Partial<Reserva> | null>(null)

    useEffect(() => {
        Backend.reservas.obter().then(setReservas)
    }, [])

    async function salvar() {
        if (!reserva) return
        await Backend.reservas.salvar(reserva)
        const reservas = await Backend.reservas.obter()
        setReservas(reservas)
        setReserva(null)
    }

    async function excluir() {
        if (!reserva || !reserva.id ) return
        await Backend.reservas.excluir(reserva.id)
        const reservas = await Backend.reservas.obter()
        setReservas(reservas)
        setReserva(null)
    }

    return (
        <ProtegeRota>
            <Pagina className="flex flex-col gap-7">
                <Titulo icone={IconUser} principal="Reservas" secundario="Gerenciamento de Reservas" />

                {reserva ? (
                    <FormularioReserva
                    reserva={reserva} 
                    onChange={setReserva}
                    cancelar={() => setReserva(null)}
                    salvar={salvar}
                    excluir={excluir}
                    />
                ) : (
                    <>
                        <div className="flex justify-end">
                            <button className="flex items-center gap-2 bg-blue-500 px-4 py-2 rounded-md  cursor-pointer" onClick={() => setReserva({})}>
                                <IconPlus />
                                <span>Nova Reserva</span>
                            </button>
                        </div>
                        <ListaReserva reserva={reservas} onClick={setReserva}/>
                    </>
                )}
                
            </Pagina>
        </ProtegeRota>
    )
}