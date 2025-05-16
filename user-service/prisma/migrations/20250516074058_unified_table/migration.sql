/*
  Warnings:

  - You are about to drop the `UserScore` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "UserScore" DROP CONSTRAINT "UserScore_userId_fkey";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "humaneScore" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "passwordHash" DROP NOT NULL;

-- DropTable
DROP TABLE "UserScore";
