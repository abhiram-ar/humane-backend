import { HttpStatusCode } from 'axios';
import { PostNotFoundError } from 'errors/PostNotFound.error';
import { NextFunction, Request, Response } from 'express';
import { HttpStatusCodes, PostVisibility, ZodValidationError } from 'humane-common';
import {
   GetPostsByHashtagInputDTO,
   getPostsByHashtagSchema,
} from 'interfaces/dto/post/GetPostsByHashtag.dto';
import {
   GetUserTimelineInputDTO,
   getUserTimelineSchema,
} from 'interfaces/dto/post/GetUserTimeline.dto';
import { hydratePostDetailsSchema } from 'interfaces/dto/post/HydratePostDetails.dto';
import { IExternalUserServices } from 'interfaces/services/IExternalUserService';
import { IPostService } from 'interfaces/services/IPost.services';
import { IUserServices } from 'interfaces/services/IUser.services';

export class PublicPostQueryControllet {
   constructor(
      private readonly _postServices: IPostService,
      private readonly _userSerives: IUserServices,
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
            data: { post: { ...postdetails, author: authorBasicDetails } },
         });
      } catch (error) {
         next(error);
      }
   };

   queryPostByHashtag = async (req: Request, res: Response, next: NextFunction) => {
      try {
         const { from, limit } = req.query;

         const dto: GetPostsByHashtagInputDTO = {
            hashtag: req.params.hashtag,
            limit: limit ? parseInt(limit as string) : 10,
            from: from as string | undefined,
         };

         const validatedDTO = getPostsByHashtagSchema.safeParse(dto);
         if (!validatedDTO.success) {
            throw new ZodValidationError(validatedDTO.error);
         }
         const { posts, pagination } = await this._postServices.getPublicPostsByHashtag(
            validatedDTO.data
         );

         res.status(HttpStatusCode.Ok).json({ data: { posts, pagination } });
      } catch (error) {
         next(error);
      }
   };
}
