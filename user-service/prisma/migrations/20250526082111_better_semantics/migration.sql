/*
  Warnings:

  - You are about to drop the column `recipientId` on the `FriendShip` table. All the data in the column will be lost.
  - Added the required column `receiverId` to the `FriendShip` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "FriendShip" DROP CONSTRAINT "FriendShip_recipientId_fkey";

-- AlterTable
ALTER TABLE "FriendShip" DROP COLUMN "recipientId",
ADD COLUMN     "receiverId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "FriendShip" ADD CONSTRAINT "FriendShip_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
