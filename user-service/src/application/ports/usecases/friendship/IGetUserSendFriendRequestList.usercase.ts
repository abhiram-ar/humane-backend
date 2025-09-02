import { UserListInfinityScollParams } from '@application/types/UserListInfinityScrollParams.type';
import {
   FriendRequestList,
   GetFriendRequestListInputDTO,
} from '@application/DTO-mapper/friendship/GetFriendRequests.dto';

export interface IGetUserSendFriendRequestList {
   execute(dto: GetFriendRequestListInputDTO): Promise<{
      friendReqs: FriendRequestList;
      from: UserListInfinityScollParams;
   }>;
}
