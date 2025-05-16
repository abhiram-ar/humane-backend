import { ForgotPassword } from '@application/useCases/user/ForgotPassword.usecase';
import { RecoverPassword } from '@application/useCases/user/RecoverPassword.usecase';
import { RefreshUserAccessToken } from '@application/useCases/user/RefreshUserToken.usecase';
import { SignupUser } from '@application/useCases/user/SignupUser.usecase';
import { UserEmailLogin } from '@application/useCases/user/UserEmailLogin.usecase';
import { VerifyUser } from '@application/useCases/user/VerifyUser.usecase';
import {
   bcryptHashService,
   jwtService,
   kafkaPubliserService,
   otpService,
} from '../services.container';
import { userRepository } from '../repository.container';
import { creataAnonUser, resolveAnonUser } from './anonUsercase.container';
import { UserGoogleAuth } from '@application/useCases/user/googleAuth.usecase';

export const singupUser = new SignupUser(
   userRepository,
   jwtService,
   otpService,
   bcryptHashService,
   kafkaPubliserService
);

export const verifyUser = new VerifyUser(userRepository, jwtService, bcryptHashService);

export const userEmailLogin = new UserEmailLogin(
   userRepository,
   bcryptHashService,
   jwtService,
   creataAnonUser
);

export const refreshUserAccessToken = new RefreshUserAccessToken(
   userRepository,
   jwtService,
   resolveAnonUser,
   creataAnonUser
);

export const forgotPassoword = new ForgotPassword(userRepository, jwtService, kafkaPubliserService);

export const recoverPassword = new RecoverPassword(userRepository, jwtService, bcryptHashService);

export const userGooglgAuth = new UserGoogleAuth(userRepository, creataAnonUser, jwtService);
