import { CombinedNotification } from '@domain/entities/CombinedNotification';
import { z } from 'zod';

export const getRecentUserNotification = z.object({
   userId: z.string().nonempty(),
   limit: z.number().nonnegative(),
   from: z.string().nullable().optional(),
});

export type GetRecentUserNoficationInputDTO = z.infer<typeof getRecentUserNotification>;

export type GetRecentUserNotificationOutputDTO = {
   noti: CombinedNotification[];
   pagination: { from?: string | null; hasmore: boolean };
};
