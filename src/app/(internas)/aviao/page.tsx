'use client'

import Pagina from "@/app/components/template/Pagina";
import Titulo from "@/app/components/template/Titulo";
import Backend from "@/backend";
import { IconPlus, IconUser } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import ProtegeRota from "../../../components/ProtegeRota"
import { Aviao } from "@/core/models/Aviao";
import FormularioAviao from "@/app/components/aviao/FormularioAviao";
import ListaAviao from "@/app/components/aviao/ListaAviao";
export default function Page() {
    const [avioes, setAvioes] = useState<Aviao[]>([])
    const [aviao, setAviao] = useState<Partial<Aviao> | null>(null)

    useEffect(() => {
        Backend.aviao.obter().then(setAvioes)
    }, [])

    async function salvar() {
        if (!aviao) return
        await Backend.aviao.salvar(aviao)
        const avioes = await Backend.aviao.obter()
        setAvioes(avioes)
        setAviao(null)
    }

    async function excluir() {
        if (!aviao || !aviao.id ) return
        await Backend.aviao.excluir(aviao.id)
        const avioes = await Backend.aviao.obter()
        setAvioes(avioes)
        setAviao(null)
    }

    return (
        <ProtegeRota>
            <Pagina className="flex flex-col gap-7">
                <Titulo icone={IconUser} principal="Avião" secundario="Gerenciamento de Aviões" />

                {aviao ? (
                    <FormularioAviao
                    aviao={aviao} 
                    onChange={setAviao}
                    cancelar={() => setAviao(null)}
                    salvar={salvar}
                    excluir={excluir}
                    />
                ) : (
                    <>
                        <div className="flex justify-end">
                            <button className="flex items-center gap-2 bg-blue-500 px-4 py-2 rounded-md  cursor-pointer" onClick={() => setAviao({})}>
                                <IconPlus />
                                <span>Novo Avião</span>
                            </button>
                        </div>
                        <ListaAviao aviao={avioes} onClick={setAviao}/>
                    </>
                )}
                
            </Pagina>
        </ProtegeRota>
    )
}