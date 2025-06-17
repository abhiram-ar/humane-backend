import { RelationshipStatus } from '@application/types/RelationshipStatus';
import { AcceptFriendshipInputDTO } from '@dtos/friendship/AcceptFriendRequset.dto';
import { cancelFriendRequestInputDTO } from '@dtos/friendship/cancelFriendRequestInput.dto';
import { RemoveFriendshipInputDTO } from '@dtos/friendship/RemoveFriendshipInput.dto';
import { SendFriendRequestInputDTO } from '@dtos/friendship/SendFriendRequestInput.dto';

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
