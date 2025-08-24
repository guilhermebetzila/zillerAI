/*
  Warnings:

  - A unique constraint covering the columns `[userId,dateKey]` on the table `RendimentoDiario` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "RendimentoDiario_userId_dateKey_key" ON "public"."RendimentoDiario"("userId", "dateKey");
