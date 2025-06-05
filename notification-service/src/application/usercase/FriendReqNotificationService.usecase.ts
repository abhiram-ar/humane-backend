import { FriendReqNotificationInputDTO } from '@application/dtos/FriendReqNotification.dto';
import { FriendReqNotificationError } from '@application/Errors/FriendReqNotificaionError';
import { logger } from '@config/logger';
import { FriendReqNotification } from '@domain/entities/FriendReqNotification.entity';
import { INotificationRepository } from '@domain/interfaces/repository/INotificationRepository';
import { IFriendReqNotificationService } from './interfaces/IFriendReqNotificationService.usercase';

export class FriendReqNotificationService implements IFriendReqNotificationService {
   constructor(private readonly _notificationRepo: INotificationRepository) {}

   create = async ({
      friendship,
   }: FriendReqNotificationInputDTO): Promise<Required<FriendReqNotification>> => {
      // we dont what a old event overriding the existing doc in case of retry
      const existingFriendReqNotificaion = await this._notificationRepo.retriveFriendReq(
         friendship.id
      );
      if (existingFriendReqNotificaion) {
         throw new FriendReqNotificationError('Request(id) exists, cannot add duplicate entry');
      }
      // create a frindreqNotificaion
      const newFriendReqNotication = new FriendReqNotification(
         friendship.receiverId,
         friendship.requesterId,
         friendship.id,
         { reqStatus: friendship.status }
      );

      let result = await this._notificationRepo.create(newFriendReqNotication);
      return result;
   };

   delete = async ({
      friendship,
   }: FriendReqNotificationInputDTO): Promise<Required<FriendReqNotification> | null> => {
      const deltedFriendReq = await this._notificationRepo.delete(friendship.id);
      if (!deltedFriendReq) {
         logger.warn(
            `cannot delete non-existing friendreq notification, friendshipId:${friendship.id}`
         );
         return null;
      }
      return deltedFriendReq;
   };

   updateFriendReqStatus = async (
      dto: FriendReqNotificationInputDTO
   ): Promise<Required<FriendReqNotification>> => {
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

      existingFriendReqNotification.metadata.reqStatus = dto.friendship.status;

      const updatedFriendReqNoti = await this._notificationRepo.updateFriendReqStatus(
         existingFriendReqNotification.entityId,
         existingFriendReqNotification.metadata.reqStatus
      );

      if (!updatedFriendReqNoti) {
         throw new Error('Cannot update a exisitng friendReq noti');
      }

      // websocket
      return updatedFriendReqNoti;
   };
}
