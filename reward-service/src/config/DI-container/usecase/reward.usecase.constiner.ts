import { IssueHelpfulCommnetReward } from '@application/usecases/reward/IssueHelpfulCommentReward.usercase';
import { rewardRepository } from '@di/repository.container';
import { eventPubliser, userService } from '@di/services.container';

export const issueHelpfulCommentReward = new IssueHelpfulCommnetReward(
   rewardRepository,
   userService,
   eventPubliser
);
