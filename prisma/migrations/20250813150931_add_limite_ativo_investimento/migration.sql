-- AlterTable
ALTER TABLE "public"."Investimento" ADD COLUMN     "ativo" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "limite" DOUBLE PRECISION NOT NULL DEFAULT 0;
