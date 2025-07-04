/*
  Warnings:

  - You are about to drop the `HumaneScore` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Rewards` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "HumaneScore" DROP CONSTRAINT "HumaneScore_userId_fkey";

-- DropForeignKey
ALTER TABLE "Rewards" DROP CONSTRAINT "Rewards_actorId_fkey";

-- DropTable
DROP TABLE "HumaneScore";

-- DropTable
DROP TABLE "Rewards";
