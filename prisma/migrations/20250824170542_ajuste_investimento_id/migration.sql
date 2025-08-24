-- DropForeignKey
ALTER TABLE "public"."RendimentoDiario" DROP CONSTRAINT "RendimentoDiario_investimentoId_fkey";

-- AlterTable
ALTER TABLE "public"."RendimentoDiario" ALTER COLUMN "investimentoId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."RendimentoDiario" ADD CONSTRAINT "RendimentoDiario_investimentoId_fkey" FOREIGN KEY ("investimentoId") REFERENCES "public"."Investimento"("id") ON DELETE SET NULL ON UPDATE CASCADE;
