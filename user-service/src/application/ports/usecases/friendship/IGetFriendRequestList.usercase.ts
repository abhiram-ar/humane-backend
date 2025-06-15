import { UserListInfinityScollParams } from '@application/types/UserListInfinityScrollParams.type';
import {
   FriendRequestList,
   GetFriendRequestCountInputDTO,
   GetFriendRequestListInputDTO,
} from '@dtos/friendship/GetFriendRequests.dto';

export interface IGetFriendRequest {
   list(dto: GetFriendRequestListInputDTO): Promise<{
      friendReqs: FriendRequestList;
      from: UserListInfinityScollParams;
   }>;
   count(dto: GetFriendRequestCountInputDTO): Promise<number>;
}
