import { Reserva } from "./Reserva";

export interface Funcionario {
  id: string;
  nome: string;
  data_nascimento: Date;
  cpf: string;
  email: string;
  cargo: string;
  numero_identificacao: number;
  supervisorId: string;
  supervisor?: Funcionario;
  subordinados?: Funcionario[];
  reservas?: Reserva[];
  senha: string;
}
