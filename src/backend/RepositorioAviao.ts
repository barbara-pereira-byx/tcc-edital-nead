import { Aviao } from "@/core/models/Aviao";
import { PrismaClient } from "@prisma/client";

export default class RepositorioAviao {
    private static db: PrismaClient = new PrismaClient()    

    static async salvar(aviao: Aviao): Promise<Aviao> {
        if (!aviao.id) {
            throw new Error("ID do avião é obrigatório para salvar.");
        }
        
        const capacidade = typeof aviao.capacidade === "string"
        ? parseInt(aviao.capacidade, 10)
        : aviao.capacidade;

        return this.db.aviao.upsert({ 
            where: { id: aviao.id },
            update: { ...aviao, capacidade },
            create: { ...aviao, capacidade }
          })
    }
    
    static async obterTodos(): Promise<Aviao []> {
        return await this.db.aviao.findMany()
    }

    static async obterPorId(id: string): Promise<Aviao> {
        const aviao = await this.db.aviao.findUnique({ where: { id } })
        return aviao as Aviao
    }

    static async excluir(id: string): Promise<void> {
        await this.db.aviao.delete({
            where: { id }
        })
    }
}