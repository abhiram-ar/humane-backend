import { CreateCommentDTO, createCommentSchema } from '@application/dtos/CreateComment';
import { DeleteCommentDTO, deleteCommentSchema } from '@application/dtos/DeleteComment.dto';
import { logger } from '@config/logget';
import { ICommentService } from '@ports/ICommentServices';
import { IEventPublisher } from '@ports/IEventProducer';
import { Request, Response, NextFunction } from 'express';
import {
   AppEventsTypes,
   createEvent,
   HttpStatusCodes,
   MessageBrokerTopics,
   UnAuthenticatedError,
   ZodValidationError,
} from 'humane-common';

export class CommentController {
   constructor(
      private readonly _commentServices: ICommentService,
      private readonly _eventPubliser: IEventPublisher
   ) {}

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

         const commentCreatedEvent = createEvent(AppEventsTypes.COMMENT_CREATED, createdComment);
         const { ack } = await this._eventPubliser.send(
            MessageBrokerTopics.COMMENT_CREATED_EVENTS_TOPIC,
            commentCreatedEvent
         );

         if (!ack) {
            logger.warn(`comment ${createdComment.id} created event not publised in eventbus`);
         }

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
            postId: req.params.postId,
            commentId: req.params.commentId,
         };

         const parsed = deleteCommentSchema.safeParse(dto);
         if (!parsed.success) {
            throw new ZodValidationError(parsed.error);
         }
         const deletedComment = await this._commentServices.delete(parsed.data);

         // TODO: clear comments realted to this comment
         const commentDeltedEvent = createEvent(AppEventsTypes.COMMENT_DELTED, deletedComment);
         const { ack } = await this._eventPubliser.send(
            MessageBrokerTopics.COMMENT_DELTED_EVENTS_TOPIC,
            commentDeltedEvent
         );

         if (!ack) {
            logger.warn(`commnet ${deletedComment.id} deleted event not publised in eventbus`);
         }

         res.status(HttpStatusCodes.CREATED).json({
            message: 'comment deleted',
            data: { comment: deletedComment },
         });
      } catch (error) {
         next(error);
      }
   };
}
