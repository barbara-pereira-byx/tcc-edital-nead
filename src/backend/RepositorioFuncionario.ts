import { Funcionario } from "@/core/models/Funcionario";
import { PrismaClient } from "@prisma/client";

export default class RepositorioFuncionario {
    private static db: PrismaClient = new PrismaClient()    

    static async salvar(funcionario: Funcionario): Promise<Funcionario> {
        if (!funcionario.id) {
            throw new Error("ID do funcionário é obrigatório para salvar.");
        }
        return await this.db.funcionario.upsert({ 
            where: { id: funcionario.id },
            update: funcionario,
            create: funcionario
        })
    }
    
    static async obterTodos(): Promise<Funcionario []> {
        return await this.db.funcionario.findMany()
    }

    static async obterPorId(id: string): Promise<Funcionario> {
        const funcionario = await this.db.funcionario.findUnique({ where: { id } })
        return funcionario as Funcionario
    }

    static async excluir(id: string): Promise<void> {
        await this.db.funcionario.delete({
            where: { id }
        })
    }
}