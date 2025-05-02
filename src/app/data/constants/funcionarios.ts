import { Funcionario } from "../../../core/models/Funcionario";

const funcionarios: Funcionario[] = [
    {
        id: "1",
        nome: "João Silva",
        data_nascimento: new Date("1990-01-01"),
        cpf: "123.456.789-00",
        email: "joao.silva@email.com",
        cargo: "Atendente",
        numero_identificacao: 101,
        senha: "senhaSegura123",
        supervisorId: "2",
        supervisor: undefined, // Alterado de null para undefined
        subordinados: [],
        reservas: []
    },
    {
        id: "2",
        nome: "Maria Oliveira",
        data_nascimento: new Date("1985-09-15"),
        cpf: "987.654.321-00",
        email: "maria.oliveira@email.com",
        cargo: "Gerente",
        numero_identificacao: 102,
        senha: "outraSenhaSegura",
        supervisorId: "",
        supervisor: undefined, // Alterado de null para undefined
        subordinados: [],
        reservas: []
    }
];

export default funcionarios;
