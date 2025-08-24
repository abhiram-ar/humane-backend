import {
   GetRecentUserNoficationInputDTO,
   getRecentUserNotification,
} from '@application/dtos/GetRecentUserNotification.dto';
import {
   MarkNotificationAsReadInputDTO,
   markNotificationAsReadSchema,
} from '@application/dtos/MarkNotificationAsReadFrom.dto';
import { BasicUserDetails } from '@application/Types/BasicUserDetails';
import { UserNotificationService } from '@application/usercase/UserNotification.usecase';
import { logger } from '@config/logger';
import { IElasticSearchProxyService } from '@ports/IElasticSearchProxyService';
import { CombinedNotificationWithActionableUser } from '@presentation/Types/CombinedNotiWithActionableUser';
import { HttpStatusCode } from 'axios';
import { Request, Response, NextFunction } from 'express';
import { UnAuthenticatedError, ZodValidationError } from 'humane-common';
import { IUserNotificationController } from '../interfaces/IUserNotification.controller';

export class UserNotificationController implements IUserNotificationController {
   constructor(
      private readonly _userNotificationService: UserNotificationService,
      private readonly _esProxyService: IElasticSearchProxyService
   ) {}

   getRecentNotifications = async (req: Request, res: Response, next: NextFunction) => {
      try {
         if (req.user?.type !== 'user') {
            throw new UnAuthenticatedError();
         }

         const dto: GetRecentUserNoficationInputDTO = {
            userId: req.user.userId,
            limit: parseInt((req.query.limit as string) ?? 10),
            from: req.query.from as string,
         };

         const parsed = getRecentUserNotification.safeParse(dto);
         if (!parsed.success) {
            throw new ZodValidationError(parsed.error);
         }

         const { noti, pagination } = await this._userNotificationService.getRecentUserNotification(
            parsed.data
         );

         const notiToActionableUserMap = new Map<string, string>();
         noti.forEach((combinedNoti) => {
            // @ts-ignore
            if (combinedNoti?.actorId) {
               // @ts-ignore
               notiToActionableUserMap.set(combinedNoti.id!, combinedNoti.actorId);
            }
         });

         const actionableUserIds = Array.from(notiToActionableUserMap.values());
         let actionableUserDetailsHydratedNoti: CombinedNotificationWithActionableUser[] = [];

         if (actionableUserIds.length > 0) {
            // exproxy will throw an error if userIds is null
            const actionableUserDetails = await this._esProxyService.getUserBasicDetails(
               actionableUserIds
            );

            const actionableUserDetailsMap = new Map<string, BasicUserDetails>();
            actionableUserDetails.forEach((user) => {
               if (!user) return;
               actionableUserDetailsMap.set(user.id, user);
            });

            actionableUserDetailsHydratedNoti = noti.map((noti) => {
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
         }

         res.status(HttpStatusCode.Ok).json({
            data: {
               noti: actionableUserIds.length > 0 ? actionableUserDetailsHydratedNoti : noti, //not every notification maynot necessay have a actionalble user
               pagination,
            },
         });
      } catch (error) {
         next(error);
      }
   };

   markAsReadFrom = async (req: Request, res: Response, next: NextFunction) => {
      try {
         if (req.user?.type !== 'user') {
            throw new UnAuthenticatedError();
         }

         const dto: MarkNotificationAsReadInputDTO = {
            userId: req.user.userId,
            fromId: req.body.fromId,
         };

         const parsed = markNotificationAsReadSchema.safeParse(dto);
         if (parsed.error) {
            throw new ZodValidationError(parsed.error);
         }

         await this._userNotificationService.markNotificaionAsReadFrom(dto);

         // TODO: wite the update to socket - to mark the notification form, since a user might be logged in from other devices

         res.status(HttpStatusCode.Accepted).json({
            message: `user notifation marked as read from ${dto.fromId}`,
         });
      } catch (error) {
         next(error);
      }
   };
}
