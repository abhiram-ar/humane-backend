import { CombinedNotification } from '@domain/entities/CombinedNotification';
import { BasicUserDetails } from '@presentation/event/Types/GetUserBasicDetails Response';

export type CombinedNotificationWithActionableUser = CombinedNotification & {
   actionableUser?: BasicUserDetails;
};
