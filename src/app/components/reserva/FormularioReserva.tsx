import { Reserva } from "@/core/models/Reserva";
import InputTexto from "../shared/InputTexto";
import { useState, useEffect } from "react";

export interface ReservaProps {
  reserva: Partial<Reserva>;
  onChange: (reserva: Partial<Reserva>) => void;
  salvar: () => void;
  cancelar: () => void;
  excluir: () => void;
}

export default function FormularioReserva(props: ReservaProps) {
  const [valido, setValido] = useState(false);
  const [passageiros, setPassageiros] = useState<any[]>([]);
  const [funcionarios, setFuncionarios] = useState<any[]>([]);
  const [voos, setVoos] = useState<any[]>([]);

  // Validação dos campos obrigatórios
  useEffect(() => {
    const { preco, assento, classe, passageiroId, funcionarioId, vooId } = props.reserva;
    setValido(!!(preco && assento && classe && passageiroId && funcionarioId && vooId));
  }, [props.reserva]);

  // Carregar dados para os dropdowns
  useEffect(() => {
    async function carregarDados() {
      try {
        const [passageirosRes, funcionariosRes, voosRes] = await Promise.all([
          fetch("/passageiros"),
          fetch("/funcionarios"),  // Atualize para sua rota de funcionários
          fetch("/voos"),  // Atualize para sua rota de voos
        ]);

        if (!passageirosRes.ok || !funcionariosRes.ok) {
          throw new Error("Erro ao carregar dados");
        }

        const passageirosData = await passageirosRes.json();
        const funcionariosData = await funcionariosRes.json();
        const voosData = await voosRes.json();

        setPassageiros(passageirosData);
        setFuncionarios(funcionariosData);
        setVoos(voosData);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      }
    }
    carregarDados();
  }, []);

  return (
    <div className="flex flex-col gap-5">
      <InputTexto
        label="Preço"
        type="number"
        placeholder="Digite o preço da reserva"
        value={props.reserva.preco?.toString() || ""}
        onChange={(e) =>
          props.onChange?.({
            ...props.reserva,
            preco: parseFloat(e.target.value) || 0,
          })
        }
      />
      <InputTexto
        label="Assento"
        type="number"
        placeholder="Digite o número do assento"
        value={props.reserva.assento?.toString() || ""}
        onChange={(e) =>
          props.onChange?.({
            ...props.reserva,
            assento: parseInt(e.target.value, 10) || 0,
          })
        }
      />
      <InputTexto
        label="Classe"
        type="number"
        placeholder="Digite a classe (1 = Econômica, 2 = Executiva, 3 = Primeira)"
        value={props.reserva.classe?.toString() || ""}
        onChange={(e) =>
          props.onChange?.({
            ...props.reserva,
            classe: parseInt(e.target.value, 10) || 0,
          })
        }
      />
      <div>
        <label className="block text-sm font-medium text-gray-700">Passageiro</label>
        <select
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          value={props.reserva.passageiroId || ""}
          onChange={(e) =>
            props.onChange?.({
              ...props.reserva,
              passageiroId: e.target.value,
            })
          }
        >
          <option value="">Selecione um passageiro</option>
          {passageiros.map((passageiro) => (
            <option key={passageiro.id} value={passageiro.id}>
              {passageiro.nome}
            </option>
          ))}
        </select>
      </div>
      {/* Campos para funcionários e voos seguem o mesmo padrão */}
      {/* Código para campos de funcionários e voos */}
    </div>
  );
}
