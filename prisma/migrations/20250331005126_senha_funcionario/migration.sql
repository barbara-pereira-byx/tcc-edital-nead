/*
  Warnings:

  - Added the required column `senha` to the `Funcionario` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Funcionario" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "data_nascimento" DATETIME NOT NULL,
    "cpf" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "cargo" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "numero_identificacao" INTEGER NOT NULL,
    "supervisorId" TEXT,
    CONSTRAINT "Funcionario_supervisorId_fkey" FOREIGN KEY ("supervisorId") REFERENCES "Funcionario" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Funcionario" ("cargo", "cpf", "data_nascimento", "email", "id", "nome", "numero_identificacao", "supervisorId") SELECT "cargo", "cpf", "data_nascimento", "email", "id", "nome", "numero_identificacao", "supervisorId" FROM "Funcionario";
DROP TABLE "Funcionario";
ALTER TABLE "new_Funcionario" RENAME TO "Funcionario";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
