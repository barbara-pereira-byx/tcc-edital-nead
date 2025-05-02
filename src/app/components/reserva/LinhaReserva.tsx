import { Reserva } from "@/core/models/Reserva"

export interface LinhaReservaProps {
    reserva: Reserva
    onClick?: (reserva: Reserva) => void
}

export default function LinhaReserva(props: LinhaReservaProps) {
    return (
        <div className="flex bg-zinc-900 items-center gap-5 p-4 rounded-md cursor-pointer" 
            onClick={() => props.onClick?.(props.reserva)}
        >
            <div className="flex flex-col">
                <span>{props.reserva.passageiro.nome}</span>
                <span className="text-sm text-zinc-400">{props.reserva.passageiro.cpf_passaporte}</span>
            </div>
        </div>
    )
}
