-- CreateTable
CREATE TABLE "public"."Graduacao" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "pontos" INTEGER NOT NULL,

    CONSTRAINT "Graduacao_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Graduacao_pontos_key" ON "public"."Graduacao"("pontos");
