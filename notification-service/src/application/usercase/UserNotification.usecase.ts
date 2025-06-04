import {
   GetRecentUserNoficationInputDTO,
   GetRecentUserNotificationOutputDTO,
} from '@application/dtos/GetRecentUserNotification.dto';
import { INotificationRepository } from '@domain/interfaces/repository/INotificationRepository';

export class UserNotificationService {
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
}
