import { ENV } from '@config/env';
import { PostService } from '@services/Post.services';
import { UserServices } from '@services/User.services';
import axios, { HttpStatusCode } from 'axios';
import { NextFunction, Request, Response } from 'express';
import { ZodValidationError } from 'humane-common';
import {
   GetUserTimelineInputDTO,
   getUserTimelineSchema,
} from 'interfaces/dto/post/GetUserTimeline.dto';
import { PostVisibility } from 'interfaces/dto/post/Post.dto';

export class PublicPostQueryControllet {
   constructor(
      private readonly _postServices: PostService,
      private readonly _userSerives: UserServices
   ) {}

   getUserTimeline = async (req: Request, res: Response, next: NextFunction) => {
      try {
         let filter: (typeof PostVisibility)[keyof typeof PostVisibility] | undefined;

         const dto: GetUserTimelineInputDTO = {
            targetUserId: req.params.targetUserId,
            limit: parseInt((req.query.limit as string) || '10'),
            from: (req.query.from as string) ?? null,
         };
         const validatedDTO = getUserTimelineSchema.safeParse(dto);
         if (!validatedDTO.success) {
            throw new ZodValidationError(validatedDTO.error);
         }

         if (!req.user || req.user.type !== 'user') {
            filter = 'public'; // if no user get only the public posts of targetUser
         } else if (req.user.userId === validatedDTO.data.targetUserId) {
            filter = undefined;
         } else {
            type RelationshipStatus =
               | 'sameUser'
               | 'strangers'
               | 'friends'
               | 'friendreqSend'
               | 'friendReqWaitingApproval'
               | 'blocked';

            type RelationshipStatusResponse = {
               success: boolean;
               message: string;
               data: { status: RelationshipStatus };
            };

            const response = await axios.get<RelationshipStatusResponse>(
               `${ENV.USER_SERVICE_BASE_URL}/api/v1/internal/relationship/status`,
               {
                  params: {
                     currentUserId: req.user.userId,
                     targetUserId: validatedDTO.data.targetUserId,
                  },
               }
            );

            if (response.data.data.status !== 'friends') {
               filter = 'public';
            } else {
               filter = undefined;
            }
         }
         const { posts, pagination } = await this._postServices.getUserTimeline(
            validatedDTO.data,
            filter
         );

         const targetUserDetails = await this._userSerives.getBasicUserProfile([dto.targetUserId]);

         res.status(HttpStatusCode.Ok).json({
            message: 'user timemline fetcheed',
            data: { posts, targetUserDetails: targetUserDetails[0], pagination },
         });
      } catch (error) {
         next(error);
      }
   };
}
