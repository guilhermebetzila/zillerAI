/*
  Warnings:

  - You are about to drop the `fills` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `instruments` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `orders` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `positions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `signals` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `trades` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."fills" DROP CONSTRAINT "fills_orderId_fkey";

-- DropForeignKey
ALTER TABLE "public"."orders" DROP CONSTRAINT "orders_instrumentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."positions" DROP CONSTRAINT "positions_instrumentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."signals" DROP CONSTRAINT "signals_instrumentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."trades" DROP CONSTRAINT "trades_instrumentId_fkey";

-- DropIndex
DROP INDEX "public"."RendimentoDiario_userId_investimentoId_dateKey_idx";

-- DropTable
DROP TABLE "public"."fills";

-- DropTable
DROP TABLE "public"."instruments";

-- DropTable
DROP TABLE "public"."orders";

-- DropTable
DROP TABLE "public"."positions";

-- DropTable
DROP TABLE "public"."signals";

-- DropTable
DROP TABLE "public"."trades";
