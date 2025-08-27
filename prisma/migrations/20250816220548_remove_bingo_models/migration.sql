/*
  Warnings:

  - You are about to alter the column `valor` on the `Deposito` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to alter the column `valor` on the `Investimento` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to alter the column `percentualDiario` on the `Investimento` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to alter the column `rendimentoAcumulado` on the `Investimento` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to alter the column `limite` on the `Investimento` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to alter the column `amount` on the `OnChainDeposit` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to alter the column `base` on the `RendimentoDiario` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to alter the column `rate` on the `RendimentoDiario` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to alter the column `amount` on the `RendimentoDiario` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to alter the column `saldo` on the `User` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to alter the column `valorInvestido` on the `User` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to drop the `Bola` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Cartela` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `NumeroCartela` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Partida` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Bola" DROP CONSTRAINT "Bola_partidaId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Cartela" DROP CONSTRAINT "Cartela_partidaId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Cartela" DROP CONSTRAINT "Cartela_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."NumeroCartela" DROP CONSTRAINT "NumeroCartela_cartelaId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Partida" DROP CONSTRAINT "Partida_vencedoraId_fkey";

-- AlterTable
ALTER TABLE "public"."Deposito" ALTER COLUMN "valor" SET DATA TYPE DECIMAL(65,30);

-- AlterTable
ALTER TABLE "public"."Investimento" ALTER COLUMN "valor" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "percentualDiario" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "rendimentoAcumulado" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "limite" SET DATA TYPE DECIMAL(65,30);

-- AlterTable
ALTER TABLE "public"."OnChainDeposit" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(65,30);

-- AlterTable
ALTER TABLE "public"."RendimentoDiario" ALTER COLUMN "base" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "rate" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "amount" SET DATA TYPE DECIMAL(65,30);

-- AlterTable
ALTER TABLE "public"."User" ALTER COLUMN "saldo" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "valorInvestido" SET DATA TYPE DECIMAL(65,30);

-- DropTable
DROP TABLE "public"."Bola";

-- DropTable
DROP TABLE "public"."Cartela";

-- DropTable
DROP TABLE "public"."NumeroCartela";

-- DropTable
DROP TABLE "public"."Partida";
