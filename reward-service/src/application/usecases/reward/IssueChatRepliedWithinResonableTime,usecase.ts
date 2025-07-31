import { IssueChatRepliedWithinResonableTimeInputDTO } from '@application/dto/IssueChatRepliedWithinResonableTimeReward.dto,';
import { RewardErrorMsg } from '@application/errors/FriendshipError';
import { ENV } from '@config/env';
import { logger } from '@config/logger';
import { Reward } from '@domain/Reward.entity';
import { IRewardRepostory } from '@ports/repository/IRewardRepository';
import { IEventPublisher } from '@ports/services/IEventProducer';
import { IUserServices } from '@ports/services/IUserService';
import { IIssueChatRepliedWithinResonableTimeReward } from '@ports/usecases/reward/IIssueChatRepliedWithinResonableTime,usecase';
import {
   AppEventsTypes,
   createEvent,
   MessageBrokerTopics,
   UserRewardedEventPayload,
} from 'humane-common';

export class IssueChatRepliedWithinResonableTimeReward
   implements IIssueChatRepliedWithinResonableTimeReward
{
   constructor(
      private readonly _userServices: IUserServices,
      private readonly _rewardRepo: IRewardRepostory,
      private readonly _eventPubliser: IEventPublisher
   ) {}

   static generateIdempotencyKey = (dto: IssueChatRepliedWithinResonableTimeInputDTO): string => {
      return [dto.conversationId, dto.senderId, dto.sendAt.getTime().toString()].join('|');
   };
   execute = async (
      dto: IssueChatRepliedWithinResonableTimeInputDTO
   ): Promise<Required<Reward> | null> => {
      const relationShipStatus = await this._userServices.getRelationshipStatus(
         dto.senderId,
         dto.repliedToUserId
      );

      if (relationShipStatus !== 'friends') {
         logger.warn(RewardErrorMsg.NOT_FRIENDS);
         return null;
      }

      const lastReward = await this._rewardRepo.findLastReward({
         type: 'CHAT_CHECKIN',
         userId: dto.senderId,
      });
      if (lastReward) {
         let timeDiff = dto.sendAt.getTime() - lastReward.createdAt.getTime();
         if (timeDiff < parseInt(ENV.CHAT_REWARED_COOLOFF_INTERFVAL)) {
            logger.warn(RewardErrorMsg.CHAT_REWARED_RATE_LIMIT);
            return null;
         }
      }

      const idempotencyKey = IssueChatRepliedWithinResonableTimeReward.generateIdempotencyKey(dto);
      const reward = new Reward(dto.senderId, idempotencyKey, 'CHAT_CHECKIN');

      const newReward = await this._rewardRepo.create(reward);
      if (!newReward) {
         return null;
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
