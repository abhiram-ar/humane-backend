import { RelationshipStatus } from '@application/types/RelationshipStatus';
import { AcceptFriendshipInputDTO } from '@application/DTO-mapper/friendship/AcceptFriendRequset.dto';
import { cancelFriendRequestInputDTO } from '@application/DTO-mapper/friendship/cancelFriendRequestInput.dto';
import { RemoveFriendshipInputDTO } from '@application/DTO-mapper/friendship/RemoveFriendshipInput.dto';
import { SendFriendRequestInputDTO } from '@application/DTO-mapper/friendship/SendFriendRequestInput.dto';

export interface IFriendRequest {
   send(
      dto: SendFriendRequestInputDTO
   ): Promise<{ receiverId: string; status: RelationshipStatus }>;
   accept(
      dto: AcceptFriendshipInputDTO
   ): Promise<{ requesterId: string; status: RelationshipStatus }>;
   cancel(
      dto: cancelFriendRequestInputDTO
   ): Promise<{ receiverId: string; status: RelationshipStatus }>;
   decline(
      dto: RemoveFriendshipInputDTO
   ): Promise<{ targetUserId: string; status: RelationshipStatus }>;
}
