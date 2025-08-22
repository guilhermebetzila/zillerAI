/*
  Warnings:

  - You are about to drop the column `carteira` on the `Saque` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[endToEndId]` on the table `Saque` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "public"."Venue" AS ENUM ('ALPACA', 'OANDA', 'B3_SIM');

-- CreateEnum
CREATE TYPE "public"."SignalSide" AS ENUM ('long', 'short', 'flat');

-- CreateEnum
CREATE TYPE "public"."Side" AS ENUM ('buy', 'sell');

-- CreateEnum
CREATE TYPE "public"."OrderType" AS ENUM ('market', 'limit', 'stop', 'stop_limit');

-- CreateEnum
CREATE TYPE "public"."OrderStatus" AS ENUM ('new', 'accepted', 'partially_filled', 'filled', 'canceled', 'rejected');

-- AlterTable
ALTER TABLE "public"."Saque" DROP COLUMN "carteira",
ADD COLUMN     "chavePix" TEXT,
ADD COLUMN     "descricao" TEXT,
ADD COLUMN     "endToEndId" TEXT,
ADD COLUMN     "tipo" TEXT NOT NULL DEFAULT 'pix';

-- CreateTable
CREATE TABLE "public"."WithdrawalRequest" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "pixKey" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "idEnvio" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WithdrawalRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."instruments" (
    "id" SERIAL NOT NULL,
    "symbol" TEXT NOT NULL,
    "venue" "public"."Venue" NOT NULL,
    "tickSize" DECIMAL(65,30) NOT NULL DEFAULT 0.01,

    CONSTRAINT "instruments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."signals" (
    "id" SERIAL NOT NULL,
    "instrumentId" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "timeframe" TEXT NOT NULL,
    "side" "public"."SignalSide" NOT NULL,
    "confidence" DOUBLE PRECISION,
    "extras" JSONB,

    CONSTRAINT "signals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."orders" (
    "id" SERIAL NOT NULL,
    "instrumentId" INTEGER NOT NULL,
    "broker" TEXT NOT NULL,
    "brokerOrderId" TEXT,
    "side" "public"."Side" NOT NULL,
    "qty" DECIMAL(65,30) NOT NULL,
    "type" "public"."OrderType" NOT NULL,
    "limitPrice" DECIMAL(65,30),
    "status" "public"."OrderStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."fills" (
    "id" SERIAL NOT NULL,
    "orderId" INTEGER NOT NULL,
    "price" DECIMAL(65,30) NOT NULL,
    "qty" DECIMAL(65,30) NOT NULL,
    "fee" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "tax" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "filledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."positions" (
    "id" SERIAL NOT NULL,
    "instrumentId" INTEGER NOT NULL,
    "qty" DECIMAL(65,30) NOT NULL,
    "avgPrice" DECIMAL(65,30) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "positions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."trades" (
    "id" SERIAL NOT NULL,
    "instrumentId" INTEGER NOT NULL,
    "entryTime" TIMESTAMP(3) NOT NULL,
    "exitTime" TIMESTAMP(3),
    "entryPrice" DECIMAL(65,30) NOT NULL,
    "exitPrice" DECIMAL(65,30),
    "qty" DECIMAL(65,30) NOT NULL,
    "grossPnl" DECIMAL(65,30),
    "netPnl" DECIMAL(65,30),
    "costs" DECIMAL(65,30) DEFAULT 0,

    CONSTRAINT "trades_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "instruments_symbol_venue_key" ON "public"."instruments"("symbol", "venue");

-- CreateIndex
CREATE INDEX "signals_instrumentId_timestamp_idx" ON "public"."signals"("instrumentId", "timestamp");

-- CreateIndex
CREATE INDEX "orders_instrumentId_createdAt_idx" ON "public"."orders"("instrumentId", "createdAt");

-- CreateIndex
CREATE INDEX "fills_orderId_filledAt_idx" ON "public"."fills"("orderId", "filledAt");

-- CreateIndex
CREATE UNIQUE INDEX "positions_instrumentId_key" ON "public"."positions"("instrumentId");

-- CreateIndex
CREATE INDEX "trades_instrumentId_entryTime_idx" ON "public"."trades"("instrumentId", "entryTime");

-- CreateIndex
CREATE UNIQUE INDEX "Saque_endToEndId_key" ON "public"."Saque"("endToEndId");

-- AddForeignKey
ALTER TABLE "public"."WithdrawalRequest" ADD CONSTRAINT "WithdrawalRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."signals" ADD CONSTRAINT "signals_instrumentId_fkey" FOREIGN KEY ("instrumentId") REFERENCES "public"."instruments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."orders" ADD CONSTRAINT "orders_instrumentId_fkey" FOREIGN KEY ("instrumentId") REFERENCES "public"."instruments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."fills" ADD CONSTRAINT "fills_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "public"."orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."positions" ADD CONSTRAINT "positions_instrumentId_fkey" FOREIGN KEY ("instrumentId") REFERENCES "public"."instruments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."trades" ADD CONSTRAINT "trades_instrumentId_fkey" FOREIGN KEY ("instrumentId") REFERENCES "public"."instruments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
