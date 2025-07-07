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
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Rewards_pkey" PRIMARY KEY ("idempotencyKey")
);

-- CreateTable
CREATE TABLE "OutBox" (
    "id" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "retryAfter" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OutBox_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Rewards_actorId_idempotencyKey_idx" ON "Rewards"("actorId", "idempotencyKey");

-- CreateIndex
CREATE INDEX "OutBox_createdAt_idx" ON "OutBox"("createdAt");

-- AddForeignKey
ALTER TABLE "Rewards" ADD CONSTRAINT "Rewards_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "HumaneScore"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;
