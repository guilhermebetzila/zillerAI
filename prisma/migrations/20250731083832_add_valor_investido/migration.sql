-- CreateTable
CREATE TABLE "public"."User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "saldo" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "valorInvestido" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "indicador" TEXT,
    "indicadoPorId" INTEGER,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Partida" (
    "id" SERIAL NOT NULL,
    "inicio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fim" TIMESTAMP(3),
    "finalizada" BOOLEAN NOT NULL DEFAULT false,
    "aberta" BOOLEAN NOT NULL DEFAULT true,
    "encerrada" BOOLEAN NOT NULL DEFAULT false,
    "vencedoraId" INTEGER,

    CONSTRAINT "Partida_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Cartela" (
    "id" SERIAL NOT NULL,
    "criadaEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "venceu" BOOLEAN NOT NULL DEFAULT false,
    "userId" INTEGER,
    "partidaId" INTEGER NOT NULL,

    CONSTRAINT "Cartela_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."NumeroCartela" (
    "id" SERIAL NOT NULL,
    "numero" INTEGER NOT NULL,
    "cartelaId" INTEGER NOT NULL,

    CONSTRAINT "NumeroCartela_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Bola" (
    "id" SERIAL NOT NULL,
    "numero" INTEGER NOT NULL,
    "ordem" INTEGER NOT NULL,
    "partidaId" INTEGER NOT NULL,

    CONSTRAINT "Bola_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Partida_vencedoraId_key" ON "public"."Partida"("vencedoraId");

-- AddForeignKey
ALTER TABLE "public"."User" ADD CONSTRAINT "User_indicadoPorId_fkey" FOREIGN KEY ("indicadoPorId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Partida" ADD CONSTRAINT "Partida_vencedoraId_fkey" FOREIGN KEY ("vencedoraId") REFERENCES "public"."Cartela"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Cartela" ADD CONSTRAINT "Cartela_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Cartela" ADD CONSTRAINT "Cartela_partidaId_fkey" FOREIGN KEY ("partidaId") REFERENCES "public"."Partida"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."NumeroCartela" ADD CONSTRAINT "NumeroCartela_cartelaId_fkey" FOREIGN KEY ("cartelaId") REFERENCES "public"."Cartela"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Bola" ADD CONSTRAINT "Bola_partidaId_fkey" FOREIGN KEY ("partidaId") REFERENCES "public"."Partida"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
