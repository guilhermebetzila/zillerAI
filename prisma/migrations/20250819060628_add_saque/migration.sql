-- CreateEnum
CREATE TYPE "public"."StatusSaque" AS ENUM ('pendente', 'processando', 'concluido', 'rejeitado');

-- CreateTable
CREATE TABLE "public"."Saque" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "valor" DECIMAL(65,30) NOT NULL,
    "carteira" TEXT NOT NULL,
    "status" "public"."StatusSaque" NOT NULL DEFAULT 'pendente',
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processadoEm" TIMESTAMP(3),

    CONSTRAINT "Saque_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Saque" ADD CONSTRAINT "Saque_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
