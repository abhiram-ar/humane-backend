import { UserListInfinityScollParams } from '@application/types/UserListInfinityScrollParams.type';
import {
   FriendRequestList,
   GetFriendRequestListInputDTO,
} from '@dtos/friendship/GetFriendRequests.dto';

export interface IGetUserSendFriendRequestList {
   execute(dto: GetFriendRequestListInputDTO): Promise<{
      friendReqs: FriendRequestList;
      from: UserListInfinityScollParams;
   }>;
}
