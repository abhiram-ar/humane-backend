import { UserListInfinityScollParams } from '@application/types/UserListInfinityScrollParams.type';
import {
   FriendRequestList,
   GetFriendRequestCountInputDTO,
   GetFriendRequestListInputDTO,
} from '@application/DTO-mapper/friendship/GetFriendRequests.dto';

export interface IGetFriendRequest {
   list(dto: GetFriendRequestListInputDTO): Promise<{
      friendReqs: FriendRequestList;
      from: UserListInfinityScollParams;
   }>;
   count(dto: GetFriendRequestCountInputDTO): Promise<number>;
}
