import { HumaneScoreController } from '@presentation/http/Controller/HumaneScore.controller';
import { humaneScoreServices } from './usecase/humaneScore.usercase.container';

export const humaneScoreController = new HumaneScoreController(humaneScoreServices);
