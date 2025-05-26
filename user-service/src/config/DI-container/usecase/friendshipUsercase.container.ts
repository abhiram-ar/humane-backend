import { GetFriendRequestList } from '@application/useCases/friendship/GetFriendRequestList.usercase';
import { SendFriendRequest } from '@application/useCases/friendship/SendFriendRequest.usecase';
import {
   blockedRelationshipRepository,
   friendshipRepository,
   userRepository,
} from '@di/repository.container';

export const sendFriendRequest = new SendFriendRequest(
   friendshipRepository,
   blockedRelationshipRepository,
   userRepository
);

export const getFriendRequestList = new GetFriendRequestList(friendshipRepository);
