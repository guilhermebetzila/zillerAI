/*
  Warnings:

  - Made the column `investimentoId` on table `RendimentoDiario` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "public"."RendimentoDiario" DROP CONSTRAINT "RendimentoDiario_investimentoId_fkey";

-- DropIndex
DROP INDEX "public"."RendimentoDiario_userId_dateKey_key";

-- AlterTable
ALTER TABLE "public"."RendimentoDiario" ALTER COLUMN "investimentoId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."RendimentoDiario" ADD CONSTRAINT "RendimentoDiario_investimentoId_fkey" FOREIGN KEY ("investimentoId") REFERENCES "public"."Investimento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
