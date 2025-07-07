import { GetUserScoreInputDTO } from '@application/dto/GetUserScore.dto';
import { HumaneScore } from '@domain/HumaneScore';

export interface IHumaneScoreServices {
   create(dto: { userId: string; initialScore?: number }): Promise<HumaneScore>;
   getUserScore(dto: GetUserScoreInputDTO): Promise<HumaneScore | null>;
   delete(userId: string): Promise<HumaneScore | null>;
}
