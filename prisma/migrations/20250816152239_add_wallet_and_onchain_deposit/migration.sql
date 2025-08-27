/*
  Warnings:

  - A unique constraint covering the columns `[carteira]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."OnChainDeposit" ADD COLUMN     "userId" INTEGER;

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "carteira" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_carteira_key" ON "public"."User"("carteira");

-- AddForeignKey
ALTER TABLE "public"."OnChainDeposit" ADD CONSTRAINT "OnChainDeposit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
