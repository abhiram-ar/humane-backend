import { CreateAnonymousUser } from '@application/useCases/anonymous/CreateAnonymousUser.usercase';
import { mongoAnonUserRepository, userRepository } from '../repository.container';
import { awsStorageService, cryptoUUIDService } from '../services.container';
import { ResolveAnoymousUser } from '@application/useCases/anonymous/ResolveAnonymousUser.usecase';
import { GetCurrentAnonProfile } from '@application/useCases/anonymous/GetCurrentAnonProfile';
import { UpdateAnonProfile } from '@application/useCases/anonymous/UpdateAnonProfile';
import { GeneratePresignedURL } from '@application/useCases/anonymous/GeneratePresignedURL';
import { UpdateAnonAvatar } from '@application/useCases/anonymous/UpdateAnonAvatar';
import { UpdateAnonCoverPhoto } from '@application/useCases/anonymous/UpdateAnonCoverPhoto';

export const creataAnonUser = new CreateAnonymousUser(mongoAnonUserRepository, cryptoUUIDService);

export const resolveAnonUser = new ResolveAnoymousUser(mongoAnonUserRepository);

export const getCurrentAnonProfile = new GetCurrentAnonProfile(
   resolveAnonUser,
   userRepository,
   awsStorageService
);

export const updateAnonProfile = new UpdateAnonProfile(resolveAnonUser, userRepository);

export const generatePresignedURL = new GeneratePresignedURL(awsStorageService);

export const updateAnonAvatar = new UpdateAnonAvatar(
   resolveAnonUser,
   userRepository,
   awsStorageService
);

export const updateAnonCoverPhoto = new UpdateAnonCoverPhoto(
   resolveAnonUser,
   userRepository,
   awsStorageService
);
