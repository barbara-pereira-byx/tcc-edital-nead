import { Passageiro } from "@/core/models/Passageiro"
import InputTexto from "../shared/InputTexto"
import { useState, useEffect } from "react"

export interface PassageiroProps {
    passageiro: Partial<Passageiro>
    onChange: (passageiro: Partial<Passageiro>) => void
    salvar: () => void
    cancelar: () => void
    excluir: () => void
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

// Função para validar CPF ou passaporte
const validarCpfPassaporte = (valor: string) => {
    const apenasNumeros = valor.replace(/\D/g, '')
    return apenasNumeros.length === 11 || valor.length > 5 // CPF com 11 números ou passaporte com mais de 5 caracteres
}

// Função para validar e-mail
const validarEmail = (email: string) => /^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/.test(email)

// Função para validar nome
const validarNome = (nome: string) => nome.trim().length > 1

// Função para validar nacionalidade
const validarNacionalidade = (nacionalidade: string) => nacionalidade.trim().length > 2

export default function FormularioPassageiro(props: PassageiroProps) {
    const [valido, setValido] = useState(false)

    useEffect(() => {
        const { nome, cpf_passaporte, email, nacionalidade } = props.passageiro
        setValido(
            validarNome(nome || "") &&
            validarCpfPassaporte(cpf_passaporte || "") &&
            validarEmail(email || "") &&
            validarNacionalidade(nacionalidade || "")
        )
    }, [props.passageiro])

    return (
        <div className="flex flex-col gap-5">
            <InputTexto 
                label="Nome" 
                type="text" 
                value={props.passageiro.nome} 
                onChange={e => props.onChange?.({ 
                    ...props.passageiro, 
                    nome: e.target.value 
                })}
            />
            <InputTexto 
                label="CPF/Passaporte" 
                type="text" 
                value={props.passageiro.cpf_passaporte} 
                onChange={e => props.onChange?.({ 
                    ...props.passageiro, 
                    cpf_passaporte: formatarCPF(e.target.value) 
                })}
            />
            <InputTexto 
                label="E-mail" 
                type="email" 
                value={props.passageiro.email} 
                onChange={e => props.onChange?.({ 
                    ...props.passageiro, 
                    email: e.target.value.toLowerCase().trim() 
                })}
            />
            <InputTexto
                label="Nacionalidade"
                type="text"
                value={props.passageiro.nacionalidade}
                onChange={e => props.onChange?.({ 
                    ...props.passageiro, 
                    nacionalidade: e.target.value.trim() 
                })}
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
