/*
  Warnings:

  - You are about to drop the column `chavePix` on the `Saque` table. All the data in the column will be lost.
  - You are about to drop the column `tipo` on the `Saque` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Saque" DROP COLUMN "chavePix",
DROP COLUMN "tipo",
ADD COLUMN     "chave" TEXT,
ADD COLUMN     "metodo" TEXT NOT NULL DEFAULT 'PIX',
ADD COLUMN     "responseApi" TEXT;
