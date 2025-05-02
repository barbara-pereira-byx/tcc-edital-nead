import InputTexto from "../shared/InputTexto"
import { Aviao } from "@/core/models/Aviao"

export interface AviaoProps {
    aviao: Partial<Aviao>
    onChange: (aviao: Partial<Aviao>) => void
    salvar: () => void
    cancelar: () => void
    excluir: () => void
}

export default function FormularioAviao(props: AviaoProps) {
    return(
        <div className="flex flex-col gap-5">
            <InputTexto 
                label="Capacidade" 
                type="number"
                placeholder="Digite a capacidade do avião" 
                value={props.aviao.capacidade?.toString() || ""} 
                onChange={e => 
                    props.onChange?.({ 
                    ...props.aviao, 
                    capacidade: parseInt(e.target.value, 10) || 0 
                    })
                }
            />
            <InputTexto 
                label="Modelo do Avião" 
                type="text" 
                value={props.aviao.modelo} 
                onChange={
                    e => props.onChange?.({ ...props.aviao, modelo: e.target.value })
                }
            />
            <InputTexto 
                label="Nome da Companhia" 
                type="text" 
                value={props.aviao.nome_companhia} 
                onChange={
                    e => props.onChange?.({ ...props.aviao, nome_companhia: e.target.value })
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