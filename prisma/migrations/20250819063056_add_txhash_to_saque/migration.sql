/*
  Warnings:

  - A unique constraint covering the columns `[txHash]` on the table `Saque` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."Saque" ADD COLUMN     "txHash" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Saque_txHash_key" ON "public"."Saque"("txHash");
