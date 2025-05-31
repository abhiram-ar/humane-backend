import {
   CombinedNotificationType,
   CombinedNotification,
} from '@domain/entities/CombinedNotification';
import { INotificationRepository } from '@domain/interfaces/repository/INotificationRepository';

export class MongoNotificationRepository implements INotificationRepository {
   constructor() {}
   upsert<T extends CombinedNotificationType>(
      notification: Omit<CombinedNotification, 'id'>
   ): Promise<Extract<CombinedNotification, { type: T }>> {
      throw new Error('Method not implemented.');
   }
   getUserNotifications(reciverId: string): Promise<CombinedNotification[] | null> {
      throw new Error('Method not implemented.');
   }
   save(notication: CombinedNotification): Promise<CombinedNotification> {
      throw new Error('Method not implemented.');
   }
}
