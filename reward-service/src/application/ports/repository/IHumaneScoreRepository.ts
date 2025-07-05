import { HumaneScore } from '@domain/HumaneScore';
import { IBaseRepository } from './IBaseRepository';

export interface IHumaneScoreRepository extends IBaseRepository<HumaneScore> {
   create(entity: HumaneScore): Promise<Required<HumaneScore>>;
}
