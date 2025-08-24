import {
   AddCommentLikeRequestDTO,
   addCommentLikeRequestSchema,
} from '@application/dtos/AddLikeRequest.dto';
import {
   commentUnlikeRequestDTO,
   commentUnlikeRequestSchema,
} from '@application/dtos/commentUnlikeRequest.dto';
import { IEventPublisher } from '@ports/IEventProducer';
import { HttpStatusCode } from 'axios';
import { randomUUID } from 'crypto';
import { Request, Response, NextFunction } from 'express';
import {
   AppEventsTypes,
   CommentLikeRequestPayload,
   createEvent,
   EventBusError,
   MessageBrokerTopics,
   UnAuthenticatedError,
   ZodValidationError,
} from 'humane-common';
import { ILikeController } from '../interfaces/ILike.controller';

export class LikeController implements ILikeController {
   constructor(private readonly _eventPublishser: IEventPublisher) {}

   addCommentLikeRequest = async (req: Request, res: Response, next: NextFunction) => {
      try {
         if (!req.user || req.user.type !== 'user') {
            throw new UnAuthenticatedError();
         }
         const dto: AddCommentLikeRequestDTO = {
            authorId: req.user.userId,
            commentId: req.params.commentId,
         };

         const validatedDTO = addCommentLikeRequestSchema.safeParse(dto);
         if (!validatedDTO.success) {
            throw new ZodValidationError(validatedDTO.error);
         }

         const eventPaylod: CommentLikeRequestPayload = {
            authorId: validatedDTO.data.authorId,
            commentId: validatedDTO.data.commentId,
         };

         const addCommentLikeRequestEvent = createEvent(
            AppEventsTypes.ADD_COMMENT_LIKE_REQUESTED,
            eventPaylod
         );

         const { ack } = await this._eventPublishser.send(
            MessageBrokerTopics.ADD_COMMENT_LIKE_REQUEST_TOPIC,
            addCommentLikeRequestEvent
         );
         if (!ack) {
            throw new EventBusError();
         }

         res.status(HttpStatusCode.Accepted).json({
            data: { like: { id: `temp-${randomUUID()}`, ...validatedDTO.data } },
         });
      } catch (error) {
         next(error);
      }
   };

   commnetUnlikeRequest = async (req: Request, res: Response, next: NextFunction) => {
      try {
         if (!req.user || req.user.type !== 'user') {
            throw new UnAuthenticatedError();
         }
         const dto: commentUnlikeRequestDTO = {
            authorId: req.user.userId,
            commentId: req.params.commentId,
         };

         const validatedDTO = commentUnlikeRequestSchema.safeParse(dto);
         if (!validatedDTO.success) {
            throw new ZodValidationError(validatedDTO.error);
         }

         const eventPaylod: CommentLikeRequestPayload = {
            authorId: validatedDTO.data.authorId,
            commentId: validatedDTO.data.commentId,
         };

         const commentUnikeRequestEvent = createEvent(
            AppEventsTypes.COMMENT_UNLIKE_REQUESTED,
            eventPaylod
         );

         const { ack } = await this._eventPublishser.send(
            MessageBrokerTopics.COMMENT_UNLIKE_REQUEST_TOPIC,
            commentUnikeRequestEvent
         );
         if (!ack) {
            throw new EventBusError();
         }

         res.status(HttpStatusCode.Accepted).json({
            data: { like: { id: `temp-${randomUUID()}`, ...validatedDTO.data } },
         });
      } catch (error) {
         next(error);
      }
   };
}
