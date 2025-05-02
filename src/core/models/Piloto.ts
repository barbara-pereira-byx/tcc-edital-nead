import { Voo } from "./Voo";

export interface Piloto {
  id: string;
  nome: string;
  data_nascimento: Date;
  licenca: string;
  email: string;
  voos?: Voo[];
}
