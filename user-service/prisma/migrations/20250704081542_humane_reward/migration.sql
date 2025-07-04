-- CreateTable
CREATE TABLE "HumaneScore" (
    "userId" TEXT NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "HumaneScore_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "Rewards" (
    "actorId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "idempotencyKey" TEXT NOT NULL,
    "pointsRewarded" INTEGER NOT NULL,

    CONSTRAINT "Rewards_pkey" PRIMARY KEY ("idempotencyKey")
);

-- AddForeignKey
ALTER TABLE "HumaneScore" ADD CONSTRAINT "HumaneScore_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rewards" ADD CONSTRAINT "Rewards_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
