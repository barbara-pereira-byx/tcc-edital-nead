import { Voo } from "./Voo";

export interface Aviao {
  id: string;
  capacidade: number;
  modelo: string;
  nome_companhia: string;
  voos?: Voo[];
}
