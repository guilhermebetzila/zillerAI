-- CreateTable
CREATE TABLE "public"."Deposito" (
    "id" SERIAL NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Deposito_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Deposito" ADD CONSTRAINT "Deposito_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
