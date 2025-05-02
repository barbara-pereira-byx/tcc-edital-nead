/*
  Warnings:

  - You are about to drop the column `nascionalidade` on the `Passageiro` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Passageiro" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "data_nascimento" DATETIME,
    "cpf_passaporte" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "genero" INTEGER,
    "nacionalidade" TEXT
);
INSERT INTO "new_Passageiro" ("cpf_passaporte", "data_nascimento", "email", "genero", "id", "nome") SELECT "cpf_passaporte", "data_nascimento", "email", "genero", "id", "nome" FROM "Passageiro";
DROP TABLE "Passageiro";
ALTER TABLE "new_Passageiro" RENAME TO "Passageiro";
CREATE UNIQUE INDEX "Passageiro_cpf_passaporte_key" ON "Passageiro"("cpf_passaporte");
CREATE UNIQUE INDEX "Passageiro_email_key" ON "Passageiro"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
