import { Aviao } from "@/core/models/Aviao"
import LinhaAviao from "./LinhaAviao"

export interface ListaAviaoProps {
    aviao: Aviao[]
    onClick?: (aviao: Aviao) => void
}

export default function ListaAviao(props: ListaAviaoProps) {
    return (
        <div className="flex  flex-col gap-4">
            {props.aviao.map((aviao: Aviao) => {
                return (
                    <LinhaAviao key={aviao.id} aviao={aviao} onClick={props.onClick}/>
                )
            })}
        </div>
    )
}