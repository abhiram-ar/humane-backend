import { CommentMetadata } from '@services/external/Types/GetCommnetMetadata.type';
import { HttpStatusCode } from 'axios';
import { Request, Response, NextFunction } from 'express';
import { ZodValidationError } from 'humane-common';
import { GetBasicUserProfileFromIdsOutputDTO } from 'interfaces/dto/GetUserBasicProfileFromIDs';
import { GetCommentsInputDTO, getCommentsInputScheam } from 'interfaces/dto/post/GetComments.dto';
import { ICommentService } from 'interfaces/services/IComment.services';
import { IExternalWriterService } from 'interfaces/services/IExternalWriterServices';
import { IUserServices } from 'interfaces/services/IUser.services';
import {
   AuthorHydratedComment,
   CommentMetaDataAndAuthorHydratedComment,
} from './Types/GetPostCommentsResponse.type';
export class PublicCommentController {
   constructor(
      private readonly _commentServices: ICommentService,
      private readonly _userService: IUserServices,

      private readonly _externalWriterService: IExternalWriterService
   ) {}

   getPostComments = async (req: Request, res: Response, next: NextFunction) => {
      try {
         const dto: GetCommentsInputDTO = {
            postId: req.params.postId,
            limit: parseInt((req.query.limit as string) || '5'),
            from: (req.query.from as string) ?? null,
         };

         const validatedDTO = getCommentsInputScheam.safeParse(dto);
         if (!validatedDTO.success) throw new ZodValidationError(validatedDTO.error);

         const { comments, pagination } = await this._commentServices.getPostComments(dto);

         const uniqueCommnetAuthorIds = new Set<string>();
         comments.forEach((comment) => uniqueCommnetAuthorIds.add(comment.authorId));

         const authorDetails = await this._userService.getBasicUserProfile(
            Array.from(uniqueCommnetAuthorIds)
         );

         const authorIdToAuthorDetailsMap = new Map<
            string,
            NonNullable<GetBasicUserProfileFromIdsOutputDTO[0]>
         >();

         authorDetails.forEach(
            (author) => author && authorIdToAuthorDetailsMap.set(author.id, author)
         );

         const authorHydratedComments = comments.map((comment) =>
            comment.authorId
               ? { ...comment, author: authorIdToAuthorDetailsMap.get(comment.authorId) }
               : comment
         );

         let responseData: (CommentMetaDataAndAuthorHydratedComment | AuthorHydratedComment)[] =
            authorHydratedComments;

         let userId: string | undefined = undefined;
         if (req.user && req.user.type === 'user') {
            userId = req.user.userId;
         }

         const commnetIdSet = new Set<string>();
         comments.forEach((comment) => commnetIdSet.add(comment.id));
         const commentsMetadata = await this._externalWriterService.getCommentsMetadataOfAUser(
            Array.from(commnetIdSet.values()),
            userId
         );

         if (commentsMetadata) {
            const commentIdToMetadataMap = new Map<string, Omit<CommentMetadata, 'id'>>();
            commentsMetadata.forEach((commentMetata) => {
               const { id, ...metadataWithoutCommentId } = commentMetata;
               commentIdToMetadataMap.set(id, metadataWithoutCommentId);
            });

            responseData = authorHydratedComments.map((comment) => {
               if (commentIdToMetadataMap.has(comment.id)) {
                  return {
                     ...comment,
                     ...(commentIdToMetadataMap.get(comment.id) as CommentMetadata),
                  };
               } else {
                  return comment;
               }
            });
         }

         res.status(HttpStatusCode.Ok).json({
            data: { comments: responseData, pagination },
         });
      } catch (error) {
         next(error);
      }
   };
}
