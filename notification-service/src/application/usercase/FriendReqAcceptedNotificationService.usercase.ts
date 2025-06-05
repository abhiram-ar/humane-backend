import { FriendReqNotificationInputDTO } from '@application/dtos/FriendReqNotification.dto';
import { logger } from '@config/logger';
import { INotificationRepository } from '@domain/interfaces/repository/INotificationRepository';
import { FriendReqAcceptedNotification } from '@domain/entities/FriendReqAcceptedNotification.entity';
import { FriendReqAcceptedNotificationError } from '@application/Errors/FriendReqAcceptedNotificaionError';

export class FriendReqAcceptedNotificationService {
   constructor(private readonly _notificationRepo: INotificationRepository) {}

   create = async ({
      friendship,
   }: FriendReqNotificationInputDTO): Promise<Required<FriendReqAcceptedNotification>> => {
      if (friendship.status !== 'ACCEPTED') {
         throw new FriendReqAcceptedNotificationError(
            'Cannot create a accepted friendReq noificaition for unaccepted friend request'
         );
      }

      // we dont what a old event overriding the existing doc in case of retry
      const existingFriendReqAcceptedNotificaion =
         await this._notificationRepo.retriveFriendReqAcceptedNoti(friendship.id);
      if (existingFriendReqAcceptedNotificaion) {
         throw new FriendReqAcceptedNotificationError('Request(id) exists, cannot add duplicate entry');
      }

      // create a frindreqNotificaion
      const newFriendReqAcceptedNotication = new FriendReqAcceptedNotification(
         friendship.requesterId,
         friendship.receiverId,
         friendship.id,
         { reqStatus: friendship.status }
      );

      let result = await this._notificationRepo.createFriendReqAcceptedNoti(
         newFriendReqAcceptedNotication
      );
      return result;
   };

   delete = async ({
      friendship,
   }: FriendReqNotificationInputDTO): Promise<Required<FriendReqAcceptedNotification> | null> => {
      const deltedFriendReqAcceptedNoti = await this._notificationRepo.deleteFriendReqAcceptedNoti(
         friendship.id
      );
      if (!deltedFriendReqAcceptedNoti) {
         logger.warn(
            `cannot delete non-existing friendreq notification, friendshipId:${friendship.id}`
         );
         return null;
      }
      return deltedFriendReqAcceptedNoti;
   };
}
