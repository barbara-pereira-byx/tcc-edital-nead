-- CreateTable
CREATE TABLE "Aviao" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "capacidade" INTEGER NOT NULL,
    "modelo" TEXT NOT NULL,
    "nome_companhia" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Funcionario" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "data_nascimento" DATETIME NOT NULL,
    "cpf" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "cargo" TEXT NOT NULL,
    "numero_identificacao" INTEGER NOT NULL,
    "supervisorId" TEXT,
    CONSTRAINT "Funcionario_supervisorId_fkey" FOREIGN KEY ("supervisorId") REFERENCES "Funcionario" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Piloto" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "data_nascimento" DATETIME NOT NULL,
    "licenca" TEXT NOT NULL,
    "email" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Passageiro" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "data_nascimento" DATETIME NOT NULL,
    "cpf_passaporte" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "genero" INTEGER NOT NULL,
    "nascionalidade" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Voo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "origem" TEXT NOT NULL,
    "destino" TEXT NOT NULL,
    "numero" INTEGER NOT NULL,
    "status" INTEGER NOT NULL,
    "horario" DATETIME NOT NULL,
    "aviaoId" TEXT NOT NULL,
    "pilotoId" TEXT NOT NULL,
    CONSTRAINT "Voo_aviaoId_fkey" FOREIGN KEY ("aviaoId") REFERENCES "Aviao" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Voo_pilotoId_fkey" FOREIGN KEY ("pilotoId") REFERENCES "Piloto" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Reserva" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "preco" REAL NOT NULL,
    "assento" INTEGER NOT NULL,
    "classe" INTEGER NOT NULL,
    "passageiroId" TEXT NOT NULL,
    "funcionarioId" TEXT NOT NULL,
    "vooId" TEXT NOT NULL,
    CONSTRAINT "Reserva_passageiroId_fkey" FOREIGN KEY ("passageiroId") REFERENCES "Passageiro" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Reserva_funcionarioId_fkey" FOREIGN KEY ("funcionarioId") REFERENCES "Funcionario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Reserva_vooId_fkey" FOREIGN KEY ("vooId") REFERENCES "Voo" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Piloto_licenca_key" ON "Piloto"("licenca");

-- CreateIndex
CREATE UNIQUE INDEX "Passageiro_cpf_passaporte_key" ON "Passageiro"("cpf_passaporte");

-- CreateIndex
CREATE UNIQUE INDEX "Passageiro_email_key" ON "Passageiro"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Reserva_passageiroId_vooId_key" ON "Reserva"("passageiroId", "vooId");
