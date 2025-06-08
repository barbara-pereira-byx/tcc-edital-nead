-- CreateEnum
CREATE TYPE "StatusInscricao" AS ENUM ('ATIVO', 'CANCELADO');

-- AlterTable
ALTER TABLE "FormularioUsuario" ADD COLUMN     "status" "StatusInscricao" NOT NULL DEFAULT 'ATIVO';
