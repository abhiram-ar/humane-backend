import { IssueChatRepliedWithinResonableTimeReward } from '@application/usecases/reward/IssueChatRepliedWithinResonableTime,usecase';
import { IssueHelpfulCommnetReward } from '@application/usecases/reward/IssueHelpfulCommentReward.usercase';
import { rewardRepository } from '@di/repository.container';
import { eventPubliser, userService } from '@di/services.container';

export const issueHelpfulCommentReward = new IssueHelpfulCommnetReward(
   rewardRepository,
   userService,
   eventPubliser
);

export const issueChatRepliedWithinResonableTimeReward =
   new IssueChatRepliedWithinResonableTimeReward(userService, rewardRepository, eventPubliser);
