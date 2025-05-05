import express from 'express';
import { UserAuthController } from '../controllers/user.controller';
import { MongoUserRepository } from '../../infrastructure/persistance/mongoDB/repository/MongoUserRepository';
import { OTP } from '../../domain/services/otpGenerator';
import { JWTService } from '../../infrastructure/service/JWTService';
import { BcryptHashService } from '../../infrastructure/service/BcryptHashService';
import { VerifyUser } from '../../application/useCases/user/VerifyUser.usecase';
import { RefreshUserAccessToken } from '../../application/useCases/user/RefreshUserToken.usecase';
import { SignupUser } from '../../application/useCases/user/SignupUser.usecase';
import { UserEmailLogin } from '../../application/useCases/user/UserEmailLogin.usecase';
import { CreateAnonymousUser } from '@application/useCases/anonymous/CreateAnonymousUser.usercase';
import { MongoAnonymousUserRepository } from '@infrastructure/persistance/mongoDB/repository/MongoAnoymousUserRepository';
import { CryptoUUIDService } from '@infrastructure/service/CryptoUUIDService';
import { ResolveAnoymousUser } from '@application/useCases/anonymous/ResolveAnonymousUser.usecase';
import { ForgotPassword } from '@application/useCases/user/ForgotPassword.usecase';

const authRouter = express.Router();

const userRepository = new MongoUserRepository();
const anonUserRepository = new MongoAnonymousUserRepository();

const jwtService = new JWTService();
const otpService = new OTP();
const bcryptHashService = new BcryptHashService();
const cryptoUUIDService = new CryptoUUIDService();

const singupUser = new SignupUser(userRepository, jwtService, otpService, bcryptHashService);
const verifyUser = new VerifyUser(userRepository, jwtService, bcryptHashService);
const creataAnonUser = new CreateAnonymousUser(anonUserRepository, cryptoUUIDService);
const userEmailLogin = new UserEmailLogin(
   userRepository,
   bcryptHashService,
   jwtService,
   creataAnonUser
);
const resolveAnonUser = new ResolveAnoymousUser(anonUserRepository);
const refreshUserAccessToken = new RefreshUserAccessToken(
   userRepository,
   jwtService,
   resolveAnonUser,
   creataAnonUser
);
const forgotPassoword = new ForgotPassword(userRepository, jwtService);
const userAuthController = new UserAuthController(
   singupUser,
   verifyUser,
   userEmailLogin,
   refreshUserAccessToken,
   forgotPassoword
);

authRouter.post('/signup', userAuthController.signup);
authRouter.post('/verify', userAuthController.verify);
authRouter.post('/login/email', userAuthController.login);
authRouter.get('/refresh', userAuthController.refreshAccessToken);
authRouter.post('/logout', userAuthController.logout);
authRouter.post('/forgot-password', userAuthController.forgotPassword);

export default authRouter;
