import { Funcionario } from "@/core/models/Funcionario"

export interface LinhaFuncionarioProps {
    funcionario: Funcionario
    onClick?: (funcionario: Funcionario) => void
}

export default function LinhaFuncionario(props: LinhaFuncionarioProps) {
    return (
        <div className="flex bg-zinc-900 items-center gap-5 p-4 rounded-md cursor-pointer" onClick={() => props.onClick?.(props.funcionario)}>
            <div className="flex flex-col">
                <span>{props.funcionario.nome}</span>
                <span className="text-sm text-zinc-400">{props.funcionario.cpf}</span>
            </div>
        </div>
    )
}