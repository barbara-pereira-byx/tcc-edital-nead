const { PrismaClient } = require("@prisma/client")
const { hash } = require("bcrypt")

const prisma = new PrismaClient()

async function main() {
  try {
    // Criar usuário administrador
    const adminPassword = await hash("admin123", 10)
    const admin = await prisma.usuario.upsert({
      where: { email: "admin@example.com" },
      update: {},
      create: {
        nome: "Administrador",
        email: "admin@example.com",
        cpf: "00000000000",
        senha: adminPassword,
        tipo: 1, // Administrador
      },
    })
    console.log("Usuário administrador criado:", admin.email)

    // Criar usuário comum
    const userPassword = await hash("user123", 10)
    const user = await prisma.usuario.upsert({
      where: { email: "user@example.com" },
      update: {},
      create: {
        nome: "Usuário Teste",
        email: "user@example.com",
        cpf: "11111111111",
        senha: userPassword,
        tipo: 0, // Usuário comum
      },
    })
    console.log("Usuário comum criado:", user.email)

    // Criar um edital de exemplo
    const edital = await prisma.edital.create({
      data: {
        titulo: "Edital de Bolsas de Iniciação Científica 2024",
        dataPublicacao: new Date(),
        dataEncerramento: new Date(new Date().setMonth(new Date().getMonth() + 2)),
        secoes: {
          create: [
            {
              titulo: "Descrição",
              topicos: {
                create: [
                  {
                    texto:
                      "Este edital tem como objetivo selecionar estudantes para o programa de iniciação científica da universidade.",
                  },
                ],
              },
            },
            {
              titulo: "Requisitos",
              topicos: {
                create: [
                  {
                    texto:
                      "- Estar regularmente matriculado em curso de graduação\n- Ter CR igual ou superior a 7,0\n- Não possuir vínculo empregatício",
                  },
                ],
              },
            },
            {
              titulo: "Documentação",
              topicos: {
                create: [
                  {
                    texto: "- Histórico escolar\n- Currículo Lattes\n- Carta de recomendação",
                  },
                ],
              },
            },
          ],
        },
      },
    })
    console.log("Edital criado:", edital.titulo)

    // Criar formulário para o edital
    const formulario = await prisma.formulario.create({
      data: {
        titulo: "Formulário de Inscrição",
        dataInicio: new Date(),
        dataFim: new Date(new Date().setMonth(new Date().getMonth() + 1)),
        editalId: edital.id,
        campos: {
          create: [
            {
              rotulo: "Nome Completo",
              tipo: 0, // Texto curto
              obrigatorio: 1,
            },
            {
              rotulo: "CPF",
              tipo: 0, // Texto curto
              obrigatorio: 1,
            },
            {
              rotulo: "E-mail",
              tipo: 0, // Texto curto
              obrigatorio: 1,
            },
            {
              rotulo: "Curso",
              tipo: 0, // Texto curto
              obrigatorio: 1,
            },
            {
              rotulo: "Período|1º,2º,3º,4º,5º,6º,7º,8º,9º,10º",
              tipo: 3, // Select
              obrigatorio: 1,
            },
            {
              rotulo: "Carta de Motivação",
              tipo: 1, // Texto longo
              obrigatorio: 1,
            },
            {
              rotulo: "Aceito os termos do edital|Declaro que li e aceito os termos do edital",
              tipo: 4, // Checkbox
              obrigatorio: 1,
            },
          ],
        },
      },
    })
    console.log("Formulário criado para o edital")
  } catch (error) {
    console.error("Erro ao popular o banco de dados:", error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
