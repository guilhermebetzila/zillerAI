-- AlterTable
ALTER TABLE "public"."OnChainDeposit" ADD COLUMN     "status" "public"."StatusDeposito" NOT NULL DEFAULT 'pendente';
