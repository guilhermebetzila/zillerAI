-- CreateTable
CREATE TABLE "public"."OnChainDeposit" (
    "id" SERIAL NOT NULL,
    "txHash" TEXT NOT NULL,
    "from" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OnChainDeposit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OnChainDeposit_txHash_key" ON "public"."OnChainDeposit"("txHash");
