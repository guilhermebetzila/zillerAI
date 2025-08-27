/*
  Warnings:

  - A unique constraint covering the columns `[userId,investimentoId,dateKey]` on the table `RendimentoDiario` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `investimentoId` to the `RendimentoDiario` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."RendimentoDiario_userId_dateKey_idx";

-- DropIndex
DROP INDEX "public"."RendimentoDiario_userId_dateKey_key";

-- AlterTable
ALTER TABLE "public"."RendimentoDiario" ADD COLUMN     "investimentoId" INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX "RendimentoDiario_userId_investimentoId_dateKey_idx" ON "public"."RendimentoDiario"("userId", "investimentoId", "dateKey");

-- CreateIndex
CREATE UNIQUE INDEX "RendimentoDiario_userId_investimentoId_dateKey_key" ON "public"."RendimentoDiario"("userId", "investimentoId", "dateKey");

-- AddForeignKey
ALTER TABLE "public"."RendimentoDiario" ADD CONSTRAINT "RendimentoDiario_investimentoId_fkey" FOREIGN KEY ("investimentoId") REFERENCES "public"."Investimento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
