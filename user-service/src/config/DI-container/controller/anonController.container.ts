import {
   generatePresignedURL,
   getCurrentAnonProfile,
   updateAnonAvatar,
   updateAnonCoverPhoto,
   updateAnonProfile,
} from '@di/usecase/anonUsercase.container';
import { AnonProfileController } from '@presentation/controllers/anonProfile.controller';

export const anonProfileController = new AnonProfileController(
   getCurrentAnonProfile,
   updateAnonProfile,
   generatePresignedURL,
   updateAnonAvatar,
   updateAnonCoverPhoto
);
