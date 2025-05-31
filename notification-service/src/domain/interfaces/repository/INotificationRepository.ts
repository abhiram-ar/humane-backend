import { FriendReqNotification } from '@domain/entities/FriendReqNotification.entity';

export interface INotificationRepository {
   retriveFriendReq(friendshipId: string): Promise<FriendReqNotification | null>;

   create(friendReq: FriendReqNotification): Promise<Required<FriendReqNotification>>;
}
