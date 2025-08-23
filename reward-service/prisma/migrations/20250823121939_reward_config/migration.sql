-- CreateTable
CREATE TABLE "RewardConfig" (
    "type" "RewardType" NOT NULL,
    "amount" INTEGER NOT NULL,

    CONSTRAINT "RewardConfig_pkey" PRIMARY KEY ("type")
);
