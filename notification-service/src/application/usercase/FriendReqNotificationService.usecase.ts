import { FriendReqNotificationInputDTO } from '@application/dtos/FriendReqNotification.dto';
import { FriendReqNotificationError } from '@application/Errors/FriendReqNotificaionError';
import { logger } from '@config/logger';
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
      // TODO: if the user is online write to therir socket/let consumer do it
   };

   delete = async ({ friendship }: FriendReqNotificationInputDTO) => {
      const deltedFriendReq = await this._notificationRepo.delete(friendship.id);
      if (!deltedFriendReq) {
         logger.warn(
            `cannot delete non-existing friendreq notification, friendshipId:${friendship.id}`
         );
      }
      logger.info(`friendReq nofiticaion deleted, friendreqId:${friendship.id}`);

      //TODO: websockets
   };

   updateFriendReqStatus = async (dto: FriendReqNotificationInputDTO) => {
      const existingFriendReqNotification = await this._notificationRepo.retriveFriendReq(
         dto.friendship.id
      );

      if (!existingFriendReqNotification) {
         throw new FriendReqNotificationError(
            'Cannot update status of non-existant frindReq notifcation'
         );
      }

      if (existingFriendReqNotification.updatedAt > dto.eventCreatedAt) {
         throw new FriendReqNotificationError('Cannt update friendReqNoticaltion with old data');
      }

      existingFriendReqNotification.status = dto.friendship.status;

      const updatedFriendReqNoti = await this._notificationRepo.updateFriendReqStatus(
         existingFriendReqNotification.friendshipId,
         existingFriendReqNotification.status
      );

      if (!updatedFriendReqNoti) {
         throw new Error('Cannot update a exisitng friendReq noti');
      }

      // websocket
      return updatedFriendReqNoti;
   };
}
