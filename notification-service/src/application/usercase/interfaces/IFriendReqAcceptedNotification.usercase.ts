import { FriendReqNotificationInputDTO } from '@application/dtos/FriendReqNotification.dto';
import { FriendReqAcceptedNotification } from '@domain/entities/FriendReqAcceptedNotification.entity';

export interface IFriendReqAcceptedNotificationService {
   create: ({
      friendship,
   }: FriendReqNotificationInputDTO) => Promise<Required<FriendReqAcceptedNotification>>;

   delete(
      dto: FriendReqNotificationInputDTO
   ): Promise<Required<FriendReqAcceptedNotification> | null>;
}
