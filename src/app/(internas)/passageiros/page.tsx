'use client'
import FormularioPassageiro from "@/app/components/passageiro/FormularioPassageiro";
import ListaPassageiro from "@/app/components/passageiro/ListaPassageiro";
import Pagina from "@/app/components/template/Pagina";
import Titulo from "@/app/components/template/Titulo";
import Backend from "@/backend";
import { Passageiro } from "@/core/models/Passageiro";
import { IconPlus, IconUser } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import ProtegeRota from "../../../components/ProtegeRota"
export default function Page() {
    const [passageiros, setPassageiros] = useState<Passageiro[]>([])
    const [passageiro, setPassageiro] = useState<Partial<Passageiro> | null>(null)

    useEffect(() => {
        Backend.passageiros.obter().then(setPassageiros)
    }, [])

    async function salvar() {
        if (!passageiro) return
        await Backend.passageiros.salvar(passageiro)
        const passageiros = await Backend.passageiros.obter()
        setPassageiros(passageiros)
        setPassageiro(null)
    }

    async function excluir() {
        if (!passageiro || !passageiro.id ) return
        await Backend.passageiros.excluir(passageiro.id)
        const passageiros = await Backend.passageiros.obter()
        setPassageiros(passageiros)
        setPassageiro(null)
    }

    return (
        <ProtegeRota>
            <Pagina className="flex flex-col gap-7">
                <Titulo icone={IconUser} principal="Passageiros" secundario="Gerenciamento de Passageiros" />

                {passageiro ? (
                    <FormularioPassageiro
                    passageiro={passageiro} 
                    onChange={setPassageiro}
                    cancelar={() => setPassageiro(null)}
                    salvar={salvar}
                    excluir={excluir}
                    />
                ) : (
                    <>
                        <div className="flex justify-end">
                            <button className="flex items-center gap-2 bg-blue-500 px-4 py-2 rounded-md  cursor-pointer" onClick={() => setPassageiro({})}>
                                <IconPlus />
                                <span>Novo Passageiro</span>
                            </button>
                        </div>
                        <ListaPassageiro passageiro={passageiros} onClick={setPassageiro}/>
                    </>
                )}
                
            </Pagina>
        </ProtegeRota>
    )
}