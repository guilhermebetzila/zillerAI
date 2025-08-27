-- AlterTable
ALTER TABLE "public"."Investimento" ADD COLUMN     "percentualDiario" DOUBLE PRECISION NOT NULL DEFAULT 0.025,
ADD COLUMN     "rendimentoAcumulado" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "public"."RendimentoDiario" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "dateKey" TEXT NOT NULL,
    "base" DOUBLE PRECISION NOT NULL,
    "rate" DOUBLE PRECISION NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "creditedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RendimentoDiario_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RendimentoDiario_userId_dateKey_idx" ON "public"."RendimentoDiario"("userId", "dateKey");

-- CreateIndex
CREATE UNIQUE INDEX "RendimentoDiario_userId_dateKey_key" ON "public"."RendimentoDiario"("userId", "dateKey");

-- AddForeignKey
ALTER TABLE "public"."RendimentoDiario" ADD CONSTRAINT "RendimentoDiario_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
