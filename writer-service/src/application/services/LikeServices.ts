import { BulkCommnetLikeInsertInputDTO } from '@application/dtos/BulkCommentLikeInsertInput.dto';
import { CommentLikeBulkInsertError } from '@application/errors/CommentLikeBulkInsertError';
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

      logger.info(`published ${successCount}/${dto.length} ${AppEventsTypes.COMMENT_LIKED} events`);
   };
}
