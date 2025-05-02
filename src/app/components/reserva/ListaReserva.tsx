import LinhaPassageiro from "./LinhaReserva"
import LinhaReserva from "./LinhaReserva"
import { Reserva } from "@/core/models/Reserva"

export interface ListaReservaProps {
    reserva: Reserva[]
    onClick?: (reserva: Reserva) => void
}

export default function ListaReserva(props: ListaReservaProps) {
    return (
        <div className="flex  flex-col gap-4">
            {props.reserva.map((reserva: Reserva) => {
                return (
                    <LinhaReserva key={reserva.id} reserva={reserva} onClick={props.onClick}/>
                )
            })}
        </div>
    )
}