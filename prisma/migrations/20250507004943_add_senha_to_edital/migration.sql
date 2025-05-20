/*
  Warnings:

  - You are about to drop the `SecaoEdital` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TopicoEdital` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `rotulo` to the `Edital` table without a default value. This is not possible if the table is not empty.
  - Added the required column `senha` to the `Edital` table without a default value. This is not possible if the table is not empty.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "SecaoEdital";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "TopicoEdital";
PRAGMA foreign_keys=on;

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
    "senha" TEXT NOT NULL,
    "rotulo" TEXT NOT NULL
);
INSERT INTO "new_Edital" ("createdAt", "dataCriacao", "dataEncerramento", "dataPublicacao", "id", "titulo", "updatedAt") SELECT "createdAt", "dataCriacao", "dataEncerramento", "dataPublicacao", "id", "titulo", "updatedAt" FROM "Edital";
DROP TABLE "Edital";
ALTER TABLE "new_Edital" RENAME TO "Edital";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
