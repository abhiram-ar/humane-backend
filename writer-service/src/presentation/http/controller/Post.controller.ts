import { CreatePostDTO, createPostSchema } from '@application/dtos/CreatePost.dto';
import { DeletePostDTO, deletePostSchema } from '@application/dtos/DeletePost.dto';
import { IPostService } from '@ports/IPostService';
import { HttpStatusCode } from 'axios';
import { Request, Response, NextFunction } from 'express';
import { UnAuthenticatedError, ZodValidationError } from 'humane-common';

export class PostController {
   constructor(private readonly _postService: IPostService) {}

   createPost = async (req: Request, res: Response, next: NextFunction) => {
      try {
         if (!req.user || req.user.type !== 'user') {
            throw new UnAuthenticatedError('user not in req header');
         }

         const dto: CreatePostDTO = {
            authorId: req.user.userId,
            ...req.body,
         };

         const parsed = createPostSchema.safeParse(dto);
         if (!parsed.success) {
            throw new ZodValidationError(parsed.error);
         }
         const createdPost = await this._postService.create(parsed.data);

         res.status(HttpStatusCode.Created).json({
            message: 'post created',
            data: { post: createdPost },
         });
      } catch (error) {
         next(error);
      }
   };

   deletePost = async (req: Request, res: Response, next: NextFunction) => {
      try {
         if (!req.user || req.user.type !== 'user') {
            throw new UnAuthenticatedError('user not in req header');
         }

         const dto: DeletePostDTO = {
            authorId: req.user.userId,
            postId: req.params.postId,
         };

         const parsed = deletePostSchema.safeParse(dto);
         if (!parsed.success) {
            throw new ZodValidationError(parsed.error);
         }
         const deltedPost = await this._postService.delete(parsed.data);

         res.status(HttpStatusCode.Accepted).json({
            message: 'post deleted',
            data: { post: deltedPost },
         });
      } catch (error) {
         next(error);
      }
   };
}
