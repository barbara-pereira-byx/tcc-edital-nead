import { Passageiro } from "@/core/models/Passageiro"
import LinhaPassageiro from "./LinhaPassageiro"

export interface ListaPassageiroProps {
    passageiro: Passageiro[]
    onClick?: (passageiro: Passageiro) => void
}

export default function ListaPassageiro(props: ListaPassageiroProps) {
    return (
        <div className="flex  flex-col gap-4">
            {props.passageiro.map((passageiro: Passageiro) => {
                return (
                    <LinhaPassageiro key={passageiro.id} passageiro={passageiro} onClick={props.onClick}/>
                )
            })}
        </div>
    )
}