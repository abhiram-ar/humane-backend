/*
  Warnings:

  - The values [CHAT_DAILY_CHECKIN] on the enum `RewardType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "RewardType_new" AS ENUM ('HELPFUL_COMMENT', 'CHAT_CHECKIN');
ALTER TABLE "Rewards" ALTER COLUMN "type" TYPE "RewardType_new" USING ("type"::text::"RewardType_new");
ALTER TYPE "RewardType" RENAME TO "RewardType_old";
ALTER TYPE "RewardType_new" RENAME TO "RewardType";
DROP TYPE "RewardType_old";
COMMIT;
