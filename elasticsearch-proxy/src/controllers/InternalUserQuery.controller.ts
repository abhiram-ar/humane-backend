import { paginatedSearchSchema } from 'interfaces/dto/paginatedSearch.dto';
import { UserServices } from '@services/User.services';
import { Request, Response, NextFunction } from 'express';
import { GenericError, HttpStatusCodes, ZodValidationError } from 'humane-common';
import {
   HydrartePostDetailsInputDTO,
   hydratePostDetailsSchema,
} from 'interfaces/dto/post/HydratePostDetails.dto';
import { PostService } from '@services/Post.services';
import { GetBasicUserProfileFromIdsOutputDTO } from 'interfaces/dto/GetUserBasicProfileFromIDs';
import { HttpStatusCode } from 'axios';

// TODO: rename to common internal controller
export class InternalQueryController {
   constructor(
      private readonly _userSerives: UserServices,
      private readonly _postServices: PostService
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

   hydratePostDetails = async (req: Request, res: Response, next: NextFunction) => {
      try {
         const { postId } = req.query;

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
}
