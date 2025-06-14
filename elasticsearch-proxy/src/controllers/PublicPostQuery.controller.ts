import { PostService } from '@services/Post.services';
import { UserServices } from '@services/User.services';
import { HttpStatusCode } from 'axios';
import { PostNotFoundError } from 'errors/PostNotFound.error';
import { NextFunction, Request, Response } from 'express';
import { HttpStatusCodes, ZodValidationError } from 'humane-common';
import {
   GetUserTimelineInputDTO,
   getUserTimelineSchema,
} from 'interfaces/dto/post/GetUserTimeline.dto';
import { hydratePostDetailsSchema } from 'interfaces/dto/post/HydratePostDetails.dto';
import { PostVisibility } from 'interfaces/dto/post/Post.dto';
import { IExternalUserServices } from 'interfaces/services/IExternalUserService';

export class PublicPostQueryControllet {
   constructor(
      private readonly _postServices: PostService,
      private readonly _userSerives: UserServices,
      private readonly _externalUserService: IExternalUserServices
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
            const relStatus = await this._externalUserService.getRelationshipStatus(
               req.user.userId,
               validatedDTO.data.targetUserId
            );

            if (relStatus !== 'friends') {
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

   postFullDetails = async (req: Request, res: Response, next: NextFunction) => {
      try {
         const { postId } = req.params;

         const parsed = hydratePostDetailsSchema.safeParse([postId]);
         if (!parsed.success) {
            throw new ZodValidationError(parsed.error);
         }
         const [postdetails] = await this._postServices.getPostByIds(parsed.data);

         if (!postdetails) {
            throw new PostNotFoundError();
         }

         const [authorBasicDetails] = await this._userSerives.getBasicUserProfile([
            postdetails.authorId,
         ]);

         res.status(HttpStatusCodes.OK).json({
            message: 'author details hydrated post',
            data: { post: { ...postdetails, author: authorBasicDetails } },
         });
      } catch (error) {
         next(error);
      }
   };
}
