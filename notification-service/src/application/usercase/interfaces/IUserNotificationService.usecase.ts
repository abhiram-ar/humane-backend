import {
   GetRecentUserNoficationInputDTO,
   GetRecentUserNotificationOutputDTO,
} from '@application/dtos/GetRecentUserNotification.dto';

export interface IUserNotificationService {
   getRecentUserNotification(
      dto: GetRecentUserNoficationInputDTO
   ): Promise<GetRecentUserNotificationOutputDTO>;
}
