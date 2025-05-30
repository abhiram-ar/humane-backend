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
CREATE INDEX "OutBox_createdAt_idx" ON "OutBox"("createdAt");
