import { Reserva } from "./Reserva";

export interface Passageiro {
  id: string;
  nome: string;
  data_nascimento: Date;
  cpf_passaporte: string;
  email: string;
  genero: number;
  nacionalidade: string; // Corrigido "nascionalidade" para "nacionalidade"
  reservas?: Reserva[];
}
