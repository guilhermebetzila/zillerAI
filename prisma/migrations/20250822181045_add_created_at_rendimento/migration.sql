/*
  Warnings:

  - You are about to drop the column `creditedAt` on the `RendimentoDiario` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."RendimentoDiario" DROP COLUMN "creditedAt",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
