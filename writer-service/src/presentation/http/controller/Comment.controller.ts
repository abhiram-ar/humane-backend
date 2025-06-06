import { CreateCommentDTO, createCommentSchema } from '@application/dtos/CreateComment';
import { DeleteCommentDTO, deleteCommentSchema } from '@application/dtos/DeleteComment.dto';
import { ICommentService } from '@ports/ICommentServices';
import { Request, Response, NextFunction } from 'express';
import { HttpStatusCodes, UnAuthenticatedError, ZodValidationError } from 'humane-common';

export class CommentController {
   constructor(private readonly _commentServices: ICommentService) {}

   createComment = async (req: Request, res: Response, next: NextFunction) => {
      try {
         if (!req.user || req.user.type !== 'user') {
            throw new UnAuthenticatedError('user not in req header');
         }

         const dto: CreateCommentDTO = {
            authorId: req.user.userId,
            postId: req.params.postId,
            content: req.body.content,
         };

         const parsed = createCommentSchema.safeParse(dto);
         if (!parsed.success) {
            throw new ZodValidationError(parsed.error);
         }
         const createdComment = await this._commentServices.create(parsed.data);

         res.status(HttpStatusCodes.CREATED).json({
            message: 'comment created',
            data: { comment: createdComment },
         });
      } catch (error) {
         next(error);
      }
   };

   deleteComment = async (req: Request, res: Response, next: NextFunction) => {
      try {
         if (!req.user || req.user.type !== 'user') {
            throw new UnAuthenticatedError('user not in req header');
         }

         const dto: DeleteCommentDTO = {
            authorId: req.user.userId,
            commentId: req.params.commentId,
         };

         const parsed = deleteCommentSchema.safeParse(dto);
         if (!parsed.success) {
            throw new ZodValidationError(parsed.error);
         }
         const deletedComment = await this._commentServices.delete(parsed.data);

         res.status(HttpStatusCodes.CREATED).json({
            message: 'comment deleted',
            data: { comment: deletedComment },
         });
      } catch (error) {
         next(error);
      }
   };
}
