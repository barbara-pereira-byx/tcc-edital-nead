import { Aviao } from "./Aviao";
import { Piloto } from "./Piloto";
import { Reserva } from "./Reserva";

export interface Voo {
  id: string;
  origem: string;
  destino: string;
  numero: number;
  status: number;
  horario: Date;
  aviaoId: string;
  aviao: Aviao;
  pilotoId: string;
  piloto: Piloto;
  reservas?: Reserva[];
}
