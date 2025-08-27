-- CreateEnum
CREATE TYPE "public"."StatusDeposito" AS ENUM ('pendente', 'confirmado', 'cancelado');

-- AlterTable
ALTER TABLE "public"."Deposito" ADD COLUMN     "status" "public"."StatusDeposito" NOT NULL DEFAULT 'pendente';
