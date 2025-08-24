import { IssueChatRepliedWithinResonableTimeReward } from '@application/usecases/reward/IssueChatRepliedWithinResonableTime,usecase';
import { IssueHelpfulCommnetReward } from '@application/usecases/reward/IssueHelpfulCommentReward.usercase';
import { RewardConfigServices } from '@application/usecases/reward/RewardConfigService';
import { rewardConfigRepository, rewardRepository } from '@di/repository.container';
import { eventPubliser, userService } from '@di/services.container';

export const rewardConfigServices = new RewardConfigServices(rewardConfigRepository);
export const issueHelpfulCommentReward = new IssueHelpfulCommnetReward(
   rewardRepository,
   userService,
   eventPubliser,
   rewardConfigServices
);

export const issueChatRepliedWithinResonableTimeReward =
   new IssueChatRepliedWithinResonableTimeReward(
      userService,
      rewardRepository,
      eventPubliser,
      rewardConfigServices
   );
