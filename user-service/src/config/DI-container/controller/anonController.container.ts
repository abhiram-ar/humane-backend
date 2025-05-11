import { getCurrentAnonProfile } from '@di/usecase/anonUsercase.container';
import { AnonProfileController } from '@presentation/controllers/anonProfile.controller';

export const anonProfileController = new AnonProfileController(getCurrentAnonProfile);
