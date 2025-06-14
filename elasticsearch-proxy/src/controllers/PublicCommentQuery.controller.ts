import { HttpStatusCode } from 'axios';
import { Request, Response, NextFunction } from 'express';
import { ZodValidationError } from 'humane-common';
import { GetBasicUserProfileFromIdsOutputDTO } from 'interfaces/dto/GetUserBasicProfileFromIDs';
import { GetCommentsInputDTO, getCommentsInputScheam } from 'interfaces/dto/post/GetComments.dto';
import { ICommentService } from 'interfaces/services/IComment.services';
import { IUserServices } from 'interfaces/services/IUser.services';
export class PublicCommentController {
   constructor(
      private readonly _commentServices: ICommentService,
      private readonly _userService: IUserServices
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

         res.status(HttpStatusCode.Ok).json({
            message: 'comment fetched',
            data: { comments: authorHydratedComments, pagination },
         });
      } catch (error) {
         next(error);
      }
   };
}
