-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "graduacaoId" INTEGER;

-- AddForeignKey
ALTER TABLE "public"."User" ADD CONSTRAINT "User_graduacaoId_fkey" FOREIGN KEY ("graduacaoId") REFERENCES "public"."Graduacao"("id") ON DELETE SET NULL ON UPDATE CASCADE;
