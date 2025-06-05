import {
   GetRecentUserNoficationInputDTO,
   GetRecentUserNotificationOutputDTO,
} from '@application/dtos/GetRecentUserNotification.dto';
import { INotificationRepository } from '@domain/interfaces/repository/INotificationRepository';
import { IUserNotificationService } from './interfaces/IUserNotificationService.usecase';
import { MarkNotificationAsReadInputDTO } from '@application/dtos/MarkNotificationAsReadFrom.dto';

export class UserNotificationService implements IUserNotificationService {
   constructor(private readonly _notifiactionRepo: INotificationRepository) {}

   getRecentUserNotification = async (
      dto: GetRecentUserNoficationInputDTO
   ): Promise<GetRecentUserNotificationOutputDTO> => {
      const result = await this._notifiactionRepo.retriveRecentUserNotifications(
         dto.userId,
         dto.limit,
         dto.from
      );

      return { noti: result.noti, pagination: { from: result.from, hasmore: result.hasmore } };
   };

   markNotificaionAsReadFrom = async (dto: MarkNotificationAsReadInputDTO): Promise<void> => {
      await this._notifiactionRepo.markAsRead(dto.userId, dto.fromId);
   };
}
