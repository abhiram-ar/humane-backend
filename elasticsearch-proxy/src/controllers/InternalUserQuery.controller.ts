import { paginatedSearchSchema } from 'interfaces/dto/paginatedSearch.dto';
import { Request, Response, NextFunction } from 'express';
import { GenericError, HttpStatusCodes, ZodValidationError } from 'humane-common';
import {
   HydrartePostDetailsInputDTO,
   hydratePostDetailsSchema,
} from 'interfaces/dto/post/HydratePostDetails.dto';
import { GetBasicUserProfileFromIdsOutputDTO } from 'interfaces/dto/GetUserBasicProfileFromIDs';
import { HttpStatusCode } from 'axios';
import { ICommentService } from 'interfaces/services/IComment.services';
import { IPostService } from 'interfaces/services/IPost.services';
import { IUserServices } from 'interfaces/services/IUser.services';

export class InternalQueryController {
   constructor(
      private readonly _userSerives: IUserServices,
      private readonly _postServices: IPostService,
      private readonly _commnetServiecs: ICommentService
   ) {}

   searchUser = async (req: Request, res: Response, next: NextFunction) => {
      try {
         const { searchQuery = '', page = 1, limit = 10 } = req.query;

         const dto = {
            search: searchQuery,
            limit: parseInt(limit as string),
            page: parseInt(page as string),
         };
         const parsedDTO = paginatedSearchSchema.safeParse(dto);
         if (!parsedDTO.success) {
            console.log(parsedDTO.error);
            throw new ZodValidationError(parsedDTO.error);
         }

         const { users, pagination } = await this._userSerives.paginatedSearch(parsedDTO.data);

         res.status(HttpStatusCode.Ok).json({
            data: { users, pagination },
         });
      } catch (error) {
         next(error);
      }
   };

   hydratePostDetails = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
      try {
         const { postId } = req.query;
         const { noAuthorHydration } = req.query;

         let ids: HydrartePostDetailsInputDTO;
         if (typeof postId === 'string') {
            ids = [postId];
         } else if (Array.isArray(postId)) {
            ids = postId as string[];
         } else {
            throw new GenericError('bad postId');
         }

         const parsed = hydratePostDetailsSchema.safeParse(ids);
         if (!parsed.success) {
            throw new ZodValidationError(parsed.error);
         }
         const postdetails = await this._postServices.getPostByIds(parsed.data);

         if (noAuthorHydration && parseInt(noAuthorHydration as string)) {
            return res.status(200).json({
               data: { posts: postdetails },
            });
         }

         // posts will have common author
         const authorIdsSet = new Set<string>();
         postdetails.forEach((post) => {
            if (post) {
               authorIdsSet.add(post.authorId);
            }
         });

         const authorIdToBasicDetailsMap = new Map<
            string,
            NonNullable<GetBasicUserProfileFromIdsOutputDTO[0]>
         >();

         const authorBasicDetails = await this._userSerives.getBasicUserProfile(
            postdetails.filter((post) => !!post).map((post) => post.authorId)
         );

         authorBasicDetails.forEach(
            (author) => author && authorIdToBasicDetailsMap.set(author.id, author)
         );

         const authorDetailsHydratedPosts = postdetails.map((post) => {
            if (!post) return null;

            if (authorIdToBasicDetailsMap.has(post.authorId)) {
               return { ...post, author: authorIdToBasicDetailsMap.get(post.authorId) };
            }
         });

         res.status(HttpStatusCodes.OK).json({
            data: { posts: authorDetailsHydratedPosts },
         });
      } catch (error) {
         next(error);
      }
   };

   getCommentDataFromIds = async (req: Request, res: Response, next: NextFunction) => {
      try {
         const commentId = req.query.commentId;
         let ids: string[];
         if (typeof commentId === 'string') {
            ids = [commentId];
         } else if (Array.isArray(commentId)) {
            ids = commentId as string[];
         } else {
            throw new GenericError('bad commentId');
         }

         const comments = await this._commnetServiecs.getCommentByIds(ids);

         res.status(HttpStatusCode.Ok).json({ data: { comments } });
      } catch (error) {
         next(error);
      }
   };
}
