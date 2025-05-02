-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Funcionario" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "data_nascimento" DATETIME,
    "cpf" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "cargo" TEXT,
    "senha" TEXT NOT NULL,
    "numero_identificacao" INTEGER,
    "supervisorId" TEXT,
    CONSTRAINT "Funcionario_supervisorId_fkey" FOREIGN KEY ("supervisorId") REFERENCES "Funcionario" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Funcionario" ("cargo", "cpf", "data_nascimento", "email", "id", "nome", "numero_identificacao", "senha", "supervisorId") SELECT "cargo", "cpf", "data_nascimento", "email", "id", "nome", "numero_identificacao", "senha", "supervisorId" FROM "Funcionario";
DROP TABLE "Funcionario";
ALTER TABLE "new_Funcionario" RENAME TO "Funcionario";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
