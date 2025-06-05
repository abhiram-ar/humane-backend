import { FriendReqNotificationInputDTO } from '@application/dtos/FriendReqNotification.dto';
import { FriendReqNotification } from '@domain/entities/FriendReqNotification.entity';

export interface IFriendReqNotificationService {
   create(dto: FriendReqNotificationInputDTO): Promise<Required<FriendReqNotification>>;
   delete(dto: FriendReqNotificationInputDTO): Promise<Required<FriendReqNotification> | null>;
   updateFriendReqStatus(
      dto: FriendReqNotificationInputDTO
   ): Promise<Required<FriendReqNotification>>;
}
