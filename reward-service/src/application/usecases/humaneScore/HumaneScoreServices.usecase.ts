import { GetUserScoreInputDTO } from '@application/dto/GetUserScore.dto';
import { HumaneScore } from '@domain/HumaneScore';
import { IHumaneScoreRepository } from '@ports/repository/IHumaneScoreRepository';
import { IHumaneScoreServices } from '@ports/usecases/humaneScore/IHumaneScoreServices.usecase';

export class HumaneScoreServices implements IHumaneScoreServices {
   constructor(private readonly humaneRepository: IHumaneScoreRepository) {}

   create = async (dto: { userId: string; initialScore?: number }): Promise<HumaneScore> => {
      const humaneScore = new HumaneScore(dto.userId, dto.initialScore ?? 0);
      return await this.humaneRepository.create(humaneScore);
   };
   getUserScore = async (dto: GetUserScoreInputDTO): Promise<HumaneScore | null> => {
      return await this.humaneRepository.get(dto.userId);
   };

   delete = async (userId: string): Promise<HumaneScore | null> => {
      return await this.humaneRepository.delete(userId);
   };
}
