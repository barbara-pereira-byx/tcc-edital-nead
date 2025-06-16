/*
  Warnings:

  - You are about to drop the column `url` on the `ArquivoEdital` table. All the data in the column will be lost.
  - Added the required column `arquivo` to the `ArquivoEdital` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ArquivoEdital" DROP COLUMN "url",
ADD COLUMN     "arquivo" BYTEA NOT NULL;
