import { HumaneScoreServices } from '@application/usecases/humaneScore/HumaneScoreServices.usecase';
import { humaneScoreRepository } from '@di/repository.container';

export const humaneScoreServices = new HumaneScoreServices(humaneScoreRepository);
