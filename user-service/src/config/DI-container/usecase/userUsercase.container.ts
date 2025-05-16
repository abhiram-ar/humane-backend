import { ForgotPassword } from '@application/useCases/user/ForgotPassword.usecase';
import { RecoverPassword } from '@application/useCases/user/RecoverPassword.usecase';
import { RefreshUserAccessToken } from '@application/useCases/user/RefreshUserToken.usecase';
import { SignupUser } from '@application/useCases/user/SignupUser.usecase';
import { UserEmailLogin } from '@application/useCases/user/UserEmailLogin.usecase';
import { VerifyUser } from '@application/useCases/user/VerifyUser.usecase';
import { userRepository } from '../repository.container';
import { UserGoogleAuth } from '@application/useCases/user/googleAuth.usecase';
import { awsStorageService } from '../services.container';
import { GetCurrentUserProfile } from '@application/useCases/user/GetCurrentUserProfile';
import { UpdateUserProfile } from '@application/useCases/user/UpdateUserProfile';
import { GeneratePresignedURL } from '@application/useCases/user/GeneratePresignedURL';
import { UpdateUserAvatar } from '@application/useCases/user/UpdateUserAvatar';
import { UpdateUserCoverPhoto } from '@application/useCases/user/UpdateUserCoverPhoto';
import {
   bcryptHashService,
   jwtService,
   kafkaPubliserService,
   otpService,
} from '../services.container';

export const singupUser = new SignupUser(
   userRepository,
   jwtService,
   otpService,
   bcryptHashService,
   kafkaPubliserService
);

// auth
export const verifyUser = new VerifyUser(userRepository, jwtService, bcryptHashService);

export const userEmailLogin = new UserEmailLogin(userRepository, bcryptHashService, jwtService);

export const refreshUserAccessToken = new RefreshUserAccessToken(userRepository, jwtService);

export const forgotPassoword = new ForgotPassword(userRepository, jwtService, kafkaPubliserService);

export const recoverPassword = new RecoverPassword(userRepository, jwtService, bcryptHashService);

export const userGooglgAuth = new UserGoogleAuth(userRepository, jwtService);

// profile

export const getCurrentUserProfile = new GetCurrentUserProfile(userRepository, awsStorageService);

export const updateUserProfile = new UpdateUserProfile(userRepository);

export const generatePresignedURL = new GeneratePresignedURL(awsStorageService);

export const updateUserAvatar = new UpdateUserAvatar(userRepository, awsStorageService);

export const updateUserCoverPhoto = new UpdateUserCoverPhoto(userRepository, awsStorageService);
