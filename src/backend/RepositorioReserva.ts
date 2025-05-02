import { Reserva } from "@/core/models/Reserva";
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

export default class RepositorioReserva {
    
    static async salvar(reserva: Reserva): Promise<Reserva> {
        return await db.reserva.upsert({ 
            where: { id: reserva.id || "" },
            update: reserva,
            create: reserva,
        });
    }
    
    static async obterTodos(): Promise<Reserva[]> {
        return await db.reserva.findMany();
    }

    static async obterPorId(id: string): Promise<Reserva | null> { 
        return await db.reserva.findUnique({ where: { id } }); 
    }

    static async excluir(id: string): Promise<void> {
        await db.reserva.delete({ where: { id } });
    }
}
