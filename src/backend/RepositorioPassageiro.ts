import { Passageiro } from "@/core/models/Passageiro";
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

export default class RepositorioPassageiro {
    
    static async salvar(passageiro: Passageiro): Promise<Passageiro> {
        return await db.passageiro.upsert({ 
            where: { id: passageiro.id || "" },
            update: passageiro,
            create: passageiro,
        });
    }
    
    static async obterTodos(): Promise<Passageiro[]> {
        return await db.passageiro.findMany();
    }

    static async obterPorId(id: string): Promise<Passageiro | null> { 
        return await db.passageiro.findUnique({ where: { id } }); 
    }

    static async excluir(id: string): Promise<void> {
        await db.passageiro.delete({ where: { id } });
    }
}
