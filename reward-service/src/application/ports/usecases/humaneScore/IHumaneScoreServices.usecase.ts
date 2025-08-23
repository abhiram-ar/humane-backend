import { GetUserScoreInputDTO } from '@application/dto/GetUserScore.dto';
import { HumaneScore } from '@domain/HumaneScore';

export interface IHumaneScoreServices {
   create(dto: { userId: string; initialScore?: number }): Promise<HumaneScore>;
   getUserScore(dto: GetUserScoreInputDTO): Promise<HumaneScore | null>;
   delete(userId: string): Promise<HumaneScore | null>;

   getlist(dto: { userIds?: string[]; page: number; limit: number }): Promise<{
      rewards: Required<HumaneScore>[];
      pagination: { page: number; limit: number; totalItems: number };
   }>;
}
