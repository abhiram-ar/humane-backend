import { BasicUserDetails } from '@application/Types/BasicUserDetails';
import { CombinedNotification } from '@domain/entities/CombinedNotification';

export type CombinedNotificationWithActionableUser = CombinedNotification & {
   actionableUser?: BasicUserDetails;
};
