'use client'
import FormularioFuncionario from "@/app/components/funcionario/FormularioFuncionario";
import ListaFuncionario from "@/app/components/funcionario/ListaFuncionario";
import Pagina from "@/app/components/template/Pagina";
import Titulo from "@/app/components/template/Titulo";
import funcionarios from "@/app/data/constants/funcionarios";
import Backend from "@/backend";
import { Funcionario } from "@/core/models/Funcionario";
import { IconPlus, IconUser } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import ProtegeRota from "../../../components/ProtegeRota"

export default function Page() {
    const [funcionarios, setFuncionarios] = useState<Funcionario[]>([])
    const [funcionario, setFuncionario] = useState<Partial<Funcionario> | null>(null)

    useEffect(() => {
        Backend.funcionarios.obter().then(setFuncionarios)
    }, [])

    async function salvar() {
        if (!funcionario) return
        await Backend.funcionarios.salvar(funcionario)
        const funcionarios = await Backend.funcionarios.obter()
        setFuncionarios(funcionarios)
        setFuncionario(null)
    }

    async function excluir() {
        if (!funcionario || !funcionario.id ) return
        await Backend.funcionarios.excluir(funcionario.id)
        const funcionarios = await Backend.funcionarios.obter()
        setFuncionarios(funcionarios)
        setFuncionario(null)
    }

    return (
        <ProtegeRota>
            <Pagina className="flex flex-col gap-7">
                <Titulo icone={IconUser} principal="Funcionários" secundario="Gerenciamento de Funcionários" />

                {funcionario ? (
                    <FormularioFuncionario 
                    funcionario={funcionario} 
                    onChange={setFuncionario}
                    cancelar={() => setFuncionario(null)}
                    salvar={salvar}
                    excluir={excluir}
                    />
                ) : (
                    <>
                        <div className="flex justify-end">
                            <button className="flex items-center gap-2 bg-blue-500 px-4 py-2 rounded-md  cursor-pointer" onClick={() => setFuncionario({})}>
                                <IconPlus />
                                <span>Novo Funcionário</span>
                            </button>
                        </div>
                        <ListaFuncionario funcionarios={funcionarios} onClick={setFuncionario}/>
                    </>
                )}
                
            </Pagina>
        </ProtegeRota>
    )
}