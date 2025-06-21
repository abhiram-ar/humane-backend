import {
   GetCommentLikeMetadataForAUser,
   GetCommentLikeMetadataForAUserResponse,
   getCommentLikeMetaDataForAUserSchema,
} from '@application/dtos/GetCommnetLikeMetadataForAUser';
import { InvalidCommentIdTypeError } from '@application/errors/InvalidCommnetIdTypeError';
import { HasUserLikedComment } from '@application/Types/HasUserLikedComment.type';
import { ICommentService } from '@ports/ICommentServices';
import { ILikeServices } from '@ports/ILikeServices';
import { HttpStatusCode } from 'axios';
import { Request, Response, NextFunction } from 'express';
import { ZodValidationError } from 'humane-common';

export class InternalController {
   constructor(
      private readonly _commentServices: ICommentService,
      private readonly _likeServies: ILikeServices
   ) {}

   getCommentMetadataForAUser = async (req: Request, res: Response, next: NextFunction) => {
      try {
         let userId: string | undefined;
         let commentIds: string[] = [];

         if (typeof req.query.commentId === 'string') {
            commentIds = [req.query.commentId as string];
         } else if (Array.isArray(req.query.commentId)) {
            commentIds = req.query.commentId as string[];
         } else {
            throw new InvalidCommentIdTypeError();
         }

         if (req.query.userId) {
            userId = req.query.userId as string;
         }

         const dto: GetCommentLikeMetadataForAUser = {
            userId,
            commentIds,
         };
         const validatedDTO = getCommentLikeMetaDataForAUserSchema.safeParse(dto);
         if (!validatedDTO.success) {
            throw new ZodValidationError(validatedDTO.error);
         }

         let commmentLikeMetadata: GetCommentLikeMetadataForAUserResponse =
            await this._commentServices.getCommnetLikeMetadataByIds(validatedDTO.data.commentIds);

         let commentsLikedByUser: HasUserLikedComment[] = [];
         if (dto.userId) {
            commentsLikedByUser = await this._likeServies.hasUserLikedTheseComments(
               dto.userId,
               dto.commentIds
            );
         }

         const commentIdToHasUserLikedCommentMap = new Map<string, boolean>();
         commentsLikedByUser.forEach((entry) =>
            commentIdToHasUserLikedCommentMap.set(entry.commentId, entry.hasLikedByUser)
         );

         if (commentIdToHasUserLikedCommentMap.size > 0) {
            commmentLikeMetadata = commmentLikeMetadata.map((entry) => ({
               ...entry,
               hasLikedByUser: commentIdToHasUserLikedCommentMap.get(entry.id) ?? false,
            }));
         }

         res.status(HttpStatusCode.Ok).json({ data: { commmentLikeMetadata } });
      } catch (error) {
         next(error);
      }
   };
}
