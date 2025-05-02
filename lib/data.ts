// Dados simulados para editais e inscrições

export type Edital = {
  id: string
  titulo: string
  descricao: string
  departamento: string
  prazo: string
  status: "aberto" | "fechado"
  vagas: number
  valorBolsa: string
  cargaHoraria: string
  requisitos: string[]
  documentos: string[]
}

export type Inscricao = {
  id: string
  edital: Edital
  dataInscricao: string
  status: "pendente" | "aprovado" | "rejeitado" | "finalizado"
  nome: string
  email: string
  cpf: string
  telefone: string
  matricula: string
  curso: string
  motivacao: string
  documentos: string[]
  feedback?: string
}

// Dados simulados de editais
const editais: Edital[] = [
  {
    id: "1",
    titulo: "Programa de Iniciação Científica 2024",
    descricao: "Edital para seleção de bolsistas para o Programa de Iniciação Científica na área de Ciências Exatas.",
    departamento: "Departamento de Ciências Exatas",
    prazo: "30/06/2024",
    status: "aberto",
    vagas: 5,
    valorBolsa: "R$ 800,00",
    cargaHoraria: "20 horas semanais",
    requisitos: [
      "Estar regularmente matriculado em curso de graduação",
      "Ter concluído pelo menos 2 semestres do curso",
      "Possuir CR (Coeficiente de Rendimento) igual ou superior a 7,0",
      "Não possuir vínculo empregatício",
    ],
    documentos: [
      "Histórico escolar atualizado",
      "Currículo Lattes",
      "Comprovante de matrícula",
      "Carta de recomendação de um professor",
    ],
  },
  {
    id: "2",
    titulo: "Monitoria em Cálculo I",
    descricao: "Seleção de monitores para a disciplina de Cálculo I para o segundo semestre de 2024.",
    departamento: "Departamento de Matemática",
    prazo: "15/07/2024",
    status: "aberto",
    vagas: 3,
    valorBolsa: "R$ 500,00",
    cargaHoraria: "12 horas semanais",
    requisitos: [
      "Ter sido aprovado na disciplina de Cálculo I com nota igual ou superior a 8,0",
      "Estar regularmente matriculado no curso",
      "Disponibilidade nos horários das aulas",
    ],
    documentos: [
      "Histórico escolar atualizado",
      "Comprovante de matrícula",
      "Declaração de disponibilidade de horários",
    ],
  },
  {
    id: "3",
    titulo: "Bolsa de Extensão - Projeto Comunidade Digital",
    descricao:
      "Seleção de bolsistas para atuarem no projeto de extensão Comunidade Digital, que visa promover inclusão digital em comunidades carentes.",
    departamento: "Departamento de Computação",
    prazo: "10/06/2024",
    status: "aberto",
    vagas: 4,
    valorBolsa: "R$ 700,00",
    cargaHoraria: "16 horas semanais",
    requisitos: [
      "Conhecimentos básicos em informática",
      "Habilidade de comunicação",
      "Experiência prévia com projetos sociais (desejável)",
    ],
    documentos: ["Histórico escolar", "Currículo", "Carta de intenções", "Comprovantes de experiência (se houver)"],
  },
  {
    id: "4",
    titulo: "Programa de Estágio em Laboratório de Química",
    descricao: "Oportunidade de estágio no Laboratório de Química Analítica para estudantes de graduação.",
    departamento: "Departamento de Química",
    prazo: "01/05/2024",
    status: "fechado",
    vagas: 2,
    valorBolsa: "R$ 900,00",
    cargaHoraria: "20 horas semanais",
    requisitos: [
      "Ter cursado Química Analítica I e II",
      "Conhecimento em técnicas de laboratório",
      "Disponibilidade no período da tarde",
    ],
    documentos: [
      "Histórico escolar atualizado",
      "Comprovante de matrícula",
      "Certificados de cursos relacionados",
      "Carta de recomendação do professor orientador",
    ],
  },
]

// Dados simulados de inscrições
const inscricoes: Inscricao[] = [
  {
    id: "1",
    edital: editais[0],
    dataInscricao: "15/05/2024",
    status: "pendente",
    nome: "Usuário Teste",
    email: "usuario@teste.com",
    cpf: "123.456.789-00",
    telefone: "(11) 98765-4321",
    matricula: "2022001234",
    curso: "Engenharia de Computação",
    motivacao:
      "Tenho grande interesse em desenvolver pesquisa na área de ciências exatas, especialmente em algoritmos de otimização. Acredito que esta oportunidade será fundamental para meu desenvolvimento acadêmico e profissional.",
    documentos: [
      "Histórico Escolar - Usuário Teste.pdf",
      "Currículo Lattes - Usuário Teste.pdf",
      "Comprovante de Matrícula - 2024.1.pdf",
    ],
  },
  {
    id: "2",
    edital: editais[2],
    dataInscricao: "10/05/2024",
    status: "aprovado",
    nome: "Usuário Teste",
    email: "usuario@teste.com",
    cpf: "123.456.789-00",
    telefone: "(11) 98765-4321",
    matricula: "2022001234",
    curso: "Engenharia de Computação",
    motivacao:
      "Possuo experiência com projetos sociais e gostaria de contribuir com meus conhecimentos em informática para ajudar comunidades carentes a terem acesso à tecnologia.",
    documentos: [
      "Histórico Escolar - Usuário Teste.pdf",
      "Currículo - Usuário Teste.pdf",
      "Carta de Intenções.pdf",
      "Certificado Projeto Social 2023.pdf",
    ],
    feedback:
      "Candidato aprovado com excelente perfil para o projeto. Experiência prévia com projetos sociais foi um diferencial.",
  },
]

// Funções para acessar os dados
export async function getEditais() {
  // Simulando um atraso de rede
  await new Promise((resolve) => setTimeout(resolve, 500))
  return editais
}

export async function getEditalById(id: string) {
  // Simulando um atraso de rede
  await new Promise((resolve) => setTimeout(resolve, 300))
  return editais.find((edital) => edital.id === id) || null
}

export async function getInscricoes() {
  // Simulando um atraso de rede
  await new Promise((resolve) => setTimeout(resolve, 500))
  return inscricoes
}

export async function getInscricaoById(id: string) {
  // Simulando um atraso de rede
  await new Promise((resolve) => setTimeout(resolve, 300))
  return inscricoes.find((inscricao) => inscricao.id === id) || null
}
