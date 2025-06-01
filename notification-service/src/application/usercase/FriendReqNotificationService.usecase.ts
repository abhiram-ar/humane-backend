import { FriendReqNotificationInputDTO } from '@application/dtos/FriendReqNotification.dto';
import { FriendReqNotificationError } from '@application/Errors/FriendReqNotificaionError';
import { FriendReqNotification } from '@domain/entities/FriendReqNotification.entity';
import { INotificationRepository } from '@domain/interfaces/repository/INotificationRepository';

export class FriendReqNotificationService {
   constructor(private readonly _notificationRepo: INotificationRepository) {}

   create = async ({ friendship }: FriendReqNotificationInputDTO) => {
      // we dont what a old event overriding the existing doc in case of retry
      const existingFriendReqNotificaion = await this._notificationRepo.retriveFriendReq(
         friendship.id
      );
      if (existingFriendReqNotificaion) {
         throw new FriendReqNotificationError('Request(id) exists, cannot add duplicate entry');
      }
      // create a frindreqNotificaion
      const newFriendReqNotication = new FriendReqNotification(
         friendship.id,
         friendship.receiverId,
         friendship.requesterId,
         friendship.createdAt,
         friendship.status
      );

      await this._notificationRepo.create(newFriendReqNotication);
      // if the user is online write to therir socket/let consumer do it
   };
}
