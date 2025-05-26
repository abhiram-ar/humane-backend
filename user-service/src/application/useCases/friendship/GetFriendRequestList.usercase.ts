import { UserListInfinityScollParams } from '@application/types/UserListInfinityScrollParams.type';
import { User } from '@domain/entities/user.entity';
import { GetFriendRequestListInputDTO } from '@dtos/friendship/GetFriendRequests.dto';
import { IFriendshipRepository } from '@ports/IFriendshipRepository';

export class GetFriendRequestList {
   constructor(private readonly _friendshipRepo: IFriendshipRepository) {}

   execute = async (
      dto: GetFriendRequestListInputDTO
   ): Promise<{
      friendReqs: (Pick<User, 'id' | 'firstName' | 'lastName' | 'avatar'> & {
         createdAt: string;
      })[];
      from: UserListInfinityScollParams;
   }> => {
      return await this._friendshipRepo.getUserFriendRequestList(dto.userId, dto.from, dto.size);
   };
}
