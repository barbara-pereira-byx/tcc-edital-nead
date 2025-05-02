import LinhaFuncionario from "./LinhaFuncionario"
import { Funcionario } from "@/core/models/Funcionario"

export interface ListaFuncionarioProps {
    funcionarios: Funcionario[]
    onClick?: (funcionario: Funcionario) => void
}

export default function ListaFuncionario(props: ListaFuncionarioProps) {
    return (
        <div className="flex  flex-col gap-4">
            {props.funcionarios.map((funcionarios: Funcionario) => {
                return (
                    <LinhaFuncionario key={funcionarios.id} funcionario={funcionarios} onClick={props.onClick}/>
                )
            })}
        </div>
    )
}