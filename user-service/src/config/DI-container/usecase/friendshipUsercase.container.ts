import { GetFriendList } from '@application/useCases/friendship/GetFriendList.usercase';
import { GetFriendRequestList } from '@application/useCases/friendship/GetFriendRequestList.usercase';
import { FriendRequest } from '@application/useCases/friendship/FriendRequest.usecase';
import {
   blockedRelationshipRepository,
   friendshipRepository,
   userRepository,
} from '@di/repository.container';
import { awsStorageService } from '@di/services.container';
import { GetRelationShipStatus } from '@application/useCases/friendship/GetRelationshipStatus';
import { MutualFriends } from '@application/useCases/friendship/MutualFriends';

export const sendFriendRequest = new FriendRequest(
   friendshipRepository,
   blockedRelationshipRepository,
   userRepository
);

export const getFriendRequestList = new GetFriendRequestList(
   friendshipRepository,
   awsStorageService
);

export const getFriendList = new GetFriendList(friendshipRepository, awsStorageService);

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
