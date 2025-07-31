import { IssueChatRepliedWithinResonableTimeInputDTO } from '@application/dto/IssueChatRepliedWithinResonableTimeReward.dto,';
import { Reward } from '@domain/Reward.entity';

export interface IIssueChatRepliedWithinResonableTimeReward {
   execute(dto: IssueChatRepliedWithinResonableTimeInputDTO): Promise<Required<Reward> | null>;
}
