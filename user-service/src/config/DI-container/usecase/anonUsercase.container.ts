import { CreateAnonymousUser } from '@application/useCases/anonymous/CreateAnonymousUser.usercase';
import { mongoAnonUserRepository, mongoUserRespository } from '../repository.container';
import { cryptoUUIDService } from '../services.container';
import { ResolveAnoymousUser } from '@application/useCases/anonymous/ResolveAnonymousUser.usecase';
import { GetCurrentAnonProfile } from '@application/useCases/anonymous/GetCurrentUserDetails';

export const creataAnonUser = new CreateAnonymousUser(mongoAnonUserRepository, cryptoUUIDService);

export const resolveAnonUser = new ResolveAnoymousUser(mongoAnonUserRepository);

export const getCurrentAnonProfile = new GetCurrentAnonProfile(
   resolveAnonUser,
   mongoUserRespository
);
