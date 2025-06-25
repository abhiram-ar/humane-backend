import { BulkCommnetLikeInsertInputDTO } from '@application/dtos/BulkCommentLikeInsertInput.dto';
import { commentUnlikeRequestDTO } from '@application/dtos/commentUnlikeRequest.dto';
import { CommentLikeBulkInsertError } from '@application/errors/CommentLikeBulkInsertError';
import { HasUserLikedComment } from '@application/Types/HasUserLikedComment.type';
import { logger } from '@config/logget';
import { Like } from '@domain/entities/Likes.entity';
import { ILikesRepository } from '@domain/repository/ILikesRepository';
import { IEventPublisher } from '@ports/IEventProducer';
import { ILikeServices } from '@ports/ILikeServices';
import {
   AppEventsTypes,
   CommentLikeEventPayload,
   createEvent,
   MessageBrokerTopics,
} from 'humane-common';

export class LikeServices implements ILikeServices {
   constructor(
      private readonly _likeRepo: ILikesRepository,
      private readonly _eventPublisher: IEventPublisher
   ) {}
   bulkDelete = async (dto: commentUnlikeRequestDTO[]): Promise<void> => {
      if (dto.length === 0) return;

      const domainLikes = dto.map((req) => new Like(req.authorId, req.commentId));

      const deletedLikes = await this._likeRepo.bulkDelete(domainLikes);
      logger.debug(`Deleted ${deletedLikes.length}/${dto.length} likes`);

      const sendDeleteEventPromises = deletedLikes.map(async (like) => {
         const unlikeCommenteventPayload: CommentLikeEventPayload = {
            authorId: like.authorId,
            commentId: like.commentId,
            createdAt: like.createdAt,
            updatedAt: like.updatedAt,
         };

         const commentUnlikedEvent = createEvent(
            AppEventsTypes.COMMENT_UNLIKED,
            unlikeCommenteventPayload
         );

         return await this._eventPublisher.send(
            MessageBrokerTopics.COMMENT_UNLIKED_EVENT_TOPIC,
            commentUnlikedEvent
         );
      });

      const publishResult = await Promise.all(sendDeleteEventPromises);

      let successCount = 0;
      publishResult.forEach((res) => res.ack && successCount++);
      logger.debug(
         `published ${successCount}/${dto.length} ${AppEventsTypes.COMMENT_UNLIKED} events`
      );

      // TODO: handle author liked or handle in the hasPostAuthorLiked/unlied consumer or here
   };

   bulkInsert = async (dto: BulkCommnetLikeInsertInputDTO): Promise<void> => {
      const domainLikes = dto.map((like) => new Like(like.authorId, like.commentId));

      const result = await this._likeRepo.bulkInsert(domainLikes);
      if (result === null) throw new CommentLikeBulkInsertError();
      logger.info(`inserted ${result.length}/${dto.length} comment liked`);

      const sendEventPromises = result.map(async (insert) => {
         const eventPayload: CommentLikeEventPayload = {
            authorId: insert.authorId,
            commentId: insert.commentId,
            createdAt: insert.createdAt,
            updatedAt: insert.updatedAt,
         };

         const commentLikedEvent = createEvent(AppEventsTypes.COMMENT_LIKED, eventPayload);

         return await this._eventPublisher.send(
            MessageBrokerTopics.COMMENT_LIKED_EVENT_TOPIC,
            commentLikedEvent
         );
      });

      const publishResult = await Promise.all(sendEventPromises);

      let successCount = 0;
      publishResult.forEach((res) => res.ack && successCount++);
      logger.debug(
         `published ${successCount}/${dto.length} ${AppEventsTypes.COMMENT_LIKED} events`
      );
   };

   hasUserLikedTheseComments = async (
      userId: string,
      commentIds: string[]
   ): Promise<HasUserLikedComment[]> => {
      // TODO: check in cache,

      return this._likeRepo.hasUserLikedTheseComments(userId, commentIds);
   };
}
