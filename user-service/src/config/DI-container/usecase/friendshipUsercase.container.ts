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
