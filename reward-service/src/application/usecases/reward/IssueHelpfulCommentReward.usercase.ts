import { IUserServices } from '@ports/services/IUserService';
import { IRewardRepostory } from '../../ports/repository/IRewardRepository';
import { IssueHelpFulCommentInputDTO } from '@application/dto/IssueHelpfulCommentReward.dto';
import { RewardErrorMsg } from '@application/errors/FriendshipError';
import { Reward } from '@domain/Reward.entity';
import { IEventPublisher } from '@ports/services/IEventProducer';
import { logger } from '@config/logger';
import { IIssueHelpfulCommnetReward } from '@ports/usecases/reward/IIssueHelpfulCommentReward.usercase';
import {
   AppEventsTypes,
   createEvent,
   MessageBrokerTopics,
   UserRewardedEventPayload,
} from 'humane-common';

export class IssueHelpfulCommnetReward implements IIssueHelpfulCommnetReward {
   static generateIdempotencyKey = (dto: IssueHelpFulCommentInputDTO): string => {
      // a user can get only one reward per post
      return dto.postId + '|' + dto.commentAutorId;
   };
   constructor(
      private readonly _rewardRepo: IRewardRepostory,
      private readonly _userServices: IUserServices,
      private readonly _eventPubliser: IEventPublisher
   ) {}

   execute = async (dto: IssueHelpFulCommentInputDTO): Promise<Required<Reward> | null> => {
      // check if user are friends
      const relationShipStatus = await this._userServices.getRelationshipStatus(
         dto.commentAutorId,
         dto.postAuthorId
      );

      if (relationShipStatus !== 'friends') {
         logger.warn(RewardErrorMsg.NOT_FRIENDS);
         return null;
      }

      // generate reward entirt
      const idempotencyKey = IssueHelpfulCommnetReward.generateIdempotencyKey(dto);
      const reward = new Reward(dto.commentAutorId, idempotencyKey, 'HELPFUL_COMMENT');

      const newReward = await this._rewardRepo.create(reward);
      if (!newReward) {
         return null; // itempotency key error
      }

      const eventPayload: UserRewardedEventPayload = {
         userId: newReward.actorId,
         amount: newReward.pointsRewarded,
      };

      const userRewardedEvent = createEvent(AppEventsTypes.USER_REWARDED, eventPayload);

      await this._eventPubliser.send(MessageBrokerTopics.REWARD_EVENTS_TOPIC, userRewardedEvent);

      return newReward;
   };
}
