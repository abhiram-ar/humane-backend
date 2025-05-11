import { CreateAnonymousUser } from '@application/useCases/anonymous/CreateAnonymousUser.usercase';
import { mongoAnonUserRepository, mongoUserRespository } from '../repository.container';
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
   mongoUserRespository
);

export const updateAnonProfile = new UpdateAnonProfile(resolveAnonUser, mongoUserRespository);

export const generatePresignedURL = new GeneratePresignedURL(awsStorageService);

export const updateAnonAvatar = new UpdateAnonAvatar(resolveAnonUser, mongoUserRespository);

export const updateAnonCoverPhoto = new UpdateAnonCoverPhoto(resolveAnonUser, mongoUserRespository);
