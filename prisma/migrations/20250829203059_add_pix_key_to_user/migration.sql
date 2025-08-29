/*
  Warnings:

  - A unique constraint covering the columns `[pixKey]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "pixKey" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_pixKey_key" ON "public"."User"("pixKey");
