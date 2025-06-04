import {
   GetRecentUserNoficationInputDTO,
   getRecentUserNotification,
} from '@application/dtos/GetRecentUserNotification.dto';
import { UserNotification } from '@application/usercase/UserNotification.usecase';
import { logger } from '@config/logger';
import { axiosESproxyService } from '@infrastructure/http/axiosESproxy';
import {
   BasicUserDetails,
   GetUserBasicDetailsResponse,
} from '@presentation/event/Types/GetUserBasicDetails Response';
import { CombinedNotificationWithActionableUser } from '@presentation/Types/CombinedNotiWithActionableUser';
import { Request, Response, NextFunction } from 'express';
import { GenericError, UnAuthenticatedError, ZodValidationError } from 'humane-common';
export class UserNotificationController {
   constructor(private readonly _userNotification: UserNotification) {}

   getRecentNotifications = async (req: Request, res: Response, next: NextFunction) => {
      try {
         if (req.user?.type !== 'user') {
            throw new UnAuthenticatedError('No userId in request');
         }

         const dto: GetRecentUserNoficationInputDTO = {
            userId: req.user.userId,
            limit: parseInt(req.query.limit as string),
            from: req.query.from as string,
         };
         const parsed = getRecentUserNotification.safeParse(dto);
         if (!parsed.success) {
            throw new ZodValidationError(parsed.error);
         }

         const { noti, pagination } = await this._userNotification.getRecentUserNotification(
            parsed.data
         );

         const notiToActionableUserMap = new Map<string, string>();
         noti
            .filter((entry) => entry.type === 'friend-req')
            .forEach((friendReqNoti) => {
               let notiId = friendReqNoti.id as string;

               let actionableUserId: string | undefined;

               if (friendReqNoti.reciverId === dto.userId) {
                  actionableUserId = friendReqNoti.requesterId;
               } else if (friendReqNoti.requesterId === dto.userId) {
                  actionableUserId = friendReqNoti.reciverId; // incase of fiendReq accepted notificaion
               } else {
                  throw new GenericError(
                     'currnet user is netiter requeser or reciver of a friend req notification'
                  );
               }

               return notiToActionableUserMap.set(notiId, actionableUserId);
            });

         const actionableUserIds = Array.from(notiToActionableUserMap.values());
         const actionableUserDetails = await axiosESproxyService
            .get<GetUserBasicDetailsResponse>('/api/v1/query/public/user/basic', {
               params: { userId: actionableUserIds },
            })
            .then((data) => data.data.data.user);

         const actionableUserDetailsMap = new Map<string, BasicUserDetails>();
         actionableUserDetails.forEach((user) => {
            if (!user) return;
            actionableUserDetailsMap.set(user.id, user);
         });

         const actionableUserDetailsHydratedNoti: CombinedNotificationWithActionableUser[] =
            noti.map((noti) => {
               const actionableUserIdOfNoti = notiToActionableUserMap.get(noti.id as string);
               if (!actionableUserIdOfNoti) {
                  return noti;
               }

               if (actionableUserDetailsMap.has(actionableUserIdOfNoti)) {
                  return {
                     ...noti,
                     actionableUser: actionableUserDetailsMap.get(actionableUserIdOfNoti),
                  } as CombinedNotificationWithActionableUser;
               }
               logger.warn('cannot resolve actionable user of a noti');
               return noti;
            });

         res.status(200).json({
            success: true,
            message: 'user notification fetched',
            data: { noti: actionableUserDetailsHydratedNoti, pagination },
         });
      } catch (error) {
         next(error);
      }
   };
}
