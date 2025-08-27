-- CreateTable
CREATE TABLE "public"."Investimento" (
    "id" SERIAL NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Investimento_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Investimento" ADD CONSTRAINT "Investimento_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
