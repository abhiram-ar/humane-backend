import { IUserServices } from '@ports/services/IUserService';
import { IRewardRepostory } from '../../ports/repository/IRewardRepository';
import { IssueHelpFulCommentInputDTO } from '@application/dto/IssueHelpfulCommentReward.dto';
import { RewardErrorMsg, RewardError } from '@application/errors/FriendshipError';
import { Reward, RewardPoints } from '@domain/Reward.entity';
import { IEventPublisher } from '@ports/services/IEventProducer';

export class IssueHelpfulCommnetReward {
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
         throw new RewardError(RewardErrorMsg.NOT_FRIENDS);
      }

      // generate reward entirt
      const idempotencyKey = IssueHelpfulCommnetReward.generateIdempotencyKey(dto);
      const reward = new Reward(dto.commentAutorId, idempotencyKey, 'HELPFUL_COMMENT');

      // write to DB
      const newReward = await this._rewardRepo.create(reward);
      if (!newReward) {
         throw new RewardError(RewardErrorMsg.FAILED_TO_CREATE);
      }

      return newReward;

      // publish event
   };
}
