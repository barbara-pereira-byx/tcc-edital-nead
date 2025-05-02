import { Aviao } from "@/core/models/Aviao"

export interface LinhaAviaoProps {
    aviao: Aviao
    onClick?: (funcionario: Aviao) => void
}

export default function LinhaAviao(props: LinhaAviaoProps) {
    return (
        <div className="flex bg-zinc-900 items-center gap-5 p-4 rounded-md cursor-pointer" onClick={() => props.onClick?.(props.aviao)}>
            <div className="flex flex-col">
                <span>{props.aviao.modelo} - {props.aviao.nome_companhia}</span>
            </div>
        </div>
    )
}