/*
  Warnings:

  - You are about to drop the column `caminho` on the `ArquivoUsuario` table. All the data in the column will be lost.
  - You are about to drop the column `nomeArmazenado` on the `ArquivoUsuario` table. All the data in the column will be lost.
  - Added the required column `arquivo` to the `ArquivoUsuario` table without a default value. This is not possible if the table is not empty.
  - Made the column `campoId` on table `ArquivoUsuario` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "ArquivoUsuario_campoId_key";

-- AlterTable
ALTER TABLE "ArquivoUsuario" DROP COLUMN "caminho",
DROP COLUMN "nomeArmazenado",
ADD COLUMN     "arquivo" BYTEA NOT NULL,
ALTER COLUMN "campoId" SET NOT NULL;
