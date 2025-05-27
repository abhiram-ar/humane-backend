/*
  Warnings:

  - The required column `id` was added to the `FriendShip` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE "FriendShip" ADD COLUMN     "id" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "FriendShip_id_idx" ON "FriendShip"("id");
