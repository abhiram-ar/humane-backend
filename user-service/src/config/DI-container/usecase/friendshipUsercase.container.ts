import { AcceptFriendRequest } from '@application/useCases/friendship/AcceptFriendRequest.usercase';
import { GetFriendRequestList } from '@application/useCases/friendship/GetFriendRequestList.usercase';
import { SendFriendRequest } from '@application/useCases/friendship/SendFriendRequest.usecase';
import {
   blockedRelationshipRepository,
   friendshipRepository,
   userRepository,
} from '@di/repository.container';
import { awsStorageService } from '@di/services.container';

export const sendFriendRequest = new SendFriendRequest(
   friendshipRepository,
   blockedRelationshipRepository,
   userRepository
);

export const getFriendRequestList = new GetFriendRequestList(
   friendshipRepository,
   awsStorageService
);

export const acceptFriendRequest = new AcceptFriendRequest(
   userRepository,
   blockedRelationshipRepository,
   friendshipRepository
);
