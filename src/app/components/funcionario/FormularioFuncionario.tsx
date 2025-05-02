import { Funcionario } from "@/core/models/Funcionario"
import InputTexto from "../shared/InputTexto"

export interface FuncionarioProps {
    funcionario: Partial<Funcionario>
    onChange: (funcionario: Partial<Funcionario>) => void
    salvar: () => void
    cancelar: () => void
    excluir: () => void
}

export default function FormularioFuncionario(props: FuncionarioProps) {
    return(
        <div className="flex flex-col gap-5">
            <InputTexto 
                label="Nome" 
                type="text" 
                value={props.funcionario.nome} 
                onChange={
                    e => props.onChange?.({ ...props.funcionario, nome: e.target.value })
                }
            />
            <InputTexto 
                label="CPF" 
                type="text" 
                value={props.funcionario.cpf} 
                onChange={
                    e => props.onChange?.({ ...props.funcionario, cpf: e.target.value })
                }
            />
            <InputTexto 
                label="E-mail" 
                type="email" 
                value={props.funcionario.email} 
                onChange={
                    e => props.onChange?.({ ...props.funcionario, email: e.target.value })
                }
            />
            <InputTexto 
                label="Senha" 
                type="password" 
                value={props.funcionario.senha} 
                onChange={
                    e => props.onChange?.({ ...props.funcionario, senha: e.target.value })
                }
            />
            <div className="flex justify-between">
                <div className="flex gap-5">
                    <button className="bg-blue-500 px-4 py-2 rounded-md cursor-pointer" onClick={props.salvar}>Salvar</button>
                    <button className="bg-zinc-500 px-4 py-2 rounded-md cursor-pointer" onClick={props.cancelar}>Cancelar</button>
                </div>
                <button className="bg-red-500 px-4 py-2 rounded-md cursor-pointer" onClick={props.excluir}>Excluir</button>
            </div>
        </div>
    )
}