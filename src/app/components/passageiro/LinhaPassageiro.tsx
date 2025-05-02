import { Passageiro } from "@/core/models/Passageiro"

export interface LinhaPassageiroProps {
    passageiro: Passageiro
    onClick?: (passageiro: Passageiro) => void
}

// Função para formatar CPF
const formatarCPF = (cpf: string) => {
    const apenasNumeros = cpf.replace(/\D/g, '') // Remove tudo que não for número
    return apenasNumeros.length === 11 
        ? apenasNumeros.replace(/(\d{3})(\d)/, '$1.$2')
                       .replace(/(\d{3})(\d)/, '$1.$2')
                       .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
        : cpf // Retorna sem alteração se não for CPF
}

// Função para formatar o nome (primeira letra maiúscula)
const formatarNome = (nome: string) => {
    return nome
        .toLowerCase()
        .replace(/\b\w/g, letra => letra.toUpperCase()) // Primeira letra maiúscula
}

export default function LinhaPassageiro(props: LinhaPassageiroProps) {
    return (
        <div className="flex bg-zinc-900 items-center gap-5 p-4 rounded-md cursor-pointer" 
            onClick={() => props.onClick?.(props.passageiro)}
        >
            <div className="flex flex-col">
                <span>{formatarNome(props.passageiro.nome)}</span>
                <span className="text-sm text-zinc-400">{formatarCPF(props.passageiro.cpf_passaporte)}</span>
            </div>
        </div>
    )
}
