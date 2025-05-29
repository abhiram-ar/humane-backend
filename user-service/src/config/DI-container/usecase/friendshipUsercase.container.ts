import { GetFriends } from '@application/useCases/friendship/GetFriends.usercase';
import { FriendRequest } from '@application/useCases/friendship/FriendRequest.usecase';
import {
   blockedRelationshipRepository,
   friendshipRepository,
   userRepository,
} from '@di/repository.container';
import { awsStorageService } from '@di/services.container';
import { GetRelationShipStatus } from '@application/useCases/friendship/GetRelationshipStatus';
import { MutualFriends } from '@application/useCases/friendship/MutualFriends.usecase';
import { RemoveFriendship } from '@application/useCases/friendship/RemoveFriendship.usecase';
import { GetUserSendFriendRequestList } from '@application/useCases/friendship/GetUserSendFriendRequestList.usercase';
import { GetFriendRequest } from '@application/useCases/friendship/GetFriendRequestList.usercase';

export const sendFriendRequest = new FriendRequest(
   friendshipRepository,
   blockedRelationshipRepository,
   userRepository
);

export const getFriendRequest = new GetFriendRequest(
   friendshipRepository,
   awsStorageService
);

export const getFriends = new GetFriends(friendshipRepository, awsStorageService);

export const getRelationshipStatus = new GetRelationShipStatus(
   userRepository,
   blockedRelationshipRepository,
   friendshipRepository
);

export const mutualFriends = new MutualFriends(
   userRepository,
   friendshipRepository,
   awsStorageService
);

export const removeFriendship = new RemoveFriendship(friendshipRepository);

export const getUserSendFriendReq = new GetUserSendFriendRequestList(
   friendshipRepository,
   awsStorageService
);
