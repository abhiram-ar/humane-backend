-- DropIndex
DROP INDEX "FriendShip_id_idx";

-- CreateIndex
CREATE INDEX "FriendShip_createdAt_id_idx" ON "FriendShip"("createdAt", "id");
