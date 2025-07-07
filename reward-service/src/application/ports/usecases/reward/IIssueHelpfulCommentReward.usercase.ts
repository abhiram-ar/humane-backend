import { IssueHelpFulCommentInputDTO } from '@application/dto/IssueHelpfulCommentReward.dto';
import { Reward } from '@domain/Reward.entity';

export interface IIssueHelpfulCommnetReward {
   execute(dto: IssueHelpFulCommentInputDTO): Promise<Required<Reward> | null>;
}
