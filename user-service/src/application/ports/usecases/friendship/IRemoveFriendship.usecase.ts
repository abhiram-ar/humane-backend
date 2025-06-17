import { RelationshipStatus } from '@application/types/RelationshipStatus';
import { RemoveFriendshipInputDTO } from '@dtos/friendship/RemoveFriendshipInput.dto';

export interface IRemoveFriendship {
   execute(
      dto: RemoveFriendshipInputDTO
   ): Promise<{ targetUserId: string; status: RelationshipStatus }>;
}
