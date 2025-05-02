import { Passageiro } from "./Passageiro";
import { Funcionario } from "./Funcionario";
import { Voo } from "./Voo";

export interface Reserva {
    id: string;
    preco: number;
    assento: number;
    classe: number;
    passageiroId: string;
    passageiro: Passageiro;
    funcionarioId: string;
    funcionario: Funcionario;
    vooId: string;
    voo: Voo;
  }
  