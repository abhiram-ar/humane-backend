import { FriendshipError } from '@application/errors/FriendshipError';
import { GenericError } from '@application/errors/GenericError';
import { RelationshipStatus } from '@application/types/RelationshipStatus';
import { Friendship } from '@domain/entities/friendship.entity';
import { RemoveFriendshipInputDTO } from '@dtos/friendship/RemoveFriendshipInput.dto';
import { IFriendshipRepository } from '@ports/IFriendshipRepository';

export class RemoveFriendship {
   constructor(private readonly _friendshipRepo: IFriendshipRepository) {}

   execute = async (
      dto: RemoveFriendshipInputDTO
   ): Promise<{ targetUserId: string; status: RelationshipStatus }> => {
      const friendShip = await this._friendshipRepo.retriveFriendship(
         ...Friendship.sortUserId(dto.currenUserId, dto.targetUserId)
      );

      if (!friendShip) {
         throw new FriendshipError('friendship does not exist to remove');
      }

      const res = await this._friendshipRepo.deleteFriendship(friendShip);
      if (!res) {
         throw new GenericError('Unable to cancel friend requset');
      }

      // TODO:emit cancelled event

      return { targetUserId: dto.targetUserId, status: 'strangers' };
   };
}
