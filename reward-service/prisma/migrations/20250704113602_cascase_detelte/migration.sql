-- CreateEnum
CREATE TYPE "RewardType" AS ENUM ('HELPFUL_COMMENT', 'CHAT_DAILY_CHECKIN');

-- DropForeignKey
ALTER TABLE "Rewards" DROP CONSTRAINT "Rewards_actorId_fkey";

-- AddForeignKey
ALTER TABLE "Rewards" ADD CONSTRAINT "Rewards_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "HumaneScore"("userId") ON DELETE CASCADE ON UPDATE CASCADE;
