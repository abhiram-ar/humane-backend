-- AlterTable
ALTER TABLE "BlockedUser" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- custom valiataion - override
-- Add user order constraint
ALTER TABLE "FriendShip" ADD CONSTRAINT "user_order" CHECK ("user1Id" < "user2Id");

-- Add requester/recipient validation
ALTER TABLE "FriendShip" ADD CONSTRAINT "valid_requester_recipient" CHECK (
    ("requesterId" = "user1Id" AND "recipientId" = "user2Id") OR
    ("requesterId" = "user2Id" AND "recipientId" = "user1Id")
);
