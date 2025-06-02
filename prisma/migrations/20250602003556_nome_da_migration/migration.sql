/*
  Warnings:

  - Made the column `dataEncerramento` on table `Edital` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Edital" ALTER COLUMN "dataEncerramento" SET NOT NULL;
