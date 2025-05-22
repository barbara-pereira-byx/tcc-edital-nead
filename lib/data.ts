// Dados estáticos para os editais
const editaisData = [
  {
    id: "1",
    titulo: "Programa de Bolsas de Iniciação Científica",
    descricao:
      "O Programa de Bolsas de Iniciação Científica (PIBIC) tem como objetivo despertar vocação científica e incentivar novos talentos potenciais entre estudantes de graduação.",
    dataEncerramento: "2024-12-31",
  },
  {
    id: "2",
    titulo: "Auxílio Financeiro para Participação em Eventos Científicos",
    descricao:
      "Apoio financeiro para estudantes de pós-graduação que desejam apresentar trabalhos em eventos científicos nacionais e internacionais.",
    dataEncerramento: "2024-11-15",
  },
  {
    id: "3",
    titulo: "Programa de Monitoria",
    descricao:
      "O Programa de Monitoria visa promover a cooperação entre alunos e professores, aprimorando o processo de ensino-aprendizagem.",
    dataEncerramento: "2024-10-30",
  },
  {
    id: "4",
    titulo: "Bolsa de Extensão",
    descricao:
      "O Programa de Extensão oferece bolsas para alunos que participam de projetos de extensão universitária, promovendo a interação entre a universidade e a sociedade.",
    dataEncerramento: "2024-09-20",
  },
  {
    id: "5",
    titulo: "Programa de Apoio à Pesquisa",
    descricao:
      "O Programa de Apoio à Pesquisa (PAP) visa fortalecer a pesquisa científica e tecnológica na universidade, oferecendo suporte financeiro e infraestrutura para projetos de pesquisa.",
    dataEncerramento: "2024-08-10",
  },
]

// Dados estáticos para as inscrições (simulando dados do banco de dados)
const inscricoesData = [
  {
    id: "1",
    editalId: "1",
    data: "2023-03-15",
    status: "Aprovado",
    nome: "João da Silva",
    email: "joao.silva@example.com",
    cpf: "123.456.789-00",
    telefone: "(11) 99999-8888",
    respostas: [
      { pergunta: "Número de Matrícula", resposta: "123456" },
      { pergunta: "Curso", resposta: "Engenharia da Computação" },
      { pergunta: "Carta de Motivação", resposta: "Tenho grande interesse na área..." },
    ],
    documentos: [{ nome: "RG.pdf" }, { nome: "CPF.pdf" }, { nome: "Historico.pdf" }],
  },
  {
    id: "2",
    editalId: "2",
    data: "2023-04-20",
    status: "Em análise",
    nome: "Maria Souza",
    email: "maria.souza@example.com",
    cpf: "987.654.321-00",
    telefone: "(21) 98888-7777",
    respostas: [
      { pergunta: "Número de Matrícula", resposta: "654321" },
      { pergunta: "Curso", resposta: "Administração" },
      { pergunta: "Carta de Motivação", resposta: "Busco aprimorar meus conhecimentos..." },
    ],
    documentos: [{ nome: "RG.pdf" }, { nome: "CPF.pdf" }, { nome: "Comprovante.pdf" }],
  },
  {
    id: "3",
    editalId: "1",
    data: "2023-05-10",
    status: "Reprovado",
    nome: "Carlos Ferreira",
    email: "carlos.ferreira@example.com",
    cpf: "456.789.123-00",
    telefone: "(31) 97777-6666",
    respostas: [
      { pergunta: "Número de Matrícula", resposta: "987654" },
      { pergunta: "Curso", resposta: "Direito" },
      { pergunta: "Carta de Motivação", resposta: "Desejo contribuir com a sociedade..." },
    ],
    documentos: [{ nome: "RG.pdf" }, { nome: "CPF.pdf" }, { nome: "Declaracao.pdf" }],
  },
  {
    id: "4",
    editalId: "3",
    data: "2023-06-01",
    status: "Aprovado",
    nome: "Ana Paula",
    email: "ana.paula@example.com",
    cpf: "654.321.987-00",
    telefone: "(41) 96666-5555",
    respostas: [
      { pergunta: "Número de Matrícula", resposta: "345678" },
      { pergunta: "Curso", resposta: "Medicina" },
      { pergunta: "Carta de Motivação", resposta: "Almejo ajudar as pessoas..." },
    ],
    documentos: [{ nome: "RG.pdf" }, { nome: "CPF.pdf" }, { nome: "Curriculo.pdf" }],
  },
  {
    id: "5",
    editalId: "4",
    data: "2023-07-15",
    status: "Finalizado",
    nome: "Ricardo Oliveira",
    email: "ricardo.oliveira@example.com",
    cpf: "321.654.987-00",
    telefone: "(51) 95555-4444",
    respostas: [
      { pergunta: "Número de Matrícula", resposta: "876543" },
      { pergunta: "Curso", resposta: "Psicologia" },
      { pergunta: "Carta de Motivação", resposta: "Quero entender a mente humana..." },
    ],
    documentos: [{ nome: "RG.pdf" }, { nome: "CPF.pdf" }, { nome: "Diploma.pdf" }],
  },
]

// Funções para acessar os dados
export async function getEditais() {
  // Em um cenário real, isso seria uma consulta ao banco de dados
  return editaisData.map((edital) => ({
    id: edital.id,
    titulo: edital.titulo,
    descricao: edital.descricao,
    departamento: "Departamento de Tecnologia",
    prazo: edital.dataEncerramento ? new Date(edital.dataEncerramento).toLocaleDateString("pt-BR") : "Não definido",
    status: new Date() < new Date(edital.dataEncerramento || "") ? "aberto" : "fechado",
    vagas: "5",
    valorBolsa: "R$ 500,00",
    cargaHoraria: "20h semanais",
    requisitos: [
      "Estar regularmente matriculado em curso de graduação",
      "Ter concluído pelo menos 2 semestres do curso",
      "Possuir conhecimentos básicos na área de interesse",
      "Não possuir vínculo empregatício",
    ],
    documentos: ["Cópia do RG e CPF", "Histórico escolar atualizado", "Currículo Lattes", "Comprovante de matrícula"],
  }))
}

export async function getEditalById(id: string) {
  const edital = editaisData.find((e) => e.id === id)

  if (!edital) return null

  return {
    id: edital.id,
    titulo: edital.titulo,
    descricao: edital.descricao,
    departamento: "Departamento de Tecnologia",
    prazo: edital.dataEncerramento ? new Date(edital.dataEncerramento).toLocaleDateString("pt-BR") : "Não definido",
    status: new Date() < new Date(edital.dataEncerramento || "") ? "aberto" : "fechado",
    vagas: "5",
    valorBolsa: "R$ 500,00",
    cargaHoraria: "20h semanais",
    requisitos: [
      "Estar regularmente matriculado em curso de graduação",
      "Ter concluído pelo menos 2 semestres do curso",
      "Possuir conhecimentos básicos na área de interesse",
      "Não possuir vínculo empregatício",
    ],
    documentos: ["Cópia do RG e CPF", "Histórico escolar atualizado", "Currículo Lattes", "Comprovante de matrícula"],
  }
}

export async function getInscricoes() {
  // Em um cenário real, isso seria uma consulta ao banco de dados
  return inscricoesData.map((inscricao) => {
    const edital = editaisData.find((e) => e.id === inscricao.editalId)

    return {
      id: inscricao.id,
      edital: {
        id: edital?.id || "",
        titulo: edital?.titulo || "",
        descricao: edital?.descricao || "",
        departamento: "Departamento de Tecnologia",
        prazo: edital?.dataEncerramento
          ? new Date(edital.dataEncerramento).toLocaleDateString("pt-BR")
          : "Não definido",
      },
      dataInscricao: inscricao.data,
      status:
        inscricao.status === "Em análise"
          ? "pendente"
          : inscricao.status === "Aprovado"
            ? "aprovado"
            : inscricao.status === "Reprovado"
              ? "rejeitado"
              : "finalizado",
    }
  })
}

export async function getInscricaoById(id: string) {
  const inscricao = inscricoesData.find((i) => i.id === id)

  if (!inscricao) return null

  const edital = editaisData.find((e) => e.id === inscricao.editalId)

  return {
    id: inscricao.id,
    edital: {
      id: edital?.id || "",
      titulo: edital?.titulo || "",
      descricao: edital?.descricao || "",
      departamento: "Departamento de Tecnologia",
      prazo: edital?.dataEncerramento ? new Date(edital.dataEncerramento).toLocaleDateString("pt-BR") : "Não definido",
      valorBolsa: "R$ 500,00",
      cargaHoraria: "20h semanais",
    },
    dataInscricao: inscricao.data,
    status:
      inscricao.status === "Em análise"
        ? "pendente"
        : inscricao.status === "Aprovado"
          ? "aprovado"
          : inscricao.status === "Reprovado"
            ? "rejeitado"
            : "finalizado",
    feedback:
      inscricao.status === "Aprovado"
        ? "Parabéns! Sua inscrição foi aprovada."
        : inscricao.status === "Reprovado"
          ? "Infelizmente sua inscrição não foi aprovada."
          : null,
    nome: inscricao.nome,
    email: inscricao.email,
    cpf: inscricao.cpf,
    telefone: inscricao.telefone,
    matricula: inscricao.respostas.find((r) => r.pergunta === "Número de Matrícula")?.resposta || "",
    curso: inscricao.respostas.find((r) => r.pergunta === "Curso")?.resposta || "",
    motivacao: inscricao.respostas.find((r) => r.pergunta === "Carta de Motivação")?.resposta || "",
    documentos: inscricao.documentos.map((doc) => doc.nome),
  }
}
