import { HttpStatusCode } from 'axios';
import { Request, Response, NextFunction } from 'express';
import { ZodValidationError } from 'humane-common';
import { GetCommentsInputDTO, getCommentsInputScheam } from 'interfaces/dto/post/GetComments.dto';
import { ICommentService } from 'interfaces/services/IComment.services';
export class PublicCommentController {
   constructor(private readonly _commentServices: ICommentService) {}

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
         res.status(HttpStatusCode.Ok).json({
            message: 'comment fetched',
            data: { comments, pagination },
         });
      } catch (error) {
         next(error);
      }
   };
}
