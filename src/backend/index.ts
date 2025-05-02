import salvarFuncionario from "./funcionario/salvarFuncionario"
import obterTodosFuncionarios from "./funcionario/obterTodosFuncionarios"
import excluirFuncionario from "./funcionario/excluirFuncionario"
import salvarPassageiro from "./passageiro/salvarPassageiro"
import excluirPassageiro from "./passageiro/excluirPassageiro"
import obterTodosPassageiros from "./passageiro/obterTodosPassageiros"
import salvarReserva from "./reserva/salvarReserva"
import obterTodosReserva from "./reserva/obterTodosReserva"
import excluirReserva from "./reserva/excluirReserva"
import salvarAviao from "./aviao/salvarAviao"
import obterTodosAviao from "./aviao/obterTodosAviao"
import excluirAviao from "./aviao/excluirAviao"

export default class Backend {
    static readonly funcionarios = {
        salvar: salvarFuncionario,
        obter: obterTodosFuncionarios,
        excluir: excluirFuncionario
    }
    
    static readonly passageiros = {
        salvar: salvarPassageiro,
        obter: obterTodosPassageiros,
        excluir: excluirPassageiro
    }
    
    static readonly reservas = {
        salvar: salvarReserva,
        obter: obterTodosReserva,
        excluir: excluirReserva
    }
    
    static readonly aviao = {
        salvar: salvarAviao,
        obter: obterTodosAviao,
        excluir: excluirAviao
    }
}