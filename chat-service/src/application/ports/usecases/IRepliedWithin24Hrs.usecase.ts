import { RepliedWithin24HrsInputDTO } from '@application/dto/RepliedWithin24Hrs.dto';

export interface IRepliedWithin24Hrs {
   execute(dto: RepliedWithin24HrsInputDTO): Promise<void>;
}
