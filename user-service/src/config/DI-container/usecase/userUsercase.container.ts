import { ForgotPassword } from '@application/useCases/user/ForgotPassword.usecase';
import { RecoverPassword } from '@application/useCases/user/RecoverPassword.usecase';
import { RefreshUserAccessToken } from '@application/useCases/user/RefreshUserToken.usecase';
import { SignupUser } from '@application/useCases/user/SignupUser.usecase';
import { UserEmailLogin } from '@application/useCases/user/UserEmailLogin.usecase';
import { VerifyUser } from '@application/useCases/user/VerifyUser.usecase';
import {
   bcryptHashService,
   jwtService,
   nodeMailerEmailService,
   otpService,
} from '../services.container';
import { mongoUserRespository } from '../repository.container';
import { creataAnonUser, resolveAnonUser } from './anonUsercase.container';

export const singupUser = new SignupUser(
   mongoUserRespository,
   jwtService,
   otpService,
   bcryptHashService,
   nodeMailerEmailService
);

export const verifyUser = new VerifyUser(mongoUserRespository, jwtService, bcryptHashService);

export const userEmailLogin = new UserEmailLogin(
   mongoUserRespository,
   bcryptHashService,
   jwtService,
   creataAnonUser
);

export const refreshUserAccessToken = new RefreshUserAccessToken(
   mongoUserRespository,
   jwtService,
   resolveAnonUser,
   creataAnonUser
);

export const forgotPassoword = new ForgotPassword(mongoUserRespository, jwtService);

export const recoverPassword = new RecoverPassword(
   mongoUserRespository,
   jwtService,
   bcryptHashService
);
