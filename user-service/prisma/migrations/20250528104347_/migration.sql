/*
  Warnings:

  - The values [DECLINED] on the enum `FriendShipStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "FriendShipStatus_new" AS ENUM ('PENDING', 'ACCEPTED');
ALTER TABLE "FriendShip" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "FriendShip" ALTER COLUMN "status" TYPE "FriendShipStatus_new" USING ("status"::text::"FriendShipStatus_new");
ALTER TYPE "FriendShipStatus" RENAME TO "FriendShipStatus_old";
ALTER TYPE "FriendShipStatus_new" RENAME TO "FriendShipStatus";
DROP TYPE "FriendShipStatus_old";
ALTER TABLE "FriendShip" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;
