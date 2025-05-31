import {
   CombinedNotification,
   CombinedNotificationType,
} from '@domain/entities/CombinedNotification';

export interface INotificationRepository {
   upsert<T extends CombinedNotificationType>(
      notification: Omit<CombinedNotification, 'id'>
   ): Promise<Extract<CombinedNotification, { type: T }>>;
   getUserNotifications(reciverId: string): Promise<CombinedNotification[] | null>;

   save(notication: CombinedNotification): Promise<CombinedNotification>;
}
