/*
  Warnings:

  - You are about to drop the column `rotulo` on the `Edital` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "ArquivoEdital" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "url" TEXT NOT NULL,
    "rotulo" TEXT NOT NULL,
    "editalId" TEXT,
    CONSTRAINT "ArquivoEdital_editalId_fkey" FOREIGN KEY ("editalId") REFERENCES "Edital" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Edital" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "titulo" TEXT NOT NULL,
    "dataCriacao" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataPublicacao" DATETIME NOT NULL,
    "dataEncerramento" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "senha" TEXT NOT NULL
);
INSERT INTO "new_Edital" ("createdAt", "dataCriacao", "dataEncerramento", "dataPublicacao", "id", "senha", "titulo", "updatedAt") SELECT "createdAt", "dataCriacao", "dataEncerramento", "dataPublicacao", "id", "senha", "titulo", "updatedAt" FROM "Edital";
DROP TABLE "Edital";
ALTER TABLE "new_Edital" RENAME TO "Edital";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
